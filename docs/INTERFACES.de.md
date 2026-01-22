# Oberflächen-Leitfaden

Dieser Leitfaden behandelt die beiden primären Oberflächen für Spec Workflow MCP: das Web-Dashboard und die VSCode Extension.

## Überblick

Spec Workflow MCP bietet zwei Oberflächen:

1. **Web-Dashboard** - Browser-basierte Oberfläche für CLI-Benutzer
2. **VSCode Extension** - Integrierte IDE-Erfahrung für VSCode-Benutzer

Beide Oberflächen bieten die gleiche Kernfunktionalität mit plattformspezifischen Optimierungen.

## Web-Dashboard

### Überblick

Das Web-Dashboard ist eine Echtzeit-Webanwendung, die visuellen Zugriff auf Ihre Specs, Aufgaben und Freigabe-Workflows bietet.

### Dashboard starten

#### Eigenständiges Dashboard
```bash
# Verwendet ephemeren Port
npx -y @pimzino/spec-workflow-mcp@latest /pfad/zu/projekt --dashboard

# Benutzerdefinierter Port
npx -y @pimzino/spec-workflow-mcp@latest /pfad/zu/projekt --dashboard --port 3000
```

#### Mit MCP-Server
```bash
# MCP-Server und Dashboard separat ausführen (empfohlen)
# Terminal 1: Dashboard starten
npx -y @pimzino/spec-workflow-mcp@latest --dashboard

# Terminal 2: MCP-Server starten
npx -y @pimzino/spec-workflow-mcp@latest /pfad/zu/projekt
```

### Dashboard-Funktionen

#### Hauptansicht

Das Dashboard-Home zeigt:

- **Projektübersicht**
  - Anzahl aktiver Specs
  - Gesamtanzahl Aufgaben
  - Fertigstellungsprozentsatz
  - Letzte Aktivität

- **Spec-Karten**
  - Spec-Name und Status
  - Fortschrittsbalken
  - Dokumentindikatoren
  - Schnellaktionen

#### Spec-Detailansicht

Durch Klicken auf eine Spec wird angezeigt:

- **Dokumenttabs**
  - Anforderungen
  - Design
  - Aufgaben

- **Dokumentinhalt**
  - Gerendertes Markdown
  - Syntax-Highlighting
  - Inhaltsverzeichnis

- **Freigabeaktionen**
  - Genehmigen-Schaltfläche
  - Änderungen anfordern
  - Ablehnungsoption
  - Kommentarfeld

#### Aufgabenverwaltung

Die Aufgabenansicht bietet:

- **Hierarchische Aufgabenliste**
  - Nummerierte Aufgaben (1.0, 1.1, 1.1.1)
  - Statusindikatoren
  - Fortschrittsverfolgung

- **Aufgabenaktionen**
  - Prompt-Schaltfläche kopieren
  - Als erledigt markieren
  - Notizen hinzufügen
  - Abhängigkeiten anzeigen

- **Fortschrittsvisualisierung**
  - Gesamtfortschrittsbalken
  - Abschnittsfortschritt
  - Zeitschätzungen

#### Steering-Dokumente

Zugriff auf Projektleitlinien:

- **Product Steering**
  - Vision und Ziele
  - Benutzer-Personas
  - Erfolgsmetriken

- **Technical Steering**
  - Architekturentscheidungen
  - Technologieauswahl
  - Leistungsziele

- **Structure Steering**
  - Dateiorganisation
  - Namenskonventionen
  - Modulgrenzen

### Dashboard-Navigation

#### Tastaturkürzel

| Kürzel | Aktion |
|--------|--------|
| `Alt + S` | Spec-Liste fokussieren |
| `Alt + T` | Aufgaben anzeigen |
| `Alt + R` | Anforderungen anzeigen |
| `Alt + D` | Design anzeigen |
| `Alt + A` | Freigabe-Dialog öffnen |
| `Esc` | Dialog schließen |

