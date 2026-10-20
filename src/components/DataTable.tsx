import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Play,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { BZST_CONFIG } from '../config/bzst';
import type { CheckRecord, FilterOptions } from '../types';

interface DataTableProps {
  records: CheckRecord[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onCheckSingle: (record: CheckRecord) => void;
  onOpenDetail: (record: CheckRecord) => void;
  onDeleteSingle: (id: string) => void;
  onDeleteSelected: () => void;
  onDeleteAll: () => void;
  onRemoveDuplicates: () => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onOpenImport: () => void;
  onLoadPdfData: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  records,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onCheckSingle,
  onOpenDetail,
  onDeleteSingle,
  onDeleteSelected,
  onDeleteAll,
  onRemoveDuplicates,
  filters,
  setFilters,
  onOpenImport,
  onLoadPdfData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Duplikate zählen
  const duplicateCount = useMemo(
    () => records.filter((r) => r.isDuplicate).length,
    [records]
  );

  // Verfügbare Länder extrahieren
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.ustId && r.ustId.length >= 2) {
        set.add(r.ustId.slice(0, 2).toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [records]);

  // Gefilterte Datensätze
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Suche
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = (r.firmenname || '').toLowerCase().includes(query);
        const matchesUstId = (r.ustId || '').toLowerCase().includes(query);
        const matchesOrt = (r.ort || '').toLowerCase().includes(query);
        const matchesKdNr = (r.kdNr || '').toLowerCase().includes(query);
        if (!matchesName && !matchesUstId && !matchesOrt && !matchesKdNr) {
          return false;
        }
      }

      // 2. Status-Filter
      if (filters.statusFilter !== 'ALL') {
        if (filters.statusFilter === 'ONLY_VALID') {
          if (r.status !== 'VALID') return false;
        } else if (filters.statusFilter === 'ONLY_INVALID') {
          if (r.status !== 'INVALID' && r.status !== 'ERROR' && r.status !== 'MISSING_USTID') {
            return false;
          }
        } else {
          if (r.status !== filters.statusFilter) return false;
        }
      }

