import { BZST_CONFIG } from '../config/bzst';
import type {
  CheckMode,
  CheckRecord,
  EvatrRequestPayload,
  EvatrResponsePayload,
} from '../types';

export interface CheckApiResult {
  status: CheckRecord['status'];
  resultSummary: string;
  detailedStatus: string;
  rawRequest: EvatrRequestPayload;
  rawResponse?: EvatrResponsePayload | Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
  checkedAt: string;
  comparison?: CheckRecord['comparison'];
}

/**
 * Führt eine Bestätigungsabfrage an die BZSt eVatR API durch
 */
export async function queryEvatrApi(params: {
  eigeneUstId: string;
  record: CheckRecord;
  mode: CheckMode;
  timeoutSec: number;
  useProxy?: boolean;
}): Promise<CheckApiResult> {
  const { eigeneUstId, record, mode, timeoutSec, useProxy = false } = params;

  // Zeitstempel der Anfrage
  const checkedAt = new Date().toISOString();

  // Keine USt-IdNr. vorhanden
  if (!record.ustId || record.ustId.trim() === '') {
    return {
      status: 'MISSING_USTID',
      resultSummary: 'Keine USt-IdNr. gepflegt',
      detailedStatus: 'Für diesen Datensatz ist keine USt-IdNr. hinterlegt. Eine Bestätigungsabfrage ist nicht möglich.',
      rawRequest: {
        anfragendeUstid: eigeneUstId,
        angefragteUstid: '',
      },
      checkedAt,
      errorCode: 'MISSING_USTID',
      errorMessage: 'USt-IdNr. fehlt',
    };
  }

  // Deutsche USt-IdNr. als angefragte Nummer ist laut BZSt nicht zulässig
  if (record.ustId.toUpperCase().startsWith('DE')) {
    return {
      status: 'INVALID',
      resultSummary: 'Deutsche USt-IdNr. (Nicht prüfbar)',
      detailedStatus: 'Deutsche USt-IdNrn. können nicht über die eVatR-Schnittstelle geprüft werden. Nur ausländische EU-Umsatzsteuer-Identifikationsnummern sind zulässig.',
      rawRequest: {
        anfragendeUstid: eigeneUstId,
        angefragteUstid: record.ustId,
      },
      checkedAt,
      errorCode: 'DE_NOT_ALLOWED',
      errorMessage: 'Deutsche USt-IdNr. als Zielnummer unzulässig.',
    };
  }

  // Request-Body zusammenstellen
  const requestPayload: EvatrRequestPayload = {
    anfragendeUstid: eigeneUstId,
    angefragteUstid: record.ustId,
  };

  // Qualifizierter Modus prüfen
  const hasQualifiedData = Boolean(record.firmenname && record.ort);
  if (mode === 'QUALIFIED') {
    if (hasQualifiedData) {
      requestPayload.firmenname = record.firmenname;
      requestPayload.ort = record.ort;
      if (record.strasse) requestPayload.strasse = record.strasse;
      if (record.plz) requestPayload.plz = record.plz;
    } else {
      // Qualifizierte Prüfung gewünscht, aber Mindestangaben fehlen
      return {
        status: 'MISMATCH',
        resultSummary: 'Qualifiziert nicht prüfbar',
        detailedStatus: 'Für eine qualifizierte Bestätigungsabfrage müssen mindestens Firmenname und Ort angegeben sein.',
        rawRequest: requestPayload,
        checkedAt,
        errorCode: 'QUALIFIED_DATA_MISSING',
        errorMessage: 'Firmenname und/oder Ort fehlen für die qualifizierte Prüfung.',
      };
    }
  }

  // Endpunkt bestimmen (Vite Proxy oder Direkte URL)
  const endpoint = useProxy ? BZST_CONFIG.PROXY_API_URL : BZST_CONFIG.DIRECT_API_URL;

  // Timeout-Handling mit AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutSec * 1000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Antwort als JSON parsen
    let responseData: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { rawText: text };
      }
    }

    // Statuscode aus BZSt-Antwort (z. B. "evatr-0000", "evatr-0005", "evatr-2001")
    const evatrCode: string = responseData?.status || `HTTP_${response.status}`;
    const codeMeta = BZST_CONFIG.STATUS_CODES[evatrCode];

    // Statusauswertung
    let finalStatus: CheckRecord['status'] = 'INVALID';
    let resultSummary = codeMeta?.label || `BZSt-Status: ${evatrCode}`;
    let detailedStatus = codeMeta?.description || `HTTP Status ${response.status}`;

    // Vergleichsergebnisse bei qualifizierter Abfrage
    let comparison: CheckRecord['comparison'] | undefined;
    if (responseData?.ergFirmenname || responseData?.ergOrt || responseData?.ergStrasse || responseData?.ergPlz) {
      comparison = {
        firmenname: responseData.ergFirmenname,
        ort: responseData.ergOrt,
        strasse: responseData.ergStrasse,
        plz: responseData.ergPlz,
      };
    }

    if (response.ok && evatrCode === 'evatr-0000') {
      if (mode === 'QUALIFIED' && comparison) {
        // Prüfen, ob Abweichungen vorliegen (B = stimmt nicht überein)
        const hasMismatch = Object.values(comparison).some((v) => v === 'B');
        if (hasMismatch) {
          finalStatus = 'MISMATCH';
          resultSummary = 'Gültig mit Abweichungen';
          detailedStatus = 'Die USt-IdNr. ist gültig, aber einzelne Adressangaben weichen von den hinterlegten Behördendaten ab.';
        } else {
          finalStatus = 'VALID';
          resultSummary = 'Vollständig gültig';
          detailedStatus = 'Die USt-IdNr. ist gültig und alle abgefragten Firmendaten stimmen überein.';
        }
      } else {
        finalStatus = 'VALID';
        resultSummary = 'Gültig';
        detailedStatus = codeMeta?.description || 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig.';
      }
    } else if (evatrCode === 'evatr-2008') {
      finalStatus = 'VALID';
      resultSummary = 'Gültig (Besonderheit)';
    } else if (response.status >= 500 || evatrCode.startsWith('evatr-1') || evatrCode.startsWith('evatr-3')) {
      finalStatus = 'ERROR';
      resultSummary = 'Server- / Verbindungsfehler';
    } else {
      finalStatus = 'INVALID';
    }

    return {
      status: finalStatus,
      resultSummary,
      detailedStatus,
      rawRequest: requestPayload,
      rawResponse: responseData,
      errorCode: evatrCode,
      checkedAt,
      comparison,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    const isTimeout = error.name === 'AbortError';
    const isNetwork = error instanceof TypeError || error.message?.includes('fetch') || error.message?.includes('Network');

    const errorCode = isTimeout ? 'TIMEOUT' : isNetwork ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
    const errorMessage = isTimeout
      ? `Zeitüberschreitung nach ${timeoutSec}s. Der BZSt-Server hat nicht rechtzeitig geantwortet.`
      : isNetwork
      ? 'Netzwerkfehler: Verbindung zum BZSt-Server fehlgeschlagen (ggf. CORS oder keine Internetverbindung).'
      : (error.message || 'Unbekannter Fehler bei der Abfrage');

    return {
      status: 'ERROR',
      resultSummary: isTimeout ? 'Zeitüberschreitung' : 'Netzwerkfehler',
      detailedStatus: errorMessage,
      rawRequest: requestPayload,
      errorCode,
      errorMessage,
      checkedAt,
    };
  }
}
