import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Server,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import type { AppSettings, CheckRecord } from '../types';
import { validateGermanUstId } from '../utils/validation';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onLoadTestRecord: (record: CheckRecord) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onLoadTestRecord,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const val = validateGermanUstId(localSettings.eigeneUstId);
    if (!val.valid) {
      setValidationError(val.message || 'Ungültige deutsche USt-IdNr.');
      return;
    }
    setValidationError(null);
    onSaveSettings(localSettings);
    onClose();
  };

  const handleLoadSample = (type: 'simple' | 'qualified') => {
    if (type === 'simple') {
      onLoadTestRecord({
        id: `test-sample-${Date.now()}`,
        kdNr: 'TEST-01',
        ustId: 'ATU12345678',
        firmenname: 'Offizielles BZSt Testmuster Österreich',
        ort: 'Wien',
        status: 'NOT_CHECKED',
        retryCount: 0,
      });
    } else {
      onLoadTestRecord({
        id: `test-sample-qual-${Date.now()}`,
        kdNr: 'TEST-02',
        ustId: 'ATU12345678',
        firmenname: 'Musterhaus GmbH & Co KG',
        ort: 'Musterort',
        strasse: 'Musterstrasse 22',
        plz: '12345',
        status: 'NOT_CHECKED',
        retryCount: 0,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-[#1275bb] text-white flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 m-0">
                Einstellungen & BZSt Konfiguration
              </h2>
              <p className="text-xs text-slate-500 m-0">
                Anfragedaten, Prüfmodus und API-Verbindung
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Eigene Deutsche USt-IdNr. */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Eigene deutsche USt-IdNr. (Anfragende ID)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Wird bei jeder Anfrage an das BZSt übermittelt. Muss mit "DE" beginnen und 9 Ziffern haben.
            </p>
            <input
              type="text"
              value={localSettings.eigeneUstId}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setLocalSettings({ ...localSettings, eigeneUstId: val });
                if (validationError) setValidationError(null);
              }}
              placeholder="z. B. DE811179766"
              className="w-full px-3.5 py-2 font-mono-code font-semibold rounded-md border border-slate-300 focus:border-[#1275bb] focus:ring-2 focus:ring-[#1275bb]/20 text-slate-900 bg-white"
            />
            {validationError ? (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Wird dauerhaft in Ihrem Browser (localStorage) gespeichert.
              </p>
            )}
          </div>

          {/* Prüfmodus */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Prüfmodus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
              <label
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  localSettings.mode === 'SIMPLE'
                    ? 'border-[#1275bb] bg-sky-50/70 ring-1 ring-[#1275bb]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs">
                    Einfache Bestätigung
                  </span>
                  <input
                    type="radio"
                    name="mode"
                    checked={localSettings.mode === 'SIMPLE'}
                    onChange={() => setLocalSettings({ ...localSettings, mode: 'SIMPLE' })}
                    className="text-[#1275bb]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Prüft ausschließlich die formale Gültigkeit der ausländischen USt-IdNr.
                </p>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  localSettings.mode === 'QUALIFIED'
                    ? 'border-[#1275bb] bg-sky-50/70 ring-1 ring-[#1275bb]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs">
                    Qualifizierte Bestätigung
                  </span>
                  <input
                    type="radio"
                    name="mode"
                    checked={localSettings.mode === 'QUALIFIED'}
                    onChange={() => setLocalSettings({ ...localSettings, mode: 'QUALIFIED' })}
                    className="text-[#1275bb]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Gleicht zusätzlich Firmenname, Ort, Straße und PLZ ab (A/B/C/D Vergleich).
                </p>
              </label>
            </div>
          </div>

          {/* Parallelität & Timeout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800 text-xs">
                  Parallelität (Gleichzeitige Requests)
                </label>
                <span className="font-mono-code font-bold text-xs text-[#1275bb]">
                  {localSettings.concurrency}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={localSettings.concurrency}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, concurrency: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#1275bb]"
              />
              <span className="text-[10px] text-slate-400">
                Standard: 2 (Schont BZSt-Sessionlimits)
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800 text-xs">
                  Timeout (Sekunden)
                </label>
                <span className="font-mono-code font-bold text-xs text-[#1275bb]">
                  {localSettings.timeoutSec}s
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={localSettings.timeoutSec}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, timeoutSec: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#1275bb]"
              />
              <span className="text-[10px] text-slate-400">
                Standard: 10s pro Einzelabfrage
              </span>
            </div>
          </div>

          {/* Automatischer Retry */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="font-semibold text-xs text-slate-800 block">
                Automatischer Retry mit Exponential Backoff
              </span>
              <span className="text-[11px] text-slate-500">
                Bis zu 2 automatische Wiederholungsversuche bei Server- oder Netzwerkfehlern.
              </span>
            </div>
            <input
              type="checkbox"
              checked={localSettings.autoRetry}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, autoRetry: e.target.checked })
              }
              className="w-4 h-4 text-[#1275bb] rounded border-slate-300 focus:ring-[#1275bb]"
            />
          </div>

          {/* Verbindungsweg: Vite Proxy vs. Direkt */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#1275bb]" />
                <span>Verbindungsweg zur BZSt eVatR API</span>
              </span>
              <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                {localSettings.useProxy ? 'Proxy (/bzst-api)' : 'Direkt (api.evatr.vies.bzst.de)'}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="conn"
                  checked={!localSettings.useProxy}
                  onChange={() => setLocalSettings({ ...localSettings, useProxy: false })}
                />
                <span className="text-slate-700">Direkt (CORS-fähig)</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="conn"
                  checked={localSettings.useProxy}
                  onChange={() => setLocalSettings({ ...localSettings, useProxy: true })}
                />
                <span className="text-slate-700">Lokaler Vite Proxy</span>
              </label>
            </div>
          </div>

          {/* Testdaten einfügen */}
          <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-200">
            <span className="text-xs font-semibold text-sky-900 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Offizielle BZSt-Testdatensätze laden</span>
            </span>
            <p className="text-[11px] text-sky-800/80 mb-2">
              Fügt einen funktionierenden Testdatensatz aus der OpenAPI-Dokumentation ein:
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('simple')}
                className="px-2.5 py-1 text-xs font-medium rounded bg-white text-sky-800 border border-sky-300 hover:bg-sky-100 transition-colors"
              >
                Einfaches Testmuster (ATU12345678)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('qualified')}
                className="px-2.5 py-1 text-xs font-medium rounded bg-white text-sky-800 border border-sky-300 hover:bg-sky-100 transition-colors"
              >
                Qualifiziertes Testmuster (Musterhaus GmbH)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-[#1275bb] hover:bg-[#0f5d96] text-white shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Einstellungen speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
};
