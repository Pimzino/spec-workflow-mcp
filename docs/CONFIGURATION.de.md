# Konfigurationsanleitung

Diese Anleitung deckt alle Konfigurationsoptionen für Spec Workflow MCP ab.

## Befehlszeilenoptionen

### Grundlegende Verwendung

```bash
npx -y @pimzino/spec-workflow-mcp@latest [projekt-pfad] [optionen]
```

### Verfügbare Optionen

| Option | Beschreibung | Beispiel |
|--------|--------------|----------|
| `--help` | Umfassende Nutzungsinformationen anzeigen | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | Nur-Dashboard-Modus ausführen (Standardport: 5000) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--port <nummer>` | Benutzerdefinierten Dashboard-Port angeben (1024-65535) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080` |

### Wichtige Hinweise

- **Einzelne Dashboard-Instanz**: Nur ein Dashboard läuft gleichzeitig. Alle MCP-Server verbinden sich mit demselben Dashboard.
- **Standardport**: Dashboard verwendet standardmäßig Port 5000. Verwenden Sie `--port` nur, wenn 5000 nicht verfügbar ist.
- **Separates Dashboard**: Führen Sie das Dashboard immer separat von MCP-Servern aus.

## Verwendungsbeispiele

### Typischer Workflow

1. **Dashboard starten** (zuerst tun, nur einmal):
```bash
# Verwendet Standardport 5000
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

2. **MCP-Server starten** (einer pro Projekt, in separaten Terminals):
```bash
# Projekt 1
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app1

# Projekt 2
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app2

# Projekt 3
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app3
```

Alle Projekte werden im Dashboard unter http://localhost:5000 angezeigt

### Dashboard mit benutzerdefiniertem Port

Verwenden Sie einen benutzerdefinierten Port nur, wenn Port 5000 nicht verfügbar ist:

```bash
# Dashboard auf Port 8080 starten
npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
```

## Umgebungsvariablen

### SPEC_WORKFLOW_HOME

Überschreiben Sie das standardmäßige globale Zustandsverzeichnis (`~/.spec-workflow-mcp`). Dies ist nützlich für Sandbox-Umgebungen, in denen `$HOME` schreibgeschützt ist.

| Variable | Standard | Beschreibung |
|----------|----------|--------------|
| `SPEC_WORKFLOW_HOME` | `~/.spec-workflow-mcp` | Verzeichnis für globale Zustandsdateien |

**In diesem Verzeichnis gespeicherte Dateien:**
- `activeProjects.json` - Projektregister
- `activeSession.json` - Dashboard-Sitzungsinformationen
- `settings.json` - Globale Einstellungen
- `job-execution-history.json` - Job-Ausführungsverlauf
- `migration.log` - Tracking der Implementierungs-Log-Migration

**Verwendungsbeispiele:**

```bash
# Absoluter Pfad
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace

# Relativer Pfad (wird gegen das aktuelle Arbeitsverzeichnis aufgelöst)
SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest .

# Für Dashboard-Modus
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

**Sandbox-Umgebungen (z.B. Codex CLI):**

Bei Ausführung in Sandbox-Umgebungen wie Codex CLI mit `sandbox_mode=workspace-write`, setzen Sie `SPEC_WORKFLOW_HOME` auf einen beschreibbaren Ort innerhalb Ihres Arbeitsbereichs:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

## Dashboard-Sitzungsverwaltung

Das Dashboard speichert seine Sitzungsinformationen in `~/.spec-workflow-mcp/activeSession.json` (oder `$SPEC_WORKFLOW_HOME/activeSession.json` falls gesetzt). Diese Datei:
- Erzwingt einzelne Dashboard-Instanz
- Ermöglicht MCP-Servern das laufende Dashboard zu finden
- Räumt automatisch auf, wenn das Dashboard stoppt

### Durchsetzung einer einzelnen Instanz

Nur ein Dashboard kann gleichzeitig laufen. Wenn Sie versuchen, ein zweites Dashboard zu starten:

