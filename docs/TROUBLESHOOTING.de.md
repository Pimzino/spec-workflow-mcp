# Fehlerbehebungsanleitung

Diese Anleitung hilft Ihnen, häufige Probleme mit Spec Workflow MCP zu lösen.

## Schnelldiagnose

### Installation überprüfen
```bash
# NPM-Paket-Zugänglichkeit überprüfen
npx -y @pimzino/spec-workflow-mcp@latest --help

# Prüfen, ob im richtigen Verzeichnis ausgeführt wird
pwd  # oder 'cd' unter Windows

# .spec-workflow-Verzeichnis überprüfen
ls -la .spec-workflow  # oder 'dir .spec-workflow' unter Windows
```

### Dienste überprüfen
```bash
# MCP-Server testen
npx -y @pimzino/spec-workflow-mcp@latest /pfad/zu/projekt

# Dashboard testen
npx -y @pimzino/spec-workflow-mcp@latest /pfad/zu/projekt --dashboard

# Port-Verfügbarkeit prüfen
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## Häufige Probleme und Lösungen

## Installationsprobleme

### NPM-Paket nicht gefunden

**Fehler**: `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**Lösungen**:
1. Internetverbindung überprüfen
2. NPM-Cache leeren:
   ```bash
   npm cache clean --force
   ```
3. Ohne Versions-Tag versuchen:
   ```bash
   npx @pimzino/spec-workflow-mcp /pfad/zu/projekt
   ```
4. Zuerst global installieren:
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /pfad/zu/projekt
   ```

### Zugriff verweigert

**Fehler**: `EACCES: permission denied`

**Lösungen**:
1. **macOS/Linux**: Richtige NPM-Berechtigungen verwenden:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**: Als Administrator ausführen oder NPM-Berechtigungen korrigieren:
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. npx mit -y Flag verwenden:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## MCP-Server-Probleme

### Server startet nicht

**Fehler**: `Failed to start MCP server`

**Lösungen**:
1. Node.js-Version überprüfen:
   ```bash
   node --version  # Sollte 18.0 oder höher sein
   ```
2. Projektpfad existiert überprüfen:
   ```bash
   ls -la /pfad/zu/projekt
   ```
3. Nach konkurrierenden Prozessen suchen:
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. Mit absolutem Pfad versuchen:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP verbindet sich nicht mit AI-Tool

**Fehler**: `MCP server unreachable` oder `Connection refused`

**Lösungen**:

1. **Claude Desktop**: Konfigurationsdatei überprüfen:
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/absoluter/pfad/zu/projekt"]
       }
     }
   }
   ```

2. **Claude Code CLI**: Setup überprüfen:
   ```bash
   claude mcp list  # Prüfen, ob spec-workflow aufgelistet ist
   claude mcp remove spec-workflow  # Entfernen falls vorhanden
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /pfad/zu/projekt
   ```

3. **Pfad-Probleme**: Sicherstellen, dass Pfad absolut ist und existiert:
   - ❌ `~/projekt` oder `./projekt`
   - ✅ `/Users/name/projekt` oder `C:\Users\name\projekt`

### Tools nicht verfügbar

**Fehler**: `Tool 'spec-workflow' not found`

**Lösungen**:
1. AI-Tool vollständig neu starten
2. Prüfen, ob MCP-Server läuft (nach Prozess suchen)
3. Überprüfen, ob Konfiguration korrekt gespeichert ist
4. Tool explizit erwähnen: "Verwende spec-workflow, um eine Spec zu erstellen"

## Dashboard-Probleme

### Dashboard lädt nicht

**Fehler**: `Cannot connect to dashboard` oder leere Seite

**Lösungen**:
1. Dashboard-Start überprüfen:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /pfad --dashboard
   ```
2. URL im Browser überprüfen (Port beachten):
   ```
   http://localhost:3000  # Oder welcher Port auch immer angezeigt wird
   ```
3. Anderen Browser oder Inkognito-Modus versuchen
4. Browser-Konsole auf Fehler überprüfen (F12 → Konsole)
5. Browser-Erweiterungen temporär deaktivieren

### Port bereits verwendet

**Fehler**: `Error: listen EADDRINUSE: address already in use :::3000`

**Lösungen**:
1. Anderen Port verwenden:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /pfad --dashboard --port 3456
   ```