#### URL-Struktur

Direkte Links zu bestimmten Ansichten:
- `/` - Home-Dashboard
- `/spec/{name}` - Spezifische Spec
- `/spec/{name}/requirements` - Anforderungsdokument
- `/spec/{name}/design` - Design-Dokument
- `/spec/{name}/tasks` - Aufgabenliste
- `/steering/{type}` - Steering-Dokumente

### Echtzeit-Updates

Das Dashboard verwendet WebSockets für Live-Updates:

- **Automatische Aktualisierung**
  - Neue Specs erscheinen sofort
  - Aufgabenstatusaktualisierungen
  - Fortschrittsänderungen
  - Freigabe-Benachrichtigungen

- **Verbindungsstatus**
  - Grün: Verbunden
  - Gelb: Wiederverbinden
  - Rot: Getrennt

- **Benachrichtigungssystem**
  - Freigabeanfragen
  - Aufgabenerledigungen
  - Fehlerwarnungen
  - Erfolgsmeldungen

### Dashboard-Anpassung

#### Theme-Einstellungen

Zwischen hellem und dunklem Modus wechseln:
- Theme-Symbol im Header klicken
- Bleibt über Sitzungen hinweg bestehen
- Respektiert Systempräferenz

#### Sprachauswahl

Oberflächensprache ändern:
1. Einstellungssymbol klicken
2. Sprache aus Dropdown auswählen
3. Oberfläche wird sofort aktualisiert

Unterstützte Sprachen:
- English (en)
- Japanese (ja)
- Chinese (zh)
- Spanish (es)
- Portuguese (pt)
- German (de)
- French (fr)
- Russian (ru)
- Italian (it)
- Korean (ko)
- Arabic (ar)

#### Anzeigeoptionen

Ansichtspräferenzen anpassen:
- Kompakte/erweiterte Spec-Karten
- Erledigte Aufgaben ein-/ausblenden
- Dokumentschriftgröße
- Code-Syntax-Theme

## VSCode Extension

### Installation

Aus dem VSCode Marketplace installieren:

1. VSCode Extensions öffnen (Strg+Shift+X)
2. Nach "Spec Workflow MCP" suchen
3. Installieren klicken
4. VSCode neu laden

Oder über Befehlszeile:
```bash
code --install-extension Pimzino.spec-workflow-mcp
```

### Extension-Funktionen

#### Sidebar-Panel

Über Activity Bar-Symbol zugreifen:

- **Spec Explorer**
  - Baumansicht aller Specs
  - Erweitern, um Dokumente zu sehen
  - Statusindikatoren
  - Kontextmenüaktionen

- **Aufgabenliste**
  - Filterbare Aufgabenansicht
  - Fortschrittsverfolgung
  - Schnellaktionen
  - Suchfunktion

- **Archivansicht**
  - Erledigte Specs
  - Historische Daten
  - Wiederherstellungsoption
  - Massenoperationen

#### Dokumentbetrachter

Dokumente im Editor öffnen:

- **Syntax-Highlighting**
  - Markdown-Rendering
  - Codeblöcke
  - Aufgaben-Checkboxen
  - Links und Referenzen

- **Dokumentaktionen**
  - Direkt bearbeiten
  - Vorschaumodus
  - Geteilte Ansicht
  - Exportoptionen

#### Integrierte Freigaben

Native VSCode-Dialoge für:

- **Freigabeanfragen**
  - Pop-up-Benachrichtigungen
  - Inline-Kommentare
  - Schnell genehmigen/ablehnen
  - Detailliertes Feedback

- **Revisionsworkflow**
  - Änderungen verfolgen
  - Kommentar-Threads
  - Versionsvergleich
  - Freigabeverlauf

#### Kontextmenüaktionen

Rechtsklick-Aktionen im Editor:

