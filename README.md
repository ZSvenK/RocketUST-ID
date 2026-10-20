# USt-ID Bulk Checker (BZSt eVatR)

Eine vollständige React-Webanwendung im **SAP Fiori Horizon Design** zur automatisierten Massenprüfung ausländischer EU-Umsatzsteuer-Identifikationsnummern (USt-IdNrn.) über die offizielle REST-API des **Bundeszentralamts für Steuern (BZSt eVatR)**.

---

## 🚀 Schnellstart

Wenn Sie das Projekt frisch aufsetzen oder ausführen möchten:

### 1. Projekt erstellen (bereits erledigt)
```bash
npm create vite@latest ust-id-checker -- --template react-ts
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Entwicklungsserver starten
```bash
npm run dev
```
Die App steht anschließend unter **`http://localhost:5173/`** bereit.

---

## 🎨 UI-Design & Architektur (SAP Fiori Horizon)
Das Design orientiert sich an der **SAP Fiori Horizon** Designsprache (wie in `C:\RocketMedia` / Zahn Pinsel GmbH):
- **Brand Color:** `#1275bb` (SAP Horizon / Zahn Pinsel Blau)
- **Top ShellBar:** Dunkelblaue ShellBar (`#001a33`) mit Schnellzugriff auf Import, Kundenliste, Export und Einstellungen.
- **KPI-Kacheln (`fiori-meta-tile`):**
  - **Gesamt:** Alle erfassten Datensätze
  - **Gültig ✔:** Grün hervorgehoben (Bestätigt)
  - **Ungültig / Fehlt ❌:** Rot hervorgehoben (inkl. Firmen ohne hinterlegte USt-IdNr.)
  - **Abweichung ⚠️:** Gelb/Orange (Qualifizierte Prüfung mit Datenabweichung)
  - **Offen ⏳:** Ungeprüfte Datensätze
- **Enterprise-Tabelle:** Checkbox-Mehrfachauswahl, Paginierung, Volltextsuche, Statusfilter, Länderfilter und Einzelaktionen.

---

## 📄 Kundenliste 2026 (`UST-ID-Nr 2026 SK.pdf`)
Die 170+ Datensätze aus Ihrer beigefügten Kundenliste sind bereits **vollständig transkribiert und vorinstalliert**:
- **Firmen ohne USt-IdNr.** (z. B. *Mark-John Limited*, *PAINTFORCE*, *Aesthetics*, *Call of Beauty*, *Helen Kuusk*, *Verona Nails*, *Abraham Karl Selig*, *BEYOU OÜ*, etc.) werden mit vollständigem Firmennamen aufgeführt und mit einem roten Kreuz **❌ („Fehlt“) markiert**.
- **Deutsche Firmen** (z. B. *Kess Berlin GmbH*) werden mit Warnhinweis markiert (deutsche USt-IdNrn. sind laut BZSt als angefragte Zielnummer unzulässig).
- **Drittland-Firmen** (z. B. Moldawien) werden ausgewiesen.
- Über den Button **„Kundenliste 2026 (PDF)“** in der Kopfzeile kann diese Liste jederzeit mit einem Klick neu geladen werden.

---

## ⚙️ Kernfunktionen

### 1. Eigene deutsche USt-IdNr.
- Standardwert: **`DE811179766`** (anpassbar)
- Zod-Formatvalidierung (Präfix `DE` + 9 Ziffern)
- Dauerhaft im Browser (`localStorage`) gespeichert

### 2. Daten erfassen
- **Copy & Paste:** Erkennt Zeilenumbrüche, Kommas, Semikolons, Leerzeichen sowie tabellarische Tab-Daten aus Excel.
- **CSV-Upload:** Unterstützt Spalten `ust_id`, `firmenname`, `ort`, `strasse`, `plz`, `kd_nr`.
- **Manuelle Eingabe:** Einzelne Firmen hinzufügen.
- **Duplikaterkennung:** Duplikate werden erkannt und können per Klick bereinigt werden.

### 3. Prüfmodi
- **Einfache Bestätigungsabfrage:** Prüft formale Gültigkeit der USt-IdNr.
- **Qualifizierte Bestätigungsabfrage:** Gleicht zusätzlich Firmenname und Ort (optional Straße und PLZ) ab.
  - `A`: Stimmt mit den registrierten Daten überein
  - `B`: Stimmt nicht überein
  - `C`: Nicht angefragt
  - `D`: Vom Mitgliedstaat nicht mitgeteilt

### 4. Bulk-Verarbeitung & Warteschlange
- Einstellbare Concurrency (Standard: **2 gleichzeitige Abfragen** zur Vermeidung von BZSt-Sessionlimits).
- Automatischer Retry mit **Exponential Backoff** bei Server- und Netzwerkfehlern (bis zu 2 Wiederholungen).
- Starten, Pausieren, Fortsetzen und Abbrechen.
- Fortschrittsanzeige mit `X von Y geprüft` und Erfolgs-Confetti.

### 5. Detailansicht & Export
- **Klick auf jede Zeile** öffnet die Detailansicht mit:
  - Vollständigem technischem JSON-Request
  - Vollständiger BZSt-Rohantwort
  - Offizieller BZSt-Statuscodemeldung (z. B. `evatr-0000`, `evatr-0005`, `evatr-2001`, `evatr-2006`)
  - Gültigkeitszeiträumen (`gueltigAb`, `gueltigBis`)
- **Export:**
  - **CSV:** Inkl. UTF-8 BOM für fehlerfreie Umlaute in Excel (als Nachweis für das Finanzamt).
  - **JSON:** Vollständiger technischer Prüfnachweis mit allen Rohdaten.
