import React, { useRef, useState } from 'react';
import {
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Plus,
  UploadCloud,
  X,
} from 'lucide-react';
import { getKundenListe2026Records } from '../data/kundenListe2026';
import type { CheckRecord } from '../types';
import { parseCsvFile, parsePastedText } from '../utils/csv';
import { cleanUstId, validateEuUstId } from '../utils/validation';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecords: (records: CheckRecord[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onAddRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'csv' | 'manual' | 'pdf'>('paste');

  // State für Copy & Paste
  const [pasteText, setPasteText] = useState('');

  // State für Manuelle Eingabe
  const [manualKdNr, setManualKdNr] = useState('');
  const [manualUstId, setManualUstId] = useState('');
  const [manualFirmenname, setManualFirmenname] = useState('');
  const [manualOrt, setManualOrt] = useState('');
  const [manualStrasse, setManualStrasse] = useState('');
  const [manualPlz, setManualPlz] = useState('');

  // State für CSV Drag & Drop
  const [isDragging, setIsDragging] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Copy & Paste Import
  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    const records = parsePastedText(pasteText);
    if (records.length > 0) {
      onAddRecords(records);
      setPasteText('');
      onClose();
    }
  };

  // 2. CSV Datei Upload
  const handleFileUpload = async (file: File) => {
    setCsvError(null);
    try {
      const { records } = await parseCsvFile(file);
      if (records.length === 0) {
        setCsvError('Die Datei enthält keine verwertbaren Zeilen.');
        return;
      }
      onAddRecords(records);
      onClose();
    } catch (err: any) {
      setCsvError(err.message || 'Fehler beim Parsen der CSV-Datei.');
    }
  };

  // 3. Manuelle Einzelzeile
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanUstId(manualUstId);
    const validation = validateEuUstId(cleaned);

    let initialStatus: CheckRecord['status'] = 'NOT_CHECKED';
    let resultSummary: string | undefined = undefined;

    if (!cleaned) {
      initialStatus = 'MISSING_USTID';
      resultSummary = 'Keine USt-IdNr. gepflegt ❌';
    } else if (validation.isGerman) {
      initialStatus = 'INVALID';
      resultSummary = 'Deutsche USt-IdNr. ❌';
    } else if (!validation.valid && validation.notes.length > 0) {
      resultSummary = 'Format-Warnung ⚠️';
    }

    const newRecord: CheckRecord = {
      id: `manual-${Date.now()}`,
      kdNr: manualKdNr.trim() || undefined,
      ustId: cleaned,
      firmenname: manualFirmenname.trim() || undefined,
      ort: manualOrt.trim() || undefined,
      strasse: manualStrasse.trim() || undefined,
      plz: manualPlz.trim() || undefined,
      status: initialStatus,
      resultSummary,
      retryCount: 0,
      validationNotes: validation.notes.length > 0 ? validation.notes : undefined,
    };

    onAddRecords([newRecord]);
    setManualKdNr('');
    setManualUstId('');
    setManualFirmenname('');
    setManualOrt('');
    setManualStrasse('');
    setManualPlz('');
    onClose();
  };

  // 4. Kundenliste 2026 laden
  const handleLoadKundenliste = () => {
    const list = getKundenListe2026Records();
    onAddRecords(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 m-0">
              Datensätze hinzufügen / importieren
            </h2>
            <p className="text-xs text-slate-500 m-0">
              Wählen Sie die gewünschte Erfassungsmethode
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab-Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50/50 gap-2">
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'paste'
                ? 'border-[#1275bb] text-[#1275bb]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Copy & Paste</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'csv'
                ? 'border-[#1275bb] text-[#1275bb]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV-Datei Upload</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'manual'
                ? 'border-[#1275bb] text-[#1275bb]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Manuelle Einzelzeile</span>
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'pdf'
                ? 'border-[#1275bb] text-[#1275bb]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Kundenliste (PDF 2026)</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto">
          {/* TAB 1: Copy & Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  USt-IdNrn. oder tabellarische Daten einfügen
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Trenner: Zeilenumbrüche, Kommas, Semikolons, Tabulatoren oder Leerzeichen.
                  Tabellen aus Excel (z.B. mit Spalten USt-ID, Name, Ort) werden automatisch erkannt.
                </p>
                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Beispiel 1: Liste von USt-IdNrn.
ATU12345678, IT07983941217; DK30720121
ESB60562956
BE0412737671

Beispiel 2: Tabelle mit Kopfzeile
ust_id;firmenname;ort
ATU12345678;Musterhaus GmbH;Wien
IT07983941217;DITTA BERGAVI;Neapel`}
                  className="w-full p-3 font-mono-code text-xs border border-slate-300 rounded-lg focus:border-[#1275bb] focus:ring-2 focus:ring-[#1275bb]/20 bg-slate-50"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  disabled={!pasteText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#1275bb] hover:bg-[#0f5d96] text-white rounded-md shadow-sm disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Datensätze übernehmen</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CSV Upload */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#1275bb] bg-sky-50'
                    : 'border-slate-300 hover:border-[#1275bb] bg-slate-50/50 hover:bg-sky-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <UploadCloud className="w-10 h-10 text-[#1275bb] mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-800">
                  CSV-Datei hierher ziehen oder durchsuchen
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Unterstützte Spalten: <span className="font-mono-code font-medium">ust_id</span>,{' '}
                  <span className="font-mono-code font-medium">firmenname</span>,{' '}
                  <span className="font-mono-code font-medium">ort</span>,{' '}
                  <span className="font-mono-code font-medium">strasse</span>,{' '}
                  <span className="font-mono-code font-medium">plz</span>
                </p>
              </div>

              {csvError && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-200">
                  {csvError}
                </p>
              )}
            </div>
          )}

          {/* TAB 3: Manuelle Eingabe */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    USt-IdNr. (Zielnummer)
                  </label>
                  <input
                    type="text"
                    value={manualUstId}
                    onChange={(e) => setManualUstId(e.target.value.toUpperCase())}
                    placeholder="z. B. ATU12345678 (optional leer lassen)"
                    className="w-full px-3 py-1.5 font-mono-code text-xs border border-slate-300 rounded focus:border-[#1275bb] focus:ring-1 focus:ring-[#1275bb]"
                  />
                  <span className="text-[10px] text-slate-400">
                    Muss ein ausländisches EU-Präfix haben. Wenn leer, wird Datensatz ohne Nr. erfasst.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kundennummer (KD-Nr)
                  </label>
                  <input
                    type="text"
                    value={manualKdNr}
                    onChange={(e) => setManualKdNr(e.target.value)}
                    placeholder="z. B. KD-10024"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-[#1275bb] focus:ring-1 focus:ring-[#1275bb]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Firmenname
                  </label>
                  <input
                    type="text"
                    value={manualFirmenname}
                    onChange={(e) => setManualFirmenname(e.target.value)}
                    placeholder="Vollständiger Firmenname"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-[#1275bb] focus:ring-1 focus:ring-[#1275bb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Straße & Hausnummer
                  </label>
                  <input
                    type="text"
                    value={manualStrasse}
                    onChange={(e) => setManualStrasse(e.target.value)}
                    placeholder="Musterstraße 12"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-[#1275bb] focus:ring-1 focus:ring-[#1275bb]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PLZ
                    </label>
                    <input
                      type="text"
                      value={manualPlz}
                      onChange={(e) => setManualPlz(e.target.value)}
                      placeholder="12345"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-[#1275bb] focus:ring-1 focus:ring-[#1275bb]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ort / Stadt
                    </label>
                    <input
                      type="text"
                      value={manualOrt}
                      onChange={(e) => setManualOrt(e.target.value)}
                      placeholder="Musterort"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-[#1275bb] focus:ring-1 focus:ring-[#1275bb]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#1275bb] hover:bg-[#0f5d96] text-white rounded-md shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Datensatz anlegen</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Kundenliste PDF 2026 */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1275bb] text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 m-0">
                      Kundenliste „UST-ID-Nr 2026 SK.pdf“ (Zahn Pinsel GmbH)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Lädt den gesamten Kundenstamm aus Ihrer PDF-Vorlage mit 170+ Datensätzen:
                    </p>
                    <ul className="text-xs text-slate-600 mt-2 space-y-1 list-disc list-inside">
                      <li>Kunden aus IT, AT, DK, ES, GR, BE, SE, FI, PT, PL, CZ, SK, HU, RO, BG, HR, SI, LU, EE, LV, LT</li>
                      <li>
                        <strong>Firmen ohne USt-IdNr.</strong> (z. B. Mark-John Limited, Verona Nails, Abraham Karl Selig) werden mit Namen und rotem Kreuz ❌ aufgeführt
                      </li>
                      <li>
                        <strong>Deutsche USt-IdNrn.</strong> (z. B. Kess Berlin GmbH) werden mit Warnhinweis markiert
                      </li>
                      <li>
                        <strong>Drittland-Kunden</strong> (z. B. Moldawien) werden ausgewiesen
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleLoadKundenliste}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#1275bb] hover:bg-[#0e5c94] text-white rounded-lg shadow-sm transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>170+ Datensätze aus PDF sofort laden</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
