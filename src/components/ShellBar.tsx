import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  Settings,
  ShieldCheck,
  Upload,
} from 'lucide-react';

interface ShellBarProps {
  onOpenSettings: () => void;
  onOpenImport: () => void;
  onLoadPdfData: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  totalCount: number;
}

export const ShellBar: React.FC<ShellBarProps> = ({
  onOpenSettings,
  onOpenImport,
  onLoadPdfData,
  onExportCsv,
  onExportJson,
  totalCount,
}) => {
  return (
    <header className="bg-[#001a33] text-white border-b border-[#0f3459] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Titel */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#1275bb] to-[#0099ff] flex items-center justify-center shadow-md border border-sky-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white m-0">
                  USt-ID Bulk Checker
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-900/80 text-sky-200 border border-sky-700">
                  BZSt eVatR API
                </span>
              </div>
              <p className="text-xs text-slate-300 m-0 flex items-center gap-1.5">
                <span>Offizielle Prüfung ausländischer EU-Umsatzsteuer-Identifikationsnummern</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Kundenliste 2026 Direkt-Import */}
            <button
              onClick={onLoadPdfData}
              title="Lädt die 170+ Datensätze aus der Kundenliste 'UST-ID-Nr 2026 SK.pdf'"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#1275bb] hover:bg-[#0e5c94] text-white shadow-sm border border-sky-400/40 transition-colors"
            >
              <FileText className="w-4 h-4 text-sky-200" />
              <span className="hidden md:inline">Kundenliste 2026 (PDF)</span>
              <span className="md:hidden">PDF-Liste</span>
            </button>

            {/* Daten importieren */}
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Import / Paste</span>
            </button>

            {/* Export Dropdown / Buttons */}
            {totalCount > 0 && (
              <div className="flex items-center space-x-1 bg-slate-800/90 rounded-md p-0.5 border border-slate-700">
                <button
                  onClick={onExportCsv}
                  title="Export als CSV für Excel"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={onExportJson}
                  title="Export als vollständiges JSON"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors"
                >
                  <span>JSON</span>
                </button>
              </div>
            )}

            {/* Einstellungen */}
            <button
              onClick={onOpenSettings}
              title="Einstellungen & eigene USt-IdNr."
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