- **Bei Spec-Dateien**
  - Dokument genehmigen
  - Änderungen anfordern
  - Im Dashboard anzeigen
  - Spec-Pfad kopieren

- **Bei Aufgabenelementen**
  - Als erledigt markieren
  - Prompt kopieren
  - Unteraufgabe hinzufügen
  - Details anzeigen

### Extension-Einstellungen

In VSCode-Einstellungen konfigurieren:

```json
{
  "specWorkflow.language": "de",
  "specWorkflow.notifications.enabled": true,
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.5,
  "specWorkflow.archive.showInExplorer": true,
  "specWorkflow.tasks.autoRefresh": true,
  "specWorkflow.tasks.refreshInterval": 5000,
  "specWorkflow.theme.followVSCode": true
}
```

#### Einstellungsbeschreibungen

| Einstellung | Beschreibung | Standard |
|-------------|--------------|----------|
| `language` | Oberflächensprache | "en" |
| `notifications.enabled` | Benachrichtigungen anzeigen | true |
| `notifications.sound` | Sound-Warnungen abspielen | true |
| `notifications.volume` | Sound-Lautstärke (0-1) | 0.5 |
| `archive.showInExplorer` | Archivierte Specs anzeigen | true |
| `tasks.autoRefresh` | Aufgaben auto-aktualisieren | true |
| `tasks.refreshInterval` | Aktualisierungsintervall (ms) | 5000 |
| `theme.followVSCode` | VSCode-Theme übernehmen | true |

### Extension-Befehle

Verfügbar in der Befehlspalette (Strg+Shift+P):

| Befehl | Beschreibung |
|--------|--------------|
| `Spec Workflow: Create Spec` | Neue Spec starten |
| `Spec Workflow: List Specs` | Alle Specs anzeigen |
| `Spec Workflow: View Dashboard` | Web-Dashboard öffnen |
| `Spec Workflow: Archive Spec` | Ins Archiv verschieben |
| `Spec Workflow: Restore Spec` | Aus Archiv wiederherstellen |
| `Spec Workflow: Refresh` | Spec-Daten neu laden |
| `Spec Workflow: Show Steering` | Steering-Dokumente anzeigen |
| `Spec Workflow: Export Spec` | Als Markdown exportieren |

### Sound-Benachrichtigungen

Die Extension enthält Audio-Warnungen für:

- **Freigabeanfragen** - Sanfter Gong
- **Aufgabenerledigungen** - Erfolgssound
- **Fehler** - Warnton
- **Updates** - Sanfte Benachrichtigung

In Einstellungen konfigurieren:
```json
{
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.3
}
```

## Funktionsvergleich

| Funktion | Web-Dashboard | VSCode Extension |
|----------|--------------|------------------|
| Specs anzeigen | ✅ | ✅ |
| Aufgaben verwalten | ✅ | ✅ |
| Freigaben | ✅ | ✅ |
| Echtzeit-Updates | ✅ | ✅ |
| Archivsystem | ❌ | ✅ |
| Sound-Benachrichtigungen | ❌ | ✅ |
| Editor-Integration | ❌ | ✅ |
| Kontextmenüs | ❌ | ✅ |
| Tastaturkürzel | Begrenzt | Vollständig |
| Mehrprojekt | Manuell | Automatisch |
| Offline-Zugriff | ❌ | ✅ |
| Exportoptionen | Basis | Erweitert |

## Die richtige Oberfläche wählen

### Web-Dashboard verwenden, wenn:

- CLI-basierte AI-Tools verwendet werden
- Über mehrere IDEs gearbeitet wird
- Browser-basierter Zugriff benötigt wird
- Mit Teammitgliedern geteilt wird
- Schnelle Projektübersicht benötigt wird

### VSCode Extension verwenden, wenn:

- Primäre IDE VSCode ist
- Integrierte Erfahrung gewünscht wird
- Editor-Funktionen benötigt werden
- Native Dialoge bevorzugt werden
- Sound-Benachrichtigungen gewünscht werden

