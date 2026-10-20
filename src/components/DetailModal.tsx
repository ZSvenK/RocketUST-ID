import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Copy,
  Shield,
  X,
  XCircle,
} from 'lucide-react';
import { BZST_CONFIG } from '../config/bzst';
import type { CheckRecord, ComparisonResultCode } from '../types';

interface DetailModalProps {
  record: CheckRecord | null;
  onClose: () => void;
  onCheckSingle: (record: CheckRecord) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  record,
  onClose,
  onCheckSingle,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'response'>('overview');
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const rawResp: any = record.rawResponse || {};
  const evatrCode = record.errorCode || rawResp.status;
  const statusMeta = evatrCode ? BZST_CONFIG.STATUS_CODES[evatrCode] : undefined;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderComparisonBadge = (code?: string) => {
    if (!code) return <span className="text-slate-400">-</span>;
    const meta = BZST_CONFIG.COMPARISON_CODES[code as ComparisonResultCode];
    if (!meta) return <span className="font-mono-code font-bold">{code}</span>;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${meta.badgeClass}`}
        title={meta.description}
      >
        <span>Code {code}:</span>
        <span>{meta.title}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                record.status === 'VALID'
                  ? 'bg-emerald-100 text-emerald-700'
                  : record.status === 'INVALID' || record.status === 'MISSING_USTID'
                  ? 'bg-rose-100 text-rose-700'
                  : record.status === 'MISMATCH'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {record.status === 'VALID' && <CheckCircle2 className="w-6 h-6" />}
              {(record.status === 'INVALID' || record.status === 'MISSING_USTID') && (
                <XCircle className="w-6 h-6" />
              )}
              {record.status === 'MISMATCH' && <AlertTriangle className="w-6 h-6" />}
              {record.status === 'NOT_CHECKED' && <Shield className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 m-0">
                  {record.firmenname || record.ustId || 'Datensatz Detail'}
                </h2>
                {record.kdNr && (
                  <span className="font-mono-code text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    {record.kdNr}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono-code m-0">
                USt-IdNr.: {record.ustId ? record.ustId : '(Keine USt-IdNr. hinterlegt)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50/50 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#1275bb] text-[#1275bb]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Übersicht & Abgleich
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'request'
                ? 'border-[#1275bb] text-[#1275bb]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Request Payload
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'response'
                ? 'border-[#1275bb] text-[#1275bb]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            BZSt Rohantwort (JSON)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'overview' && (
            <>
              {/* Status Box */}
              <div
                className={`p-4 rounded-xl border ${
                  record.status === 'VALID'
                    ? 'bg-emerald-50/90 border-emerald-200'
                    : record.status === 'INVALID' || record.status === 'MISSING_USTID'
                    ? 'bg-rose-50/90 border-rose-200'
                    : record.status === 'MISMATCH'
                    ? 'bg-amber-50/90 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {record.resultSummary || 'Noch nicht geprüft'}
                  </span>
                  {evatrCode && (
                    <span className="font-mono-code text-xs px-2 py-0.5 rounded bg-white/80 border border-slate-300 font-semibold">
                      {evatrCode}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1.5 opacity-90 leading-relaxed">
                  {record.detailedStatus ||
                    statusMeta?.description ||
                    'Klicken Sie auf "Jetzt prüfen", um eine Bestätigungsabfrage durchzuführen.'}
                </p>

                {/* Gültigkeitszeiträume falls von BZSt mitgeteilt */}
                {(rawResp.gueltigAb || rawResp.gueltigBis) && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-4 text-xs">
                    {rawResp.gueltigAb && (
                      <span className="flex items-center gap-1 text-slate-700">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Gültig ab: <strong>{rawResp.gueltigAb}</strong></span>
                      </span>
                    )}
                    {rawResp.gueltigBis && (
                      <span className="flex items-center gap-1 text-slate-700">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Gültig bis: <strong>{rawResp.gueltigBis}</strong></span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stammdaten */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Übermittelte Unternehmensdaten
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Firmenname</span>
                    <strong className="text-slate-800">{record.firmenname || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Ort / Land</span>
                    <strong className="text-slate-800">{record.ort || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Straße</span>
                    <strong className="text-slate-800">{record.strasse || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">PLZ</span>
                    <strong className="text-slate-800">{record.plz || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Qualifizierter Abgleich (Vergleichsergebnisse A/B/C/D) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Qualifizierter Datenabgleich (BZSt Vergleich)
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 text-left font-semibold">Feld</th>
                        <th className="py-2 px-3 text-left font-semibold">Übermittelter Wert</th>
                        <th className="py-2 px-3 text-left font-semibold">Behördlicher Abgleich</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-700">Firmenname</td>
                        <td className="py-2 px-3 text-slate-600">{record.firmenname || '-'}</td>
                        <td className="py-2 px-3">
                          {renderComparisonBadge(record.comparison?.firmenname || rawResp.ergFirmenname)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-700">Ort</td>
                        <td className="py-2 px-3 text-slate-600">{record.ort || '-'}</td>
                        <td className="py-2 px-3">
                          {renderComparisonBadge(record.comparison?.ort || rawResp.ergOrt)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-700">Straße</td>
                        <td className="py-2 px-3 text-slate-600">{record.strasse || '-'}</td>
                        <td className="py-2 px-3">
                          {renderComparisonBadge(record.comparison?.strasse || rawResp.ergStrasse)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-700">PLZ</td>
                        <td className="py-2 px-3 text-slate-600">{record.plz || '-'}</td>
                        <td className="py-2 px-3">
                          {renderComparisonBadge(record.comparison?.plz || rawResp.ergPlz)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap gap-3">
                  <span><strong>A:</strong> Stimmt überein</span>
                  <span><strong>B:</strong> Weicht ab</span>
                  <span><strong>C:</strong> Nicht angefragt</span>
                  <span><strong>D:</strong> Vom EU-Staat nicht mitgeteilt</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'request' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  POST an BZSt eVatR Endpunkt
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(record.rawRequest || {}, null, 2))
                  }
                  className="inline-flex items-center gap-1 text-xs text-[#1275bb] hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Kopiert!' : 'JSON kopieren'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-sky-300 font-mono-code text-xs rounded-lg overflow-x-auto">
                {JSON.stringify(record.rawRequest || { anfrage: 'Noch nicht angefragt' }, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'response' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Antwort der BZSt Schnittstelle
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(record.rawResponse || {}, null, 2))
                  }
                  className="inline-flex items-center gap-1 text-xs text-[#1275bb] hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Kopiert!' : 'JSON kopieren'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-300 font-mono-code text-xs rounded-lg overflow-x-auto">
                {JSON.stringify(record.rawResponse || { antwort: 'Keine Antwort vorhanden' }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {record.checkedAt
              ? `Geprüft am: ${new Date(record.checkedAt).toLocaleString('de-DE')}`
              : 'Status: Nicht geprüft'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCheckSingle(record)}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#1275bb] hover:bg-[#0f5d96] text-white shadow-sm transition-colors"
            >
              Diesen Datensatz jetzt prüfen
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
