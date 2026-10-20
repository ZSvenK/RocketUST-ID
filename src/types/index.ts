export type CheckStatus =
  | 'NOT_CHECKED'    // Noch nicht geprüft
  | 'CHECKING'       // Wird gerade geprüft
  | 'VALID'          // Gültig (evatr-0000, etc.)
  | 'INVALID'        // Ungültig (evatr-2001, evatr-2002, evatr-2006, etc.)
  | 'MISMATCH'       // Qualifiziert: Abweichungen bei Name/Ort (Status B)
  | 'ERROR'          // Technischer Fehler (5xx, Timeout, Netzwerk)
  | 'MISSING_USTID'; // Keine USt-IdNr. vorhanden (z.B. aus Kundenliste ohne Nummer)

export type CheckMode = 'SIMPLE' | 'QUALIFIED';

export type ComparisonResultCode = 'A' | 'B' | 'C' | 'D';

export interface ComparisonResults {
  firmenname?: ComparisonResultCode | string;
  strasse?: ComparisonResultCode | string;
  plz?: ComparisonResultCode | string;
  ort?: ComparisonResultCode | string;
}

export interface EvatrRequestPayload {
  anfragendeUstid: string;
  angefragteUstid: string;
  firmenname?: string;
  ort?: string;
  strasse?: string;
  plz?: string;
}

export interface EvatrResponsePayload {
  id?: string;
  anfrageZeitpunkt: string;
  status: string;
  gueltigAb?: string;
  gueltigBis?: string;
  ergFirmenname?: ComparisonResultCode | string;
  ergStrasse?: ComparisonResultCode | string;
  ergPlz?: ComparisonResultCode | string;
  ergOrt?: ComparisonResultCode | string;
}

export interface CheckRecord {
  id: string;                     // Eindeutige interne ID
  kdNr?: string;                  // Kundennummer aus PDF/ERP
  ustId: string;                  // Angefragte USt-IdNr.
  firmenname?: string;            // Firmenname
  ort?: string;                   // Ort / Stadt
  strasse?: string;               // Straße
  plz?: string;                   // PLZ
  land?: string;                  // Erkanntes Land (z.B. AT, IT, FR)
  umsatz?: string | number;       // Evtl. Umsatzwert aus Kundenliste
  status: CheckStatus;            // Aktueller Prüfstatus
  resultSummary?: string;         // Kurze lesbare Zusammenfassung
  detailedStatus?: string;        // Ausführliche Erklärung des Statuscodes
  comparison?: ComparisonResults; // Qualifizierte Übereinstimmungsergebnisse A/B/C/D
  rawRequest?: EvatrRequestPayload;
  rawResponse?: EvatrResponsePayload | Record<string, unknown>;
  errorCode?: string;             // z.B. evatr-0005, NET_ERROR, TIMEOUT
  errorMessage?: string;          // Fehlerbeschreibung
  checkedAt?: string;             // Zeitstempel der Prüfung
  retryCount: number;             // Anzahl durchgeführter Retries
  isDuplicate?: boolean;          // Als Duplikat markiert
  validationNotes?: string[];     // Hinweise vorab (z.B. Deutsches Format, ungültiges Präfix)
}

export interface AppSettings {
  eigeneUstId: string;
  mode: CheckMode;
  concurrency: number;
  timeoutSec: number;
  autoRetry: boolean;
  useProxy: boolean;
}

export interface FilterOptions {
  search: string;
  statusFilter: CheckStatus | 'ALL' | 'ONLY_VALID' | 'ONLY_INVALID';
  countryFilter: string;
}

export interface QueueProgress {
  total: number;
  checked: number;
  valid: number;
  invalid: number;
  mismatch: number;
  error: number;
  missingUstId: number;
  inProgress: number;
  isRunning: boolean;
  isPaused: boolean;
}
