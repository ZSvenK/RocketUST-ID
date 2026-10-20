import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Square,
  XCircle,
} from 'lucide-react';
import type { CheckStatus, QueueProgress } from '../types';

interface MetricCardsProps {
  progress: QueueProgress;
  activeFilter: CheckStatus | 'ALL' | 'ONLY_VALID' | 'ONLY_INVALID';
  onSelectFilter: (filter: CheckStatus | 'ALL' | 'ONLY_VALID' | 'ONLY_INVALID') => void;
  onStartAll: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onReset: () => void;
  selectedCount: number;
  onStartSelected: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  progress,
  activeFilter,
  onSelectFilter,
  onStartAll,
  onPause,
  onResume,
  onCancel,
  onReset,
  selectedCount,
  onStartSelected,
}) => {
  const percent = progress.total > 0 ? Math.round((progress.checked / progress.total) * 100) : 0;
  const invalidTotal = progress.invalid + progress.error + progress.missingUstId;

  return (
    <div className="space-y-4">
      {/* KPI Kacheln (Fiori Horizon Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Gesamt */}
        <button
          onClick={() => onSelectFilter('ALL')}
          className={`p-3.5 rounded-lg text-left transition-all border ${
            activeFilter === 'ALL'
              ? 'bg-sky-50/80 border-[#1275bb] ring-2 ring-[#1275bb]/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Gesamt
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {progress.total}
          </div>
          <span className="text-[11px] text-slate-500">Alle erfassten Zeilen</span>
        </button>

        {/* Gültig ✔ */}
        <button
          onClick={() => onSelectFilter('VALID')}
          className={`p-3.5 rounded-lg text-left transition-all border ${
            activeFilter === 'VALID'
              ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Gültig ✔
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {progress.valid}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            Bestätigt (Haken)
          </span>
        </button>

        {/* Ungültig / Fehler / Fehlt ❌ */}
        <button
          onClick={() => onSelectFilter('ONLY_INVALID')}
          className={`p-3.5 rounded-lg text-left transition-all border ${
            activeFilter === 'ONLY_INVALID'
              ? 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-rose-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Ungültig / Fehlt ❌
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {invalidTotal}
          </div>
          <div className="text-[11px] text-rose-700 flex items-center gap-1">
            <span>{progress.missingUstId} ohne Nr.</span>
            <span>•</span>
            <span>{progress.invalid} ungültig</span>
            {progress.error > 0 && <span>• {progress.error} Fehler</span>}
          </div>
        </button>

        {/* Abweichungen (Qualifiziert) ⚠️ */}
        <button
          onClick={() => onSelectFilter('MISMATCH')}
          className={`p-3.5 rounded-lg text-left transition-all border ${
            activeFilter === 'MISMATCH'
              ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Abweichung ⚠️
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">
            {progress.mismatch}
          </div>
          <span className="text-[11px] text-amber-800 font-medium">
            Name/Ort abweichend
          </span>
        </button>

        {/* Ungeprüft ⏳ */}
        <button
          onClick={() => onSelectFilter('NOT_CHECKED')}
          className={`p-3.5 rounded-lg text-left transition-all border ${
            activeFilter === 'NOT_CHECKED'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Offen ⏳
            </span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700">
            {progress.total - progress.checked}
          </div>
          <span className="text-[11px] text-slate-500">Noch nicht geprüft</span>
        </button>
      </div>

      {/* Kontrollleiste & Fortschrittsbalken */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Fortschrittstext & Balken */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                {progress.isRunning && (
                  <span className="w-2 h-2 rounded-full bg-[#1275bb] animate-ping" />
                )}
                <span>Fortschritt:</span>
                <strong className="text-slate-800 font-semibold">
                  {progress.checked} von {progress.total} geprüft
                </strong>
                {progress.inProgress > 0 && (
                  <span className="text-sky-600">({progress.inProgress} aktiv in Abfrage)</span>
                )}
              </span>
              <span className="font-semibold text-slate-700">{percent}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex border border-slate-200">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progress.total ? (progress.valid / progress.total) * 100 : 0}%` }}
                title={`${progress.valid} Gültig`}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${progress.total ? (progress.mismatch / progress.total) * 100 : 0}%` }}
                title={`${progress.mismatch} Abweichung`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${progress.total ? ((progress.invalid + progress.error + progress.missingUstId) / progress.total) * 100 : 0}%` }}
                title={`${invalidTotal} Ungültig/Fehler/Fehlt`}
              />
              <div
                className="bg-sky-400 h-full animate-pulse-subtle"
                style={{ width: `${progress.total ? (progress.inProgress / progress.total) * 100 : 0}%` }}
                title={`${progress.inProgress} In Prüfung`}
              />
            </div>
          </div>

          {/* Steuerungs-Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {!progress.isRunning ? (
              <>
                {selectedCount > 0 && (
                  <button
                    onClick={onStartSelected}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0070f2] hover:bg-[#005bb5] text-white shadow-sm transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{selectedCount} markierte prüfen</span>
                  </button>
                )}
                <button
                  onClick={onStartAll}
                  disabled={progress.total === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-[#1275bb] hover:bg-[#0f5d96] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Alle prüfen</span>
                </button>
              </>
            ) : progress.isPaused ? (
              <>
                <button
                  onClick={onResume}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Fortsetzen</span>
                </button>
                <button
                  onClick={onCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Abbrechen</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onPause}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pausieren</span>
                </button>
                <button
                  onClick={onCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Abbrechen</span>
                </button>
              </>
            )}

            {/* Reset */}
            {progress.checked > 0 && !progress.isRunning && (
              <button
                onClick={onReset}
                title="Ergebnisse zurücksetzen"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