      // 3. Länder-Filter
      if (filters.countryFilter) {
        if (!r.ustId || !r.ustId.toUpperCase().startsWith(filters.countryFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [records, filters]);

  // Paginierung
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Status Badge Rendering
  const renderStatusBadge = (r: CheckRecord) => {
    switch (r.status) {
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gültig ✔</span>
          </span>
        );
      case 'INVALID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ungültig ❌</span>
          </span>
        );
      case 'MISSING_USTID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200" title="Keine USt-IdNr. gepflegt">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Fehlt ❌</span>
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Abweichung ⚠️</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Fehler ❌</span>
          </span>
        );
      case 'CHECKING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            <span>In Prüfung...</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span>Offen</span>
          </span>
        );
    }
  };

  // Mini-Badge für qualifizierte Abgleichsergebnisse A/B/C/D
  const renderComparisonChips = (r: CheckRecord) => {
    if (!r.comparison) return <span className="text-slate-400 text-xs">-</span>;
    const { firmenname, ort, strasse, plz } = r.comparison;

    const chipColor = (val?: string) => {
      if (val === 'A') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      if (val === 'B') return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      if (val === 'D') return 'bg-amber-100 text-amber-800 border-amber-300';
      return 'bg-slate-100 text-slate-500 border-slate-200';
    };

    return (
      <div className="flex items-center gap-1 font-mono-code text-[10px]">
        <span className={`px-1 py-0.2 rounded border ${chipColor(firmenname)}`} title={`Firma: ${firmenname}`}>
          F:{firmenname || '-'}
        </span>
        <span className={`px-1 py-0.2 rounded border ${chipColor(ort)}`} title={`Ort: ${ort}`}>
          O:{ort || '-'}
        </span>
        {strasse && (
          <span className={`px-1 py-0.2 rounded border ${chipColor(strasse)}`} title={`Straße: ${strasse}`}>
            S:{strasse}
          </span>
        )}
        {plz && (
          <span className={`px-1 py-0.2 rounded border ${chipColor(plz)}`} title={`PLZ: ${plz}`}>
            P:{plz}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Filterleiste (Fiori Toolbar) */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Suche & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Suchfeld */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Suchen nach Name, USt-ID, Ort, KD-Nr..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-[#1275bb] focus:ring-1 focus:ring-[#1275bb] text-slate-900"
            />
          </div>

          {/* Statusfilter Dropdown */}
          <select
            value={filters.statusFilter}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                statusFilter: e.target.value as any,
              }));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-[#1275bb] text-slate-700"
          >
            <option value="ALL">Alle Status anzeigen</option>
            <option value="ONLY_VALID">Nur Gültig ✔</option>
            <option value="ONLY_INVALID">Nur Ungültig / Fehler / Fehlt ❌</option>
            <option value="VALID">Status: Gültig</option>
            <option value="INVALID">Status: Ungültig</option>
            <option value="MISSING_USTID">Status: Keine USt-IdNr.</option>
            <option value="MISMATCH">Status: Abweichung ⚠️</option>
            <option value="ERROR">Status: Technischer Fehler</option>
            <option value="NOT_CHECKED">Status: Offen (Ungeprüft)</option>
          </select>

          {/* Länderfilter Dropdown */}
          {availableCountries.length > 0 && (
            <select
              value={filters.countryFilter}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, countryFilter: e.target.value }));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-[#1275bb] text-slate-700"
            >
              <option value="">Alle EU-Länder</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c} - {BZST_CONFIG.EU_COUNTRIES.find((x) => x.code === c)?.name || c}
                </option>
              ))}
            </select>
          )}

          {/* Duplikate Button */}
          {duplicateCount > 0 && (
            <button
              onClick={onRemoveDuplicates}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors"
            >
              <span>{duplicateCount} Duplikate entfernen</span>
            </button>
          )}
        </div>

        {/* Bulk-Aktionen */}
        <div className="flex items-center space-x-2 shrink-0">
          {selectedIds.size > 0 && (
            <button
              onClick={onDeleteSelected}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{selectedIds.size} löschen</span>
            </button>
          )}

          {records.length > 0 && (
            <button
              onClick={onDeleteAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-300 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Alle löschen</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto flex-1">
        {records.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-sky-50 text-[#1275bb] flex items-center justify-center mx-auto mb-4 border border-sky-100">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 m-0">
              Keine Datensätze vorhanden
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Laden Sie Ihre Vorlage oder importieren Sie eine Liste von ausländischen EU-Umsatzsteuer-Identifikationsnummern.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onLoadPdfData}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#1275bb] hover:bg-[#0f5d96] text-white shadow-sm transition-colors"
              >
                <span>Kundenliste (PDF 2026) laden</span>
              </button>
              <button
                onClick={onOpenImport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                <span>CSV / Copy & Paste importieren</span>
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      paginatedRecords.length > 0 &&
                      paginatedRecords.every((r) => selectedIds.has(r.id))
                    }
                    onChange={onToggleSelectAll}
                    className="w-3.5 h-3.5 text-[#1275bb] rounded border-slate-300 focus:ring-[#1275bb]"
                  />
                </th>
                <th className="py-2.5 px-3 w-20">Status</th>
                <th className="py-2.5 px-3 w-20">KD-Nr</th>
                <th className="py-2.5 px-3 font-bold text-slate-800">Name / Firma</th>
                <th className="py-2.5 px-3">USt-IdNr.</th>
                <th className="py-2.5 px-3">Ort / Anschrift</th>
                <th className="py-2.5 px-3">BZSt-Ergebnis</th>
                <th className="py-2.5 px-3">Abgleich</th>
                <th className="py-2.5 px-3">Zeitpunkt</th>
                <th className="py-2.5 px-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.map((record) => {
                const isSelected = selectedIds.has(record.id);
                return (
                  <tr
                    key={record.id}
                    className={`transition-colors hover:bg-sky-50/40 cursor-pointer ${
                      isSelected ? 'bg-sky-50/60' : ''
                    }`}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.closest('input') && !target.closest('button')) {
                        onOpenDetail(record);
                      }
                    }}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(record.id)}
                        className="w-3.5 h-3.5 text-[#1275bb] rounded border-slate-300 focus:ring-[#1275bb]"
                      />
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {renderStatusBadge(record)}
                    </td>

                    {/* KD-Nr */}
                    <td className="py-2.5 px-3 font-mono-code text-slate-600 font-semibold whitespace-nowrap">
                      {record.kdNr || '-'}
                    </td>

                    {/* Name / Firma */}
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 block">
                        {record.firmenname || '-'}
                      </span>
                      {record.validationNotes && record.validationNotes.length > 0 && (
                        <span className="text-[10px] text-amber-700 block truncate max-w-xs">
                          {record.validationNotes[0]}
                        </span>
                      )}
                    </td>

                    {/* USt-IdNr. */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {record.ustId ? (
                        <span className="font-mono-code font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {record.ustId}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1 w-max">
                          <span>(Keine USt-ID)</span>
                          <span>❌</span>
                        </span>
                      )}
                    </td>

                    {/* Ort / Land */}
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={record.ort}>
                      {record.ort || '-'}
                    </td>

                    {/* BZSt-Ergebnis */}
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-slate-700 block truncate max-w-[200px]" title={record.detailedStatus}>
                        {record.resultSummary || '-'}
                      </span>
                      {record.errorCode && record.errorCode !== 'evatr-0000' && (
                        <span className="font-mono-code text-[10px] text-slate-400">
                          {record.errorCode}
                        </span>
                      )}
                    </td>

                    {/* Qualifizierter Abgleich Chips */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {renderComparisonChips(record)}
                    </td>

                    {/* Zeitpunkt */}
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {record.checkedAt
                        ? new Date(record.checkedAt).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : '-'}
                    </td>

                    {/* Aktionen */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCheckSingle(record);
                          }}
                          title="Diesen Datensatz einzeln abfragen"
                          className="p-1 rounded text-[#1275bb] hover:bg-sky-100 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetail(record);
                          }}
                          title="Details & BZSt Rohantwort ansehen"
                          className="p-1 rounded text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSingle(record.id);
                          }}
                          title="Löschen"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginierungsleiste */}
      {filteredRecords.length > 0 && (
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Zeige{' '}
            <strong>
              {Math.min(filteredRecords.length, (currentPage - 1) * pageSize + 1)} bis{' '}
              {Math.min(filteredRecords.length, currentPage * pageSize)}
            </strong>{' '}
            von <strong>{filteredRecords.length}</strong> Datensätzen
            {filteredRecords.length !== records.length && (
              <span className="text-slate-400"> (gefiltert aus {records.length})</span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Page Size */}
            <div className="flex items-center space-x-1.5">
              <span>Zeilen pro Seite:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:border-[#1275bb]"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-300 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">
                Seite {currentPage} von {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-300 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
