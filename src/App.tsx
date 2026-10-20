import { useEffect, useState } from 'react';
import {
  Building2,
  ExternalLink,
} from 'lucide-react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DataTable } from './components/DataTable';
import { DetailModal } from './components/DetailModal';
import { ImportModal } from './components/ImportModal';
import { MetricCards } from './components/MetricCards';
import { SettingsPanel } from './components/SettingsPanel';
import { ShellBar } from './components/ShellBar';
import { BZST_CONFIG } from './config/bzst';
import { getKundenListe2026Records } from './data/kundenListe2026';
import { useCheckQueue } from './hooks/useCheckQueue';
import type { AppSettings, CheckRecord, FilterOptions } from './types';
import { exportToCsv, exportToJson } from './utils/csv';

const SETTINGS_STORAGE_KEY = 'ust_id_checker_settings_v1';
const RECORDS_STORAGE_KEY = 'ust_id_checker_records_v1';

export function App() {
  // 1. Einstellungen (mit localStorage-Persistenz)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      eigeneUstId: BZST_CONFIG.DEFAULT_EIGENE_USTID, // DE811179766
      mode: 'SIMPLE',
      concurrency: BZST_CONFIG.DEFAULT_CONCURRENCY,
      timeoutSec: BZST_CONFIG.DEFAULT_TIMEOUT_SEC,
      autoRetry: true,
      useProxy: false,
    };
  });

  // Einstellungen in localStorage sichern
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // 2. Datensätze (Initial mit Kundenliste 2026 aus der PDF-Vorlage)
  const [records, setRecords] = useState<CheckRecord[]>(() => {
    try {
      const saved = localStorage.getItem(RECORDS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    // Vorbelegung mit Kundenliste 2026 (170+ Datensätze)
    return getKundenListe2026Records();
  });

  // Datensätze in localStorage sichern
  useEffect(() => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Quota exceeded
    }
  }, [records]);

  // 3. Markierte Datensätze
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 4. Filter & Suche
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    statusFilter: 'ALL',
    countryFilter: '',
  });

  // 5. Modal-Zustände
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<CheckRecord | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

  // 6. Queue Hook
  const {
    progress,
    startCheck,
    pauseCheck,
    resumeCheck,
    cancelCheck,
    resetAllStatuses,
    processSingleRecord,
  } = useCheckQueue({
    records,
    setRecords,
    settings,
  });

  // Checkbox-Auswahl umschalten
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Alle auswählen umschalten
  const handleToggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  // Datensätze hinzufügen
  const handleAddRecords = (newRecords: CheckRecord[]) => {
    setRecords((prev) => [...newRecords, ...prev]);
  };

  // Kundenliste 2026 neu laden
  const handleLoadPdfData = () => {
    const list = getKundenListe2026Records();
    setRecords(list);
    setSelectedIds(new Set());
  };

  // Einzelne Zeile löschen
  const handleDeleteSingle = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Ausgewählte löschen
  const handleDeleteSelected = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Ausgewählte Datensätze löschen?',
      message: `Möchten Sie ${selectedIds.size} markierte Datensätze wirklich unwiderruflich aus der Liste entfernen?`,
      isDestructive: true,
      onConfirm: () => {
        setRecords((prev) => prev.filter((r) => !selectedIds.has(r.id)));
        setSelectedIds(new Set());
        setConfirmDialog(null);
      },
    });
  };

  // Alle löschen
  const handleDeleteAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Alle Datensätze löschen?',
      message: 'Möchten Sie alle Datensätze wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      isDestructive: true,
      onConfirm: () => {
        cancelCheck();
        setRecords([]);
        setSelectedIds(new Set());
        setConfirmDialog(null);
      },
    });
  };

  // Duplikate entfernen
  const handleRemoveDuplicates = () => {
    const seen = new Set<string>();
    const cleanedRecords: CheckRecord[] = [];

    records.forEach((r) => {
      if (r.ustId) {
        if (seen.has(r.ustId)) {
          return;
        }
        seen.add(r.ustId);
      }
      cleanedRecords.push({ ...r, isDuplicate: false });
    });

    setRecords(cleanedRecords);
  };

  // Export
  const handleExportCsv = () => {
    exportToCsv(records, `ust_id_pruefung_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportJson = () => {
    exportToJson(records, `ust_id_pruefung_${new Date().toISOString().slice(0, 10)}.json`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f8]">
      {/* ShellBar (Fiori Horizon Header) */}
      <ShellBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onLoadPdfData={handleLoadPdfData}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        totalCount={records.length}
      />

      {/* Hauptbereich */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Informations- und Statusbanner */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1275bb] border border-sky-200 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Anfragende DE USt-IdNr.:</span>
                <strong className="font-mono-code font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {settings.eigeneUstId}
                </strong>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-[#1275bb] hover:underline font-semibold ml-1"
                >
                  Ändern
                </button>
              </div>
              <p className="text-slate-500 mt-0.5 m-0">
                Prüfmodus:{' '}
                <strong className="text-slate-700">
                  {settings.mode === 'QUALIFIED'
                    ? 'Qualifizierte Bestätigung (Firma, Ort, Straße, PLZ)'
                    : 'Einfache Bestätigung (nur USt-IdNr.)'}
                </strong>{' '}
                • Parallelität: {settings.concurrency} Requests • Timeout: {settings.timeoutSec}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <a
              href="https://api.evatr.vies.bzst.de/api-docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-[#1275bb] transition-colors"
            >
              <span>BZSt OpenAPI Doku</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* KPI Kacheln & Fortschrittsbalken */}
        <MetricCards
          progress={progress}
          activeFilter={filters.statusFilter}
          onSelectFilter={(sf) => setFilters((prev) => ({ ...prev, statusFilter: sf }))}
          onStartAll={() => startCheck()}
          onPause={pauseCheck}
          onResume={resumeCheck}
          onCancel={cancelCheck}
          onReset={resetAllStatuses}
          selectedCount={selectedIds.size}
          onStartSelected={() => startCheck(Array.from(selectedIds))}
        />

        {/* Enterprise Datentabelle */}
        <DataTable
          records={records}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onCheckSingle={(rec) => processSingleRecord(rec, 0)}
          onOpenDetail={(rec) => setDetailRecord(rec)}
          onDeleteSingle={handleDeleteSingle}
          onDeleteSelected={handleDeleteSelected}
          onDeleteAll={handleDeleteAll}
          onRemoveDuplicates={handleRemoveDuplicates}
          filters={filters}
          setFilters={setFilters}
          onOpenImport={() => setIsImportOpen(true)}
          onLoadPdfData={handleLoadPdfData}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="m-0">
            USt-ID Bulk Checker • Entwickelt für automatisierte BZSt-eVatR Bestätigungsabfragen (Zahn Pinsel GmbH)
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>✔ Gültig</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>❌ Ungültig / Fehlt</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>⚠️ Abweichung</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>⏳ Offen</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onLoadTestRecord={(record) => {
          setRecords((prev) => [record, ...prev]);
        }}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onAddRecords={handleAddRecords}
      />

      <DetailModal
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onCheckSingle={(rec) => {
          processSingleRecord(rec, 0);
          setDetailRecord(null);
        }}
      />

      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}

export default App;
