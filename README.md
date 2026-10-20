# 🛡️ USt-ID Bulk Checker (RocketUST-ID)

<div align="center">

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge&logo=electron)
![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![BZSt API](https://img.shields.io/badge/BZSt_eVatR-Offizielle_API-1275bb?style=for-the-badge&logo=gov.uk&logoColor=white)

**High-Performance Enterprise-Desktop-Anwendung im SAP Fiori Horizon Design zur automatisierten Massenprüfung ausländischer EU-Umsatzsteuer-Identifikationsnummern über die offizielle REST-Schnittstelle des Bundeszentralamts für Steuern (BZSt eVatR).**

[Schnellstart](#-schnellstart) • [Systemarchitektur](#-systemarchitektur) • [Prüfprozess & Ablauf](#-prüfprozess--entscheidungslogik) • [Warteschlange & Concurrency](#-warteschlangen--concurrency-steuerung) • [Qualifizierter Datenabgleich](#-qualifizierter-datenabgleich-abcd) • [Statuscodes](#-vollständige-bzst-statuscode-referenz) • [Ordner 2026](#-dokumentationsordner-2026)

</div>

---

## 📋 Überblick & Nutzen

Für innergemeinschaftliche steuerfreie Lieferungen (§ 4 Nr. 1 Buchst. b UStG i. V. m. § 6a UStG) sind Unternehmen gesetzlich verpflichtet, die Gültigkeit der ausländischen USt-IdNr. des Geschäftspartners zum Zeitpunkt der Leistung nachzuweisen.

Manuelle Einzelabfragen beim Online-Portal des Bundeszentralamts für Steuern (BZSt) kosten bei hunderten Debitoren viele Arbeitsstunden. Der **USt-ID Bulk Checker** automatisiert diesen Prozess vollständig:
- ⚡ **200+ Nummern in wenigen Minuten** statt tagelanger manueller Recherche.
- 🏢 **SAP Fiori Horizon Enterprise UI** (abgestimmt auf die Firmenarchitektur von Zahn Pinsel GmbH / RocketMedia mit Brand-Farbton `#1275bb`).
- 📁 **Vollständige Transkription der Kundenliste 2026:** 170+ Datensätze aus `UST-ID-Nr 2026 SK.pdf` sind auf Knopfdruck abrufbereit.
- ❌ **Sonderbehandlung fehlender Nummern:** Kunden ohne hinterlegte USt-IdNr. werden mit Firmenname und rotem Kreuz (`Fehlt ❌`) dargestellt.
- 📄 **Rechtssicherer Prüfnachweis:** Export als Excel-kompatible CSV (mit UTF-8 BOM) und vollständiges JSON zur Vorlage bei Betriebsprüfungen.

---

## 🏛️ Systemarchitektur

Die Anwendung ist als hybride **Electron Desktop-App** konzipiert. Ein eingebetteter lokaler Node.js-Server eliminiert jegliche Browser-CORS-Restriktionen beim Zugriff auf die BZSt-Server.

```mermaid
graph TB
    subgraph Client ["🖥️ Lokale Desktop-Umgebung (Windows)"]
        Launcher["🚀 Start-App.bat / Desktop-Shortcut"]
        Electron["📦 Electron Container (v30)"]
        LocalServer["⚙️ Integrierter Static Server (Port 50000+)"]
        ReactApp["⚛️ React 19 + TypeScript SPA"]
        Tailwind["🎨 SAP Fiori Horizon Theme (#1275bb)"]
        Storage["💾 LocalStorage (DE811179766 & History)"]
    end

    subgraph CoreEngine ["⚙️ Bulk Processing Engine"]
        Queue["🚦 Concurrency Queue (Default: 2 Worker)"]
        Parser["📥 CSV / Paste / PDF Parser"]
        Validator["🛡️ Zod & Regex Format-Validierer"]
        Backoff["🔁 Exponential Backoff Retry Engine"]
    end

    subgraph Network ["🌐 BZSt Schnittstelle"]
        ViteProxy["🔀 Lokaler Vite Proxy (/bzst-api)"]
        DirectHTTPS["🔒 Direkter HTTPS-Call (CORS-Enabled)"]
    end

    subgraph BZStServer ["🏛️ Bundeszentralamt für Steuern (BZSt)"]
        EVatR["📡 POST /app/v1/abfrage (eVatR REST API)"]
        VIES["🇪🇺 VIES Schnittstelle der EU-Mitgliedstaaten"]
    end

    Launcher --> Electron
    Electron --> LocalServer
    LocalServer --> ReactApp
    ReactApp --> Tailwind
    ReactApp --> Storage
    ReactApp --> CoreEngine
    
    Parser --> Validator
    Validator --> Queue
    Queue --> Backoff
    Backoff --> ViteProxy
    Backoff --> DirectHTTPS
    
    ViteProxy --> EVatR
    DirectHTTPS --> EVatR
    EVatR --> VIES
```

---

## 🔄 Prüfprozess & Entscheidungslogik

Jeder Datensatz durchläuft eine mehrstufige Verifikationskette. Offensichtlich fehlerhafte Datensätze oder fehlende Nummern werden markiert, ohne den Gesamtprozess zu unterbrechen:

```mermaid
flowchart TD
    Start(["📥 Datensatz empfangen"]) --> CheckEmpty{"Ist USt-IdNr.<br/>vorhanden?"}
    
    CheckEmpty -- Nein --> Missing["❌ Status: FEHLT<br/>Firmenname anzeigen, rotes Kreuz"]
    CheckEmpty -- Ja --> Clean["🧹 Bereinigung:<br/>Trim, Uppercase, Leerzeichen/Punkte entfernen"]
    
    Clean --> CheckGerman{"Beginnt mit 'DE'?"}
    CheckGerman -- Ja --> GermanNotAllowed["❌ Status: UNGÜLTIG<br/>Deutsche USt-IdNr. darf nicht<br/>als Ziel angefragt werden"]
    CheckGerman -- Nein --> CheckPrefix{"Gültiges EU-Länderkürzel?<br/>(AT, BE, FR, IT, PL, ES, ...)"}
    
    CheckPrefix -- Nein --> InvalidCountry["❌ Status: UNGÜLTIG<br/>Kein EU-Mitgliedstaat (z. B. MD)"]
    CheckPrefix -- Ja --> RegexCheck{"Syntax-Check:<br/>Länderspezifisches Schema?"}
    
    RegexCheck -- Nein --> SyntaxWarn["⚠️ Vorab-Warnung:<br/>Schema weicht ab (z. B. Ziffernanzahl)"]
    RegexCheck -- Ja --> ChooseMode{"Gewählter Prüfmodus"}
    SyntaxWarn --> ChooseMode
    
    ChooseMode -- Einfach --> BuildSimple["📦 Payload: anfragendeUstid + angefragteUstid"]
    ChooseMode -- Qualifiziert --> CheckQualData{"Firmenname & Ort<br/>vorhanden?"}
    
    CheckQualData -- Nein --> QualMissing["⚠️ Status: ABWEICHUNG<br/>Qualifiziert nicht prüfbar"]
    CheckQualData -- Ja --> BuildQual["📦 Payload: + firmenname, ort, strasse, plz"]
    
    BuildSimple --> Dispatch["🚀 Sende HTTP-POST an BZSt"]
    BuildQual --> Dispatch
    
    Dispatch --> HttpResp{"HTTP-Statuscode?"}
    
    HttpResp -- 200 OK --> ParseCode{"BZSt Statuscode"}
    HttpResp -- 400/403/404 --> ParseCode
    HttpResp -- 500/503/Timeout --> RetryCheck{"Retry < 2?<br/>(Exponential Backoff)"}
    
    RetryCheck -- Ja --> WaitBackoff["⏳ Warten (1.2s * 2^x)"] --> Dispatch
    RetryCheck -- Nein --> ErrorStatus["❌ Status: FEHLER<br/>Server- / Netzwerkfehler"]
    
    ParseCode -- evatr-0000 (Einfach) --> ValidStatus["✔ Status: GÜLTIG<br/>Grüner Haken"]
    ParseCode -- evatr-0000 (Qualifiziert) --> EvalABCD{"Abgleichsergebnisse<br/>ergFirmenname, ergOrt, ..."}
    
    EvalABCD -- Alle A/C/D --> ValidStatus
    EvalABCD -- Mindestens ein B --> MismatchStatus["⚠️ Status: ABWEICHUNG<br/>Name oder Adresse weicht ab"]
    
    ParseCode -- evatr-2001 (Nicht vergeben) --> InvalidStatus["❌ Status: UNGÜLTIG<br/>Nummer existiert nicht"]
    ParseCode -- evatr-2002/2006 (Abgelaufen) --> ExpiredStatus["❌ Status: ABGELAUFEN<br/>Historisch gültig (gueltigBis)"]
    ParseCode -- Sonstige Fehlercodes --> InvalidStatus
```

---

## 🚦 Warteschlangen- & Concurrency-Steuerung

Um das Sperren der IP-Adresse oder Session-Timeouts seitens der BZSt-Server zu verhindern, steuert der Worker-Hook [useCheckQueue.ts](file:///c:/UST-ID-Nr_Check/src/hooks/useCheckQueue.ts) die Anfragen über eine konfigurierbare Concurrency-Queue:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Anwender
    participant UI as 🖥️ React UI (DataTable & MetricCards)
    participant Queue as 🚦 Queue Manager (useCheckQueue)
    participant Worker1 as ⚙️ Worker Slot 1
    participant Worker2 as ⚙️ Worker Slot 2
    participant BZSt as 🏛️ BZSt eVatR API

    User->>UI: Klick auf "Alle prüfen"
    UI->>Queue: startCheck(recordIds)
    Queue->>UI: Status = CHECKING (Progress Bar aktiv)
    
    par Parallele Ausführung (Concurrency = 2)
        Queue->>Worker1: Datensatz #1 (IT07983941217)
        Worker1->>BZSt: POST /app/v1/abfrage
        Queue->>Worker2: Datensatz #2 (DK30720121)
        Worker2->>BZSt: POST /app/v1/abfrage
    end

    BZSt-->>Worker1: 200 OK (evatr-0000)
    Worker1->>UI: Datensatz #1 = GÜLTIG ✔
    Queue->>Worker1: Datensatz #3 (ESB60562956)
    Worker1->>BZSt: POST /app/v1/abfrage

    BZSt-->>Worker2: 503 Service Unavailable
    Worker2->>Queue: Trigger Backoff (Retry 1/2 in 1.2s)
    Note over Worker2: Exponential Backoff Schlafphase
    Worker2->>BZSt: POST /app/v1/abfrage (Wiederholung)
    BZSt-->>Worker2: 200 OK (evatr-0000)
    Worker2->>UI: Datensatz #2 = GÜLTIG ✔

    Note over Queue: Alle Datensätze abgearbeitet
    Queue->>UI: isRunning = false, Confetti Animation 🎉
    UI->>User: Prüfung abgeschlossen (X von Y geprüft)
```

---

## 🔍 Qualifizierter Datenabgleich (A/B/C/D)

Bei der **qualifizierten Bestätigungsabfrage** vergleicht das BZSt die vom Anfragenden übermittelten Angaben mit der Datenbank des zuständigen EU-Mitgliedstaates.

```mermaid
classDiagram
    class RequestPayload {
        +String anfragendeUstid "DE811179766"
        +String angefragteUstid "ATU12345678"
        +String firmenname "Musterhaus GmbH"
        +String ort "Wien"
        +String strasse "Mustergasse 1"
        +String plz "1010"
    }

    class BZStResponse {
        +String id "d65bde441290b41b"
        +String anfrageZeitpunkt "2026-10-20T10:04:37Z"
        +String status "evatr-0000"
        +String ergFirmenname "A"
        +String ergOrt "A"
        +String ergStrasse "B"
        +String ergPlz "A"
        +String gueltigAb "2018-01-01"
        +String gueltigBis ""
    }

    class ComparisonEvaluation {
        +A: Angaben stimmen überein
        +B: Angaben weichen ab (Prüfung nötig!)
        +C: Angaben wurden nicht angefragt
        +D: Keine Auskunft vom Mitgliedstaat
    }

    RequestPayload --> BZStResponse : Abfrage an BZSt
    BZStResponse --> ComparisonEvaluation : Auswertung
```

### Bedeutung der Vergleichsbuchstaben:
| Code | Bedeutung | Darstellung im UI | Auswirkung auf Status |
|:---:|:---|:---|:---|
| **A** | **Stimmt überein** | <span style="color:#107e3e">● Grün (A)</span> | Gültig ✔ |
| **B** | **Stimmt nicht überein** | <span style="color:#bb0000">● Rot (B)</span> | **Abweichung vorhanden ⚠️** |
| **C** | **Nicht angefragt** | <span style="color:#556b82">● Grau (C)</span> | Gültig ✔ (Feld war optional) |
| **D** | **Vom EU-Staat nicht mitgeteilt** | <span style="color:#e9730c">● Orange (D)</span> | Gültig mit Hinweis (z. B. Staat führt keine Straßendaten) |

---

## 📊 Datenfluss & Export-Möglichkeiten

```mermaid
graph LR
    subgraph InputSources ["📥 Datenquellen"]
        Pasted["📋 Copy & Paste"]
        CSVFile["📁 CSV-Upload"]
        Manual["✍️ Manuelle Eingabe"]
        PDFList["📄 PDF Kundenliste 2026"]
    end

    subgraph Processing ["⚙️ Verarbeitung"]
        Clean["Bereinigung & Dedup"]
        Queue["BZSt Abfrage-Warteschlange"]
    end

    subgraph OutputTargets ["📤 Exporte & Nachweise"]
        CSVOut["📊 Excel-CSV (UTF-8 BOM)<br/>Nachweis für Betriebsprüfung"]
        JSONOut["📦 Vollständiger JSON-Audit<br/>Inkl. Roh-Requests & BZSt-IDs"]
        UIDetail["🔍 Interaktives Detail-Modal<br/>Anzeige aller Behördendaten"]
    end

    Pasted --> Clean
    CSVFile --> Clean
    Manual --> Clean
    PDFList --> Clean

    Clean --> Queue
    Queue --> CSVOut
    Queue --> JSONOut
    Queue --> UIDetail
```

---

## 📑 Vollständige BZSt-Statuscode-Referenz

Die Anwendung übersetzt alle 26 offiziellen BZSt-eVatR-Meldungen automatisch in verständliche deutsche Texte:

| Statuscode | HTTP | Kategorie | Offizielle BZSt-Bedeutung | UI-Bewertung |
|:---|:---:|:---:|:---|:---:|
| **`evatr-0000`** | 200 | Ergebnis | Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig. | **Gültig ✔** |
| **`evatr-0001`** | 400 | Hinweis | Bitte bestätigen Sie den Datenschutzhinweis. | Hinweis |
| **`evatr-0002`** | 400 | Hinweis | Mindestens eins der Pflichtfelder ist nicht besetzt. | Fehler ❌ |
| **`evatr-0003`** | 400 | Hinweis | USt-IdNr. ist gültig, aber Pflichtfelder für qualifizierte Abfrage fehlen. | Abweichung ⚠️ |
| **`evatr-0004`** | 400 | Fehler | Die anfragende DE USt-IdNr. ist syntaktisch falsch. | Eigene Nr. falsch |
| **`evatr-0005`** | 400 | Fehler | Die angegebene angefragte USt-IdNr. ist syntaktisch falsch. | Ungültig ❌ |
| **`evatr-0006`** | 403 | Hinweis | Die anfragende DE USt-IdNr. darf keine DE USt-IdNr. anfragen. | DE nicht erlaubt ❌ |
| **`evatr-0007`** | 403 | Hinweis | Fehlerhafter Aufruf der Schnittstelle. | Fehler ❌ |
| **`evatr-0008`** | 403 | Hinweis | Maximale Anzahl an qualifizierten Abfragen der Session erreicht. | Session-Limit |
| **`evatr-0011`** | 503 | Fehler | Bearbeitung zurzeit nicht möglich. Bitte später versuchen. | Retry / Fehler |
| **`evatr-0012`** | 400 | Fehler | Die USt-IdNr. passt nicht in das Erzeugungsschema des Landes. | Ungültig ❌ |
| **`evatr-0013`** | 503 | Fehler | Server überlastet. | Retry / Fehler |
| **`evatr-1001`** | 503 | Fehler | Systemüberlastung beim BZSt. | Retry / Fehler |
| **`evatr-1002..1004`** | 500 | Fehler | Interner Serverfehler im BZSt-Rechenzentrum. | Retry / Fehler |
| **`evatr-2001`** | 404 | Hinweis | Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht vergeben. | **Ungültig ❌** |
| **`evatr-2002`** | 200 | Hinweis | Zum Anfragezeitpunkt noch nicht gültig (erst ab `gueltigAb`). | **Ungültig ❌** |
| **`evatr-2003`** | 400 | Fehler | Das angegebene Länderkennzeichen ist nicht gültig. | Ungültig ❌ |
| **`evatr-2004`** | 500 | Fehler | Mitgliedstaat nicht erreichbar (VIES-Ausfall im Partnerland). | Partnerland down |
| **`evatr-2005`** | 404 | Fehler | Die eigene DE USt-IdNr. ist zum Anfragezeitpunkt nicht gültig. | Eigene Nr. ungültig |
| **`evatr-2006`** | 200 | Hinweis | USt-IdNr. ist nicht mehr gültig (war gültig bis `gueltigBis`). | **Abgelaufen ❌** |
| **`evatr-2007`** | 500 | Fehler | Verarbeitungsfehler im angefragten Mitgliedstaat. | Partnerland-Fehler |
| **`evatr-2008`** | 200 | Hinweis | USt-IdNr. ist gültig. Für qualifizierte Abfrage liegt Besonderheit vor. | **Gültig mit Hinweis ✔** |
| **`evatr-2011..3011`** | 500 | Fehler | Allgemeine Verarbeitungsstörung beim BZSt. | Retry / Fehler |

---

## 📁 Dokumentationsordner `2026/`

Im Ordner [`c:\UST-ID-Nr_Check\2026\`](file:///c:/UST-ID-Nr_Check/2026) liegen alle Vorlagen und durchgeführten Nachweise für Steuerprüfungen und Audits:

| Datei | Beschreibung |
|:---|:---|
| **`UST-ID-Nr 2026 SK.pdf`** | Die Original-Kundenliste (Blatt 3 bis 8) mit allen 170+ Kundendaten. |
| **`ust_id_pruefung_2026-10-20.csv`** | Der durchgeführte Export-Prüfbericht mit Zeitstempel, BZSt-Statuscodes, Einzelabgleichen und IDs. |
| **`*.xlsx`** | Hier können Sie Ihre interne Excel-Dokumentation ergänzen. |

---

## 🚀 Schnellstart & Bedienung

### 1. App als native Desktop-App starten
Doppelklick auf die Verknüpfung auf Ihrem Windows-Desktop:
👉 **`USt-ID Bulk Checker.lnk`**

*(Alternativ: Doppelklick auf die Datei [Start-App.bat](file:///c:/UST-ID-Nr_Check/Start-App.bat))*

### 2. Im Browser starten (Entwicklermodus)
```bash
# 1. In das Verzeichnis wechseln
cd c:\UST-ID-Nr_Check

# 2. Entwicklungsserver starten
npm run dev

# 3. Aufrufen unter: http://localhost:5173/
```

### 3. Produktions-Build erstellen
```bash
npm run build
```

---

## 🛠️ Verwendete Technologien

- **Frontend-Framework:** [React 19](https://react.dev/) mit [TypeScript](https://www.typescriptlang.org/)
- **Bundler & DevServer:** [Vite 8](https://vitejs.dev/)
- **Desktop Runtime:** [Electron 30](https://www.electronjs.org/)
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/) im SAP Fiori Horizon Farbschema
- **Icons:** [Lucide React](https://lucide.dev/)
- **CSV-Engine:** [PapaParse](https://www.papaparse.com/)
- **Validierung:** [Zod](https://zod.dev/)
- **PDF-Engine:** [PDF.js (Mozilla)](https://mozilla.github.io/pdf.js/)
- **Animationen:** [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)