```
Dashboard läuft bereits unter: http://localhost:5000

Sie können:
  1. Das vorhandene Dashboard verwenden unter: http://localhost:5000
  2. Es zuerst stoppen (Strg+C oder kill PID), dann ein neues starten

Hinweis: Nur eine Dashboard-Instanz wird für alle Ihre Projekte benötigt.
```

## Port-Verwaltung

**Standardport**: 5000
**Benutzerdefinierter Port**: Verwenden Sie `--port <nummer>` nur, wenn Port 5000 nicht verfügbar ist

### Port-Konflikte

Wenn Port 5000 bereits von einem anderen Dienst verwendet wird:

```bash
Dashboard konnte nicht gestartet werden: Port 5000 wird bereits verwendet.

Dies könnte ein anderer Dienst sein, der Port 5000 verwendet.
Um einen anderen Port zu verwenden:
  spec-workflow-mcp --dashboard --port 8080
```

## Konfigurationsdatei (Veraltet)

### Standardspeicherort

Der Server sucht die Konfiguration unter: `<projekt-dir>/.spec-workflow/config.toml`

### Dateiformat

Die Konfiguration verwendet das TOML-Format. Hier ist ein vollständiges Beispiel:

```toml
# Projektverzeichnis (standardmäßig aktuelles Verzeichnis)
projectDir = "/pfad/zu/ihrem/projekt"

# Dashboard-Port (1024-65535)
port = 3456

# Nur-Dashboard-Modus ausführen
dashboardOnly = false

# Oberflächensprache
# Optionen: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "de"

# Sound-Benachrichtigungen (nur VSCode-Extension)
[notifications]
enabled = true
volume = 0.5

# Erweiterte Einstellungen
[advanced]
# WebSocket-Wiederverbindungsversuche
maxReconnectAttempts = 10

# Datei-Watcher-Einstellungen
[watcher]
enabled = true
debounceMs = 300
```

### Konfigurationsoptionen

#### Grundeinstellungen

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|--------------|
| `projectDir` | string | Aktuelles Verzeichnis | Projektverzeichnispfad |
| `port` | number | Ephemeral | Dashboard-Port (1024-65535) |
| `dashboardOnly` | boolean | false | Dashboard ohne MCP-Server ausführen |
| `lang` | string | "en" | Oberflächensprache |

> **Hinweis**: Die Option `autoStartDashboard` wurde in v2.0.0 entfernt. Das Dashboard verwendet jetzt einen einheitlichen Mehrprojekt-Modus, der über das `--dashboard` Flag zugänglich ist.

#### Sprachoptionen

- `en` - English
- `ja` - Japanese (日本語)
- `zh` - Chinese (中文)
- `es` - Spanish (Español)
- `pt` - Portuguese (Português)
- `de` - German (Deutsch)
- `fr` - French (Français)
- `ru` - Russian (Русский)
- `it` - Italian (Italiano)
- `ko` - Korean (한국어)
- `ar` - Arabic (العربية)

### Eine benutzerdefinierte Konfiguration erstellen

1. Die Beispielkonfiguration kopieren:
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. Die Konfiguration bearbeiten:
```toml
# Meine Projektkonfiguration
projectDir = "/Users/meinname/projects/meineapp"
port = 3000
lang = "de"
```

3. Die Konfiguration verwenden:
```bash
# Verwendet automatisch .spec-workflow/config.toml
npx -y @pimzino/spec-workflow-mcp@latest

# Oder explizit angeben
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## Konfigurationspriorität

Konfigurationswerte werden in dieser Reihenfolge angewendet (höchste bis niedrigste Priorität):

1. **Befehlszeilenargumente** - Haben immer Vorrang
2. **Benutzerdefinierte Konfigurationsdatei** - Mit `--config` angegeben
3. **Standard-Konfigurationsdatei** - `.spec-workflow/config.toml`
4. **Eingebaute Standards** - Fallback-Werte

### Beispiel-Priorität

```toml
# config.toml
port = 3000
```

```bash
# Befehlszeilenargument überschreibt Konfigurationsdatei
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# Ergebnis: port = 4000 (CLI gewinnt)
```

## Umgebungsspezifische Konfigurationen

### Entwicklungskonfiguration

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
lang = "de"

[advanced]
debugMode = true
verboseLogging = true
```