2. Prozess finden und beenden, der den Port verwendet:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. Ephemeren Port verwenden (--port Flag weglassen):
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /pfad --dashboard
   ```

### WebSocket-Verbindung fehlgeschlagen

**Fehler**: `WebSocket connection lost` oder Echtzeit-Updates funktionieren nicht

**Lösungen**:
1. Browser-Seite aktualisieren
2. Prüfen, ob Firewall WebSocket blockiert
3. Überprüfen, ob Dashboard und MCP-Server vom gleichen Projekt laufen
4. Browser-Konsole auf spezifische Fehler prüfen
5. Anderes Netzwerk versuchen (wenn im Unternehmensnetzwerk)

### Dashboard aktualisiert nicht

**Symptome**: Änderungen werden nicht in Echtzeit widergespiegelt

**Lösungen**:
1. Hard Refresh im Browser (Strg+Shift+R oder Cmd+Shift+R)
2. Browser-Cache leeren
3. WebSocket-Verbindungsstatus prüfen (sollte grün zeigen)
4. Überprüfen, ob Dateisystem-Watcher funktionieren:
   ```bash
   # Testdatei im Projekt erstellen
   touch .spec-workflow/test.md
   # Sollte Update im Dashboard auslösen
   ```

## Freigabesystem-Probleme

### Freigaben werden nicht angezeigt

**Fehler**: Keine Freigabe-Benachrichtigungen im Dashboard

**Lösungen**:
1. Sicherstellen, dass Dashboard neben MCP-Server läuft:
   ```bash
   # Beide separat ausführen
   # Terminal 1: Dashboard starten
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard
   # Terminal 2: MCP-Server starten
   npx -y @pimzino/spec-workflow-mcp@latest /pfad
   ```
2. Freigabe-Verzeichnis existiert überprüfen:
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. Freigabeanfrage manuell über AI auslösen

### Dokumente können nicht freigegeben werden

**Fehler**: Freigabe-Schaltflächen funktionieren nicht

**Lösungen**:
1. Browser-Konsole auf JavaScript-Fehler prüfen
2. Überprüfen, ob Sie auf der richtigen Spec-Seite sind
3. Sicherstellen, dass Dokument ausstehenden Freigabestatus hat
4. VSCode Extension stattdessen versuchen (falls verfügbar)

## Dateisystem-Probleme

### Spec-Dateien werden nicht erstellt

**Fehler**: Spec-Dokumente erscheinen nicht im Dateisystem

**Lösungen**:
1. Schreibberechtigungen prüfen:
   ```bash
   touch .spec-workflow/test.txt
   ```
2. Korrektes Arbeitsverzeichnis überprüfen:
   ```bash
   pwd  # Sollte Ihr Projektstammverzeichnis sein
   ```
3. Nach versteckten Dateien suchen:
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. Prüfen, ob Antivirus Dateierstellung blockiert

### Zugriff auf Dateien verweigert

**Fehler**: `EACCES` oder `Permission denied` beim Erstellen von Specs

**Lösungen**:
1. Verzeichnisberechtigungen korrigieren:
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. Dateibesitz überprüfen:
   ```bash
   ls -la .spec-workflow
   # Sollte Ihrem Benutzer gehören
   ```
3. Von einem Verzeichnis ausführen, das Ihnen gehört (nicht System-Verzeichnisse)

## VSCode Extension-Probleme

### Extension lädt nicht

**Fehler**: Spec Workflow-Symbol erscheint nicht in der Activity Bar

**Lösungen**:
1. Extension installiert überprüfen:
   - Extensions öffnen (Strg+Shift+X)
   - Nach "Spec Workflow MCP" suchen
   - Prüfen, ob installiert und aktiviert
2. VSCode-Fenster neu laden:
   - Strg+Shift+P → "Developer: Reload Window"
3. Extension-Ausgabe prüfen:
   - Ansicht → Ausgabe → "Spec Workflow" aus Dropdown auswählen
4. Sicherstellen, dass Projekt `.spec-workflow`-Verzeichnis hat

### Extension-Befehle funktionieren nicht

**Fehler**: Befehle schlagen fehl oder zeigen Fehler

**Lösungen**:
1. Projektordner öffnen, der `.spec-workflow` enthält
2. Prüfen, ob VSCode korrekten Workspace verwendet
3. Extension-Logs auf spezifische Fehler anzeigen
4. Extension neu installieren versuchen:
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## Konfigurationsprobleme

### Konfigurationsdatei lädt nicht

**Fehler**: Einstellungen in config.toml werden nicht angewendet

**Lösungen**:
1. TOML-Syntax überprüfen:
   ```bash
   # TOML-Validator installieren
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. Dateispeicherort prüfen:
   - Standard: `.spec-workflow/config.toml`
   - Benutzerdefiniert: `--config` Flag verwenden
3. Sicherstellen, dass keine Syntaxfehler:
   ```toml
   # Korrekt
   port = 3000
   lang = "de"

   # Falsch
   port: 3000  # Sollte = verwenden, nicht :
   lang = de   # Sollte Anführungszeichen haben
   ```

