import { useCallback, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { BZST_CONFIG } from '../config/bzst';
import { queryEvatrApi } from '../services/evatr';
import type { AppSettings, CheckRecord, QueueProgress } from '../types';

export function useCheckQueue(params: {
  records: CheckRecord[];
  setRecords: React.Dispatch<React.SetStateAction<CheckRecord[]>>;
  settings: AppSettings;
}) {
  const { records, setRecords, settings } = params;

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Queue-Referenzen zur Steuerung
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const activeWorkersRef = useRef(0);
  const queueIdsRef = useRef<string[]>([]);

  // Synchronisiere Ref mit State
  isRunningRef.current = isRunning;
  isPausedRef.current = isPaused;

  /**
   * Berechnet den aktuellen Fortschritt
   */
  const progress: QueueProgress = {
    total: records.length,
    checked: records.filter((r) => r.status !== 'NOT_CHECKED' && r.status !== 'CHECKING').length,
    valid: records.filter((r) => r.status === 'VALID').length,
    invalid: records.filter((r) => r.status === 'INVALID').length,
    mismatch: records.filter((r) => r.status === 'MISMATCH').length,
    error: records.filter((r) => r.status === 'ERROR').length,
    missingUstId: records.filter((r) => r.status === 'MISSING_USTID').length,
    inProgress: records.filter((r) => r.status === 'CHECKING').length,
    isRunning,
    isPaused,
  };

  /**
   * Prüft einen einzelnen Datensatz mit Exponential Backoff bei Fehlern
   */
  const processSingleRecord = async (
    record: CheckRecord,
    retryCount = 0
  ): Promise<void> => {
    // Wenn keine USt-Id vorhanden ist, direkt als MISSING_USTID markieren
    if (!record.ustId || record.ustId.trim() === '') {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? {
                ...r,
                status: 'MISSING_USTID',
                resultSummary: 'Keine USt-IdNr. gepflegt ❌',
                detailedStatus: 'Für diesen Datensatz ist keine USt-IdNr. hinterlegt.',
                checkedAt: new Date().toISOString(),
              }
            : r
        )
      );
      return;
    }

    // Status auf 'CHECKING' setzen
    setRecords((prev) =>
      prev.map((r) => (r.id === record.id ? { ...r, status: 'CHECKING' } : r))
    );

    const apiResult = await queryEvatrApi({
      eigeneUstId: settings.eigeneUstId,
      record,
      mode: settings.mode,
      timeoutSec: settings.timeoutSec,
      useProxy: settings.useProxy,
    });

    // Prüfen ob Retry bei technischem Fehler angebracht ist
    const shouldRetry =
      apiResult.status === 'ERROR' &&
      settings.autoRetry &&
      retryCount < BZST_CONFIG.MAX_RETRIES;

    if (shouldRetry) {
      const delay = BZST_CONFIG.BACKOFF_BASE_MS * Math.pow(2, retryCount);
      await new Promise((res) => setTimeout(res, delay));

      // Erneuter Versuch
      return processSingleRecord(record, retryCount + 1);
    }

    // Ergebnis in den State übernehmen
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: apiResult.status,
              resultSummary: apiResult.resultSummary,
              detailedStatus: apiResult.detailedStatus,
              rawRequest: apiResult.rawRequest,
              rawResponse: apiResult.rawResponse,
              errorCode: apiResult.errorCode,
              errorMessage: apiResult.errorMessage,
              checkedAt: apiResult.checkedAt,
              comparison: apiResult.comparison,
              retryCount,
            }
          : r
      )
    );
  };

  /**
   * Queue-Worker Pumpe
   */
  const pumpQueue = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current) return;

    // Freie Worker-Slots belegen
    while (
      activeWorkersRef.current < settings.concurrency &&
      queueIdsRef.current.length > 0 &&
      isRunningRef.current &&
      !isPausedRef.current
    ) {
      const nextId = queueIdsRef.current.shift();
      if (!nextId) break;

      activeWorkersRef.current++;

      // Finde aktuellen Record aus Referenz
      const currentRecord = records.find((r) => r.id === nextId);
      if (!currentRecord) {
        activeWorkersRef.current--;
        continue;
      }

      processSingleRecord(currentRecord, 0)
        .catch((err) => {
          console.error(`Fehler bei Prüfung von ${currentRecord.ustId}:`, err);
        })
        .finally(() => {
          activeWorkersRef.current--;

          // Wenn Queue leer und keine Worker mehr aktiv -> Fertig!
          if (queueIdsRef.current.length === 0 && activeWorkersRef.current === 0) {
            setIsRunning(false);
            isRunningRef.current = false;

            // Feier-Effekt (Confetti) bei erfolgreichem Abschluss
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // Ignore confetti error if unavailable
            }
          } else {
            pumpQueue();
          }
        });
    }
  }, [records, settings.concurrency, settings.eigeneUstId, settings.mode, settings.timeoutSec, settings.useProxy, settings.autoRetry]);

  /**
   * Startet die Prüfung für alle oder ausgewählte Datensätze
   */
  const startCheck = useCallback(
    (targetIds?: string[]) => {
      let idsToProcess: string[];

      if (targetIds && targetIds.length > 0) {
        idsToProcess = [...targetIds];
      } else {
        // Alle ungeprüften oder fehlerhaften Datensätze prüfen
        idsToProcess = records
          .filter((r) => r.status === 'NOT_CHECKED' || r.status === 'ERROR')
          .map((r) => r.id);

        // Falls alle bereits geprüft wurden, alle nochmals prüfen
        if (idsToProcess.length === 0) {
          idsToProcess = records.map((r) => r.id);
        }
      }

      if (idsToProcess.length === 0) return;

      queueIdsRef.current = idsToProcess;
      setIsRunning(true);
      setIsPaused(false);
      isRunningRef.current = true;
      isPausedRef.current = false;

      // Initiiere Worker
      pumpQueue();
    },
    [records, pumpQueue]
  );

  /**
   * Pausiert die Prüfung
   */
  const pauseCheck = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
  }, []);

  /**
   * Setzt die Prüfung fort
   */
  const resumeCheck = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false;
    pumpQueue();
  }, [pumpQueue]);

  /**
   * Bricht die Prüfung ab
   */
  const cancelCheck = useCallback(() => {
    queueIdsRef.current = [];
    setIsRunning(false);
    setIsPaused(false);
    isRunningRef.current = false;
    isPausedRef.current = false;
  }, []);

  /**
   * Setzt alle Prüfstatus zurück auf "Nicht geprüft"
   */
  const resetAllStatuses = useCallback(() => {
    cancelCheck();
    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        status: !r.ustId ? 'MISSING_USTID' : 'NOT_CHECKED',
        resultSummary: !r.ustId ? 'Keine USt-IdNr. gepflegt ❌' : undefined,
        detailedStatus: undefined,
        rawRequest: undefined,
        rawResponse: undefined,
        errorCode: undefined,
        errorMessage: undefined,
        checkedAt: undefined,
        comparison: undefined,
        retryCount: 0,
      }))
    );
  }, [cancelCheck, setRecords]);

  return {
    progress,
    isRunning,
    isPaused,
    startCheck,
    pauseCheck,
    resumeCheck,
    cancelCheck,
    resetAllStatuses,
    processSingleRecord,
  };
}