## Oberflächen-Synchronisation

Beide Oberflächen teilen die gleichen Daten:

- **Echtzeit-Sync**
  - Änderungen in einer spiegeln sich in der anderen
  - Gemeinsamer Freigabestatus
  - Konsistenter Aufgabenstatus
  - Einheitliche Fortschrittsverfolgung

- **Datenspeicherung**
  - Einzelne Quelle der Wahrheit
  - Dateibasierte Speicherung
  - Keine Synchronisation benötigt
  - Sofortige Updates

## Mobile und Tablet-Zugriff

### Web-Dashboard auf Mobilgeräten

Das Dashboard ist responsiv:

- **Telefonansicht**
  - Gestapelte Spec-Karten
  - Einklappbare Navigation
  - Touch-optimierte Schaltflächen
  - Wischgesten

- **Tablet-Ansicht**
  - Seite-an-Seite-Layout
  - Touch-Interaktionen
  - Optimierter Abstand
  - Querformat-Unterstützung

### Einschränkungen auf Mobilgeräten

- Keine VSCode Extension
- Begrenzte Tastaturkürzel
- Reduziertes Multitasking
- Vereinfachte Interaktionen

## Barrierefreiheit

### Web-Dashboard

- **Tastaturnavigation**
  - Mit Tab durch Elemente
  - Enter zum Aktivieren
  - Escape zum Abbrechen
  - Pfeiltasten für Listen

- **Screenreader-Unterstützung**
  - ARIA-Labels
  - Rollenattribute
  - Statusankündigungen
  - Fokusverwaltung

- **Visuelle Barrierefreiheit**
  - Hochkontrastmodus
  - Anpassbare Schriftgröße
  - Farbenblind-freundlich
  - Fokusindikatoren

### VSCode Extension

Erbt VSCode-Barrierefreiheit:
- Screenreader-Unterstützung
- Tastaturnavigation
- Hochkontrast-Themes
- Zoom-Funktionalität

## Leistungsoptimierung

### Dashboard-Leistung

- **Lazy Loading**
  - Dokumente werden bei Bedarf geladen
  - Paginierung für lange Listen
  - Progressive Rendering
  - Bildoptimierung

- **Caching-Strategie**
  - Browser-Caching
  - Service Worker
  - Offline-Unterstützung (begrenzt)
  - Schnelle Navigation

### Extension-Leistung

- **Ressourcenverwaltung**
  - Minimale Speichernutzung
  - Effizientes Datei-Watching
  - Debounced Updates
  - Hintergrundverarbeitung

## Fehlerbehebung bei Oberflächenproblemen

### Dashboard-Probleme

| Problem | Lösung |
|---------|--------|
| Lädt nicht | Server läuft prüfen, URL verifizieren |
| Keine Updates | WebSocket-Verbindung prüfen, Seite aktualisieren |
| Freigabe funktioniert nicht | Sicherstellen, dass Dashboard und MCP verbunden sind |
| Styling defekt | Browser-Cache leeren, Konsole prüfen |

### Extension-Probleme

| Problem | Lösung |
|---------|--------|
| Zeigt keine Specs | Prüfen, ob Projekt .spec-workflow-Verzeichnis hat |
| Befehle funktionieren nicht | VSCode-Fenster neu laden |
| Keine Benachrichtigungen | Extension-Einstellungen prüfen |
| Archiv nicht sichtbar | In Einstellungen aktivieren |

## Verwandte Dokumentation

- [Konfigurationsanleitung](CONFIGURATION.de.md) - Einrichtung und Konfiguration
- [Benutzerhandbuch](USER-GUIDE.de.md) - Verwendung der Oberflächen
- [Workflow-Prozess](WORKFLOW.de.md) - Entwicklungsworkflow
- [Fehlerbehebung](TROUBLESHOOTING.de.md) - Häufige Probleme