### Befehlszeilenargumente funktionieren nicht

**Fehler**: Flags wie `--port` werden ignoriert

**Lösungen**:
1. Argumentreihenfolge prüfen:
   ```bash
   # Korrekt
   npx -y @pimzino/spec-workflow-mcp@latest /pfad --dashboard --port 3000

   # Falsch
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /pfad --port 3000
   ```
2. Sicherstellen, dass Flag-Werte gültig sind:
   - Port: 1024-65535
   - Sprache: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. `--help` verwenden, um alle Optionen zu sehen

## Leistungsprobleme

### Langsame Antwortzeiten

**Symptome**: Dashboard oder Tools antworten langsam

**Lösungen**:
1. Systemressourcen prüfen:
   ```bash
   # CPU- und Speichernutzung
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. Datei-Watcher in großen Projekten reduzieren:
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. Alte Freigabedatensätze löschen:
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. Spezifische Spec-Namen statt Auflistung aller verwenden

### Hohe Speichernutzung

**Lösungen**:
1. Dienste regelmäßig neu starten
2. Dashboard-Aktualisierungsrate begrenzen:
   ```json
   // VSCode-Einstellungen
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. Erledigte Specs archivieren
4. Browser-Cache für Dashboard leeren

## Plattformspezifische Probleme

### Windows

#### Pfadformat-Probleme
**Fehler**: `Invalid path` oder Pfad nicht gefunden

**Lösungen**:
```bash
# Schrägstriche verwenden
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/name/projekt

# Oder maskierte Backslashes
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\name\\projekt"
```

#### PowerShell-Ausführungsrichtlinie
**Fehler**: `cannot be loaded because running scripts is disabled`

**Lösungen**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Gatekeeper blockiert
**Fehler**: `cannot be opened because the developer cannot be verified`

**Lösungen**:
1. Systemeinstellungen → Sicherheit & Datenschutz → Erlauben
2. Oder Quarantäne entfernen:
   ```bash
   xattr -d com.apple.quarantine /pfad/zu/node_modules
   ```

### Linux

#### Fehlende Abhängigkeiten
**Fehler**: `shared library not found`

**Lösungen**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## Hilfe erhalten

### Diagnoseinformationen

Beim Melden von Problemen einschließen:

1. **Systeminformationen**:
   ```bash
   node --version
   npm --version
   uname -a  # oder 'ver' unter Windows
   ```

2. **Fehlermeldungen**:
   - Vollständiger Fehlertext
   - Screenshot bei visuellem Problem
   - Browser-Konsolen-Logs

3. **Konfiguration**:
   - MCP-Client-Konfiguration
   - config.toml-Inhalte
   - Verwendete Befehlszeile

4. **Reproduktionsschritte**:
   - Genaue ausgeführte Befehle
   - Erwartetes Verhalten
   - Tatsächliches Verhalten

### Support-Kanäle

1. **GitHub Issues**: [Issue erstellen](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **Dokumentation**: Andere Anleitungen in `/docs` prüfen
3. **Community**: Diskussionen und Q&A

### Debug-Modus

Ausführliches Logging aktivieren:

```bash
# Umgebungsvariable setzen
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# Mit Debug-Ausgabe ausführen
npx -y @pimzino/spec-workflow-mcp@latest /pfad --debug
```

## Präventions-Tipps

### Best Practices

1. **Immer absolute Pfade verwenden** in Konfigurationen
2. **Node.js aktuell halten** (v18+ erforderlich)
3. **Vom Projektstammverzeichnis ausführen**
4. **--help verwenden** um Optionen zu überprüfen
5. **In sauberer Umgebung testen** wenn Probleme auftreten
6. **Logs prüfen** bevor Fehler angenommen wird
7. **.spec-workflow-Verzeichnis regelmäßig sichern**

### Regelmäßige Wartung

1. Alte Freigaben monatlich löschen
2. Erledigte Specs archivieren
3. NPM-Pakete regelmäßig aktualisieren
4. Festplattenspeicher für Logs überwachen
5. Dienste nach Updates neu starten

## Verwandte Dokumentation

- [Konfigurationsanleitung](CONFIGURATION.de.md) - Detaillierte Konfigurationsoptionen
- [Benutzerhandbuch](USER-GUIDE.de.md) - Allgemeine Nutzungsanweisungen
- [Entwicklungsanleitung](DEVELOPMENT.de.md) - Für das Beisteuern von Fixes
- [Oberflächen-Leitfaden](INTERFACES.de.md) - Dashboard- und Extension-Details