Verwendung:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### Produktionskonfiguration

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
lang = "de"

[advanced]
debugMode = false
verboseLogging = false
```

Verwendung:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## Port-Konfiguration

### Gültiger Port-Bereich

Ports müssen zwischen 1024 und 65535 liegen.

### Ephemere Ports

Wenn kein Port angegeben ist, wählt das System automatisch einen verfügbaren ephemeren Port. Dies wird empfohlen für:
- Entwicklungsumgebungen
- Mehrere gleichzeitige Projekte
- Vermeidung von Port-Konflikten

### Feste Ports

Verwenden Sie feste Ports, wenn Sie benötigen:
- Konsistente URLs für Lesezeichen
- Integration mit anderen Tools
- Teamzusammenarbeit mit gemeinsamen Konfigurationen

### Port-Konfliktlösung

Wenn ein Port bereits verwendet wird:

1. **Prüfen Sie, was den Port verwendet:**
   - Windows: `netstat -an | findstr :3000`
   - macOS/Linux: `lsof -i :3000`

2. **Lösungen:**
   - Einen anderen Port verwenden: `--port 3001`
   - Den Prozess beenden, der den Port verwendet
   - `--port` weglassen, um einen ephemeren Port zu verwenden

## Mehrprojekt-Setup

### Separate Konfigurationen

Erstellen Sie projektspezifische Konfigurationen:

```bash
# Projekt A
projekt-a/
  .spec-workflow/
    config.toml  # port = 3000

# Projekt B
projekt-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### Gemeinsame Konfiguration

Verwenden Sie eine gemeinsame Konfiguration mit Überschreibungen:

```bash
# Gemeinsame Basiskonfiguration
~/configs/spec-workflow-base.toml

# Projektspezifische Überschreibungen
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /pfad/zu/projekt-a
```

## VSCode Extension-Konfiguration

Die VSCode Extension hat eigene Einstellungen:

1. VSCode-Einstellungen öffnen (Cmd/Strg + ,)
2. Nach "Spec Workflow" suchen
3. Konfigurieren:
   - Sprachpräferenz
   - Sound-Benachrichtigungen
   - Archiv-Sichtbarkeit
   - Auto-Aktualisierungsintervall

## Fehlerbehebung bei der Konfiguration

### Konfiguration lädt nicht

1. **Dateispeicherort überprüfen:**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **TOML-Syntax validieren:**
   ```bash
   # TOML CLI-Tool installieren
   npm install -g @iarna/toml

   # Validieren
   toml .spec-workflow/config.toml
   ```

3. **Berechtigungen überprüfen:**
   ```bash
   # Sicherstellen, dass die Datei lesbar ist
   chmod 644 .spec-workflow/config.toml
   ```

### Häufige Probleme

| Problem | Lösung |
|---------|--------|
| Port bereits verwendet | Anderen Port verwenden oder für ephemeren Port weglassen |
| Konfigurationsdatei nicht gefunden | Pfad überprüfen und absoluten Pfad verwenden falls nötig |
| Ungültige TOML-Syntax | Mit TOML-Linter validieren |
| Einstellungen werden nicht angewendet | Konfigurationspriorität überprüfen |

## Best Practices

1. **Versionskontrolle verwenden** für Konfigurationsdateien
2. **Benutzerdefinierte Einstellungen dokumentieren** in Ihrer Projekt-README
3. **Ephemere Ports verwenden** in der Entwicklung
4. **Sensible Daten fernhalten** aus Konfigurationsdateien
5. **Umgebungsspezifische Konfigurationen erstellen**
6. **Konfigurationsänderungen testen** vor dem Deployment

## Verwandte Dokumentation

- [Benutzerhandbuch](USER-GUIDE.de.md) - Verwendung des konfigurierten Servers
- [Oberflächen-Leitfaden](INTERFACES.de.md) - Dashboard- und Extension-Einstellungen
- [Fehlerbehebung](TROUBLESHOOTING.de.md) - Häufige Konfigurationsprobleme
