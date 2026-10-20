import { z } from 'zod';
import { BZST_CONFIG } from '../config/bzst';

// Zod Schema für die eigene deutsche USt-IdNr.
export const GermanUstIdSchema = z
  .string()
  .transform((val) => val.trim().toUpperCase().replace(/[\s.-]/g, ''))
  .refine((val) => /^DE\d{9}$/.test(val), {
    message: 'Die eigene USt-IdNr. muss mit "DE" beginnen und genau 9 Ziffern enthalten (z. B. DE123456789 oder DE811179766).',
  });

// Zod Schema für ein einzelnes manuell hinzugefügtes Formular
export const ManualRecordSchema = z.object({
  ustId: z.string().transform((val) => val.trim().toUpperCase().replace(/[\s.-]/g, '')),
  firmenname: z.string().optional(),
  ort: z.string().optional(),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  kdNr: z.string().optional(),
});

/**
 * Bereinigt eine USt-IdNr. (entfernt Leerzeichen, Punkte, Bindestriche, wandelt in Großbuchstaben um)
 */
export function cleanUstId(raw?: string): string {
  if (!raw) return '';
  return raw.trim().toUpperCase().replace(/[\s.\-_/]/g, '');
}

/**
 * Validiert die eigene deutsche USt-IdNr.
 */
export function validateGermanUstId(id: string): { valid: boolean; message?: string } {
  const cleaned = cleanUstId(id);
  if (!cleaned) {
    return { valid: false, message: 'Bitte geben Sie Ihre eigene deutsche USt-IdNr. ein.' };
  }
  if (!cleaned.startsWith('DE')) {
    return { valid: false, message: 'Die eigene USt-IdNr. muss mit dem Länderkürzel "DE" beginnen.' };
  }
  if (!/^DE\d{9}$/.test(cleaned)) {
    return { valid: false, message: 'Eine deutsche USt-IdNr. muss aus "DE" und genau 9 Ziffern bestehen.' };
  }
  return { valid: true };
}

/**
 * Validiert eine ausländische EU-Umsatzsteuer-ID vorab
 */
export function validateEuUstId(rawId?: string): {
  valid: boolean;
  isGerman: boolean;
  countryCode?: string;
  countryName?: string;
  notes: string[];
} {
  const cleaned = cleanUstId(rawId);
  const notes: string[] = [];

  if (!cleaned) {
    return {
      valid: false,
      isGerman: false,
      notes: ['Keine USt-IdNr. hinterlegt (Nummer fehlt)'],
    };
  }

  // Prüfen ob deutsche Nummer
  if (cleaned.startsWith('DE')) {
    notes.push('Deutsche USt-IdNr.: Kann nicht als angefragte Nummer geprüft werden (nur EU-Ausland zulässig)');
    return {
      valid: false,
      isGerman: true,
      countryCode: 'DE',
      countryName: 'Deutschland',
      notes,
    };
  }

  // Land ermitteln (erste 2 Buchstaben)
  const countryCode = cleaned.slice(0, 2);
  const country = BZST_CONFIG.EU_COUNTRIES.find(
    (c) => c.code === countryCode || (countryCode === 'GR' && c.code === 'EL')
  );

  if (!country) {
    notes.push(`Unbekanntes oder Nicht-EU Länderkürzel: "${countryCode}"`);
    return {
      valid: false,
      isGerman: false,
      countryCode,
      notes,
    };
  }

  // Regex-Formatprüfung
  if (!country.regex.test(cleaned)) {
    notes.push(`Format passt nicht zum offiziellen Schema für ${country.name}`);
    return {
      valid: false,
      isGerman: false,
      countryCode: country.code,
      countryName: country.name,
      notes,
    };
  }

  return {
    valid: true,
    isGerman: false,
    countryCode: country.code,
    countryName: country.name,
    notes,
  };
}
