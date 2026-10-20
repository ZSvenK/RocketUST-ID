import Papa from 'papaparse';
import type { CheckRecord } from '../types';
import { cleanUstId, validateEuUstId } from './validation';

/**
 * Normalisiert Spaltennamen für flexibles Mapping
 */
function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_\-/]/g, '');
}

/**
 * Parst eine CSV-Datei und erzeugt CheckRecords
 */
export function parseCsvFile(file: File): Promise<{
  records: CheckRecord[];
  duplicatesCount: number;
  missingUstIdCount: number;
}> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          const parsed = processParsedRows(results.data);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}

/**
 * Verarbeitet zeilenweise Rohdaten (egal ob aus CSV oder Copy&Paste)
 */
export function processParsedRows(rows: Record<string, string>[]): {
  records: CheckRecord[];
  duplicatesCount: number;
  missingUstIdCount: number;
} {
  const records: CheckRecord[] = [];
  const seenIds = new Set<string>();
  let duplicatesCount = 0;
  let missingUstIdCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[normalizeKey(key)] = (value || '').trim();
    }

    // Spalten-Matching
    const ustIdRaw =
      normalized['ustid'] ||
      normalized['ustidnr'] ||
      normalized['vat'] ||
      normalized['vatid'] ||
      normalized['vatnumber'] ||
      normalized['steuernummer'] ||
      '';

    const firmenname =
      normalized['firmenname'] ||
      normalized['namefirma'] ||
      normalized['firma'] ||
      normalized['name'] ||
      normalized['company'] ||
      normalized['kunde'] ||
      '';

    const ort =
      normalized['ort'] ||
      normalized['stadt'] ||
      normalized['city'] ||
      '';

    const strasse =
      normalized['strasse'] ||
      normalized['street'] ||
      normalized['adresse'] ||
      normalized['anschrift'] ||
      '';

    const plz =
      normalized['plz'] ||
      normalized['zip'] ||
      normalized['postleitzahl'] ||
      '';

    const kdNr =
      normalized['kdnr'] ||
      normalized['kundennummer'] ||
      normalized['customerno'] ||
      '';

    const cleanedUstId = cleanUstId(ustIdRaw);

    // Duplikaterkennung
    let isDuplicate = false;
    if (cleanedUstId) {
      if (seenIds.has(cleanedUstId)) {
        isDuplicate = true;
        duplicatesCount++;
      } else {
        seenIds.add(cleanedUstId);
      }
    }

    // Status und Validierung
    const validation = validateEuUstId(cleanedUstId);
    let initialStatus: CheckRecord['status'] = 'NOT_CHECKED';
    let resultSummary: string | undefined = undefined;

    if (!cleanedUstId) {
      initialStatus = 'MISSING_USTID';
      resultSummary = 'Keine USt-IdNr. gepflegt ❌';
      missingUstIdCount++;
    } else if (validation.isGerman) {
      initialStatus = 'INVALID';
      resultSummary = 'Deutsche USt-IdNr. ❌';
    } else if (!validation.valid && validation.notes.length > 0) {
      resultSummary = 'Format-Warnung ⚠️';
    }

    records.push({
      id: `rec-${i + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      kdNr,
      ustId: cleanedUstId,
      firmenname,
      ort,
      strasse,
      plz,
      status: initialStatus,
      resultSummary,
      isDuplicate,
      retryCount: 0,
      validationNotes: validation.notes.length > 0 ? validation.notes : undefined,
    });
  }

  return { records, duplicatesCount, missingUstIdCount };
}

/**
 * Parst Freitext / Copy & Paste (z.B. Zeilen aus Tabellen, Kommas, Semikolons)
 */
export function parsePastedText(text: string): CheckRecord[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Prüfen, ob strukturierte Tabellenzeilen (z.B. Tab- oder Semikolon-getrennt) vorliegen
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const isTsv = firstLine.includes('\t');
  const isCsv = firstLine.includes(';') || (firstLine.includes(',') && !/^([A-Z]{2}[A-Z0-9]+,?\s*)+$/i.test(firstLine));

  if (isTsv || isCsv) {
    // PapaParse mit automatischer Trennzeichenerkennung
    const parsed = Papa.parse<Record<string, string>>(trimmed, {
      header: true,
      skipEmptyLines: 'greedy',
    });
    if (parsed.data.length > 0 && Object.keys(parsed.data[0]).length > 1) {
      return processParsedRows(parsed.data).records;
    }
  }

  // Fallback: Freie Trenner (Kommas, Semikolons, Zeilenumbrüche, Leerzeichen)
  const tokens = trimmed.split(/[\r\n,;\s]+/).map((t) => t.trim()).filter(Boolean);
  const records: CheckRecord[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i];
    const cleaned = cleanUstId(raw);
    if (!cleaned) continue;

    const isDuplicate = seen.has(cleaned);
    if (!isDuplicate) seen.add(cleaned);

    const validation = validateEuUstId(cleaned);
    let initialStatus: CheckRecord['status'] = 'NOT_CHECKED';
    let resultSummary: string | undefined = undefined;

    if (validation.isGerman) {
      initialStatus = 'INVALID';
      resultSummary = 'Deutsche USt-IdNr. ❌';
    } else if (!validation.valid && validation.notes.length > 0) {
      resultSummary = 'Format-Warnung ⚠️';
    }

    records.push({
      id: `paste-${i + 1}-${Date.now().toString(36)}`,
      ustId: cleaned,
      status: initialStatus,
      resultSummary,
      isDuplicate,
      retryCount: 0,
      validationNotes: validation.notes.length > 0 ? validation.notes : undefined,
    });
  }

  return records;
}

/**
 * Exportiert die Datensätze als CSV mit vollständigem Prüfnachweis (inkl. UTF-8 BOM für Excel)
 */
export function exportToCsv(records: CheckRecord[], filename = 'ust_id_pruefung.csv') {
  const exportData = records.map((r) => {
    const rawResp: any = r.rawResponse || {};
    return {
      'KD-Nr': r.kdNr || '',
      'USt-IdNr.': r.ustId || '(Keine)',
      'Firmenname': r.firmenname || '',
      'Ort': r.ort || '',
      'Straße': r.strasse || '',
      'PLZ': r.plz || '',
      'Status': r.status,
      'Ergebnis': r.resultSummary || '',
      'BZSt-Statuscode': r.errorCode || rawResp.status || '',
      'BZSt-Meldung': r.detailedStatus || '',
      'Abgleich Firmenname': r.comparison?.firmenname || rawResp.ergFirmenname || '',
      'Abgleich Ort': r.comparison?.ort || rawResp.ergOrt || '',
      'Abgleich Straße': r.comparison?.strasse || rawResp.ergStrasse || '',
      'Abgleich PLZ': r.comparison?.plz || rawResp.ergPlz || '',
      'Gültig Ab': rawResp.gueltigAb || '',
      'Gültig Bis': rawResp.gueltigBis || '',
      'BZSt Request-ID': rawResp.id || '',
      'Prüfzeitpunkt': r.checkedAt || '',
      'Fehlermeldung': r.errorMessage || '',
    };
  });

  const csv = Papa.unparse(exportData, {
    delimiter: ';',
  });

  // UTF-8 BOM für Microsoft Excel auf Windows
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Exportiert die Datensätze als vollständiges JSON (inkl. Rohdaten für Nachweiszwecke)
 */
export function exportToJson(records: CheckRecord[], filename = 'ust_id_pruefung.json') {
  const exportPayload = {
    app: 'USt-ID Bulk Checker',
    exportedAt: new Date().toISOString(),
    totalRecords: records.length,
    summary: {
      valid: records.filter((r) => r.status === 'VALID').length,
      invalid: records.filter((r) => r.status === 'INVALID').length,
      mismatch: records.filter((r) => r.status === 'MISMATCH').length,
      error: records.filter((r) => r.status === 'ERROR').length,
      missingUstId: records.filter((r) => r.status === 'MISSING_USTID').length,
      notChecked: records.filter((r) => r.status === 'NOT_CHECKED').length,
    },
    records,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
