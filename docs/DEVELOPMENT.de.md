# Entwicklungsanleitung

Diese Anleitung behandelt die Einrichtung einer Entwicklungsumgebung, das Erstellen des Projekts, das Beisteuern von Code und das Verständnis der Architektur von Spec Workflow MCP.

## Voraussetzungen

### Erforderliche Software

- **Node.js** 18.0 oder höher
- **npm** 9.0 oder höher
- **Git** für Versionskontrolle
- **TypeScript** Kenntnisse hilfreich

### Empfohlene Tools

- **VSCode** mit TypeScript-Extensions
- **Chrome/Edge DevTools** zum Debuggen des Dashboards
- **Postman/Insomnia** zum API-Testen

## Entwicklungsumgebung einrichten

### 1. Repository klonen

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

Dies installiert:
- MCP SDK
- TypeScript und Build-Tools
- Express für Dashboard-Server
- WebSocket-Bibliotheken
- Test-Frameworks

### 3. Projekt erstellen

```bash
npm run build
```

Dies kompiliert TypeScript-Dateien zu JavaScript im `dist/` Verzeichnis.

## Entwicklungsbefehle

### Kernbefehle

| Befehl | Beschreibung |
|--------|--------------|
| `npm run dev` | Im Entwicklungsmodus mit Auto-Reload starten |
| `npm run build` | Produktions-Bundle erstellen |
| `npm start` | Produktionsserver ausführen |
| `npm test` | Test-Suite ausführen |
| `npm run clean` | Build-Artefakte entfernen |
| `npm run lint` | Code-Linter ausführen |
| `npm run format` | Code mit Prettier formatieren |

### Entwicklungsmodus

```bash
npm run dev
```

Funktionen:
- Auto-Rekompilierung bei Dateiänderungen
- Hot Reload für Dashboard
- Detaillierte Fehlermeldungen
- Source Maps zum Debuggen

### Für Produktion erstellen

```bash
npm run clean && npm run build
```

Optimierungen:
- Minifiziertes JavaScript
- Optimierte Bundle-Größe
- Produktions-Fehlerbehandlung
- Leistungsverbesserungen

## Projektstruktur

```
spec-workflow-mcp/
├── src/                    # Quellcode
│   ├── index.ts           # MCP-Server-Einstiegspunkt
│   ├── server.ts          # Dashboard-Server
│   ├── tools/             # MCP-Tool-Implementierungen
│   ├── prompts/           # Prompt-Templates
│   ├── utils/             # Hilfsfunktionen
│   └── types/             # TypeScript-Typdefinitionen
├── dist/                   # Kompiliertes JavaScript
├── dashboard/             # Web-Dashboard-Dateien
│   ├── index.html         # Dashboard-UI
│   ├── styles.css         # Dashboard-Styles
│   └── script.js          # Dashboard-JavaScript
├── vscode-extension/      # VSCode Extension
│   ├── src/               # Extension-Quellcode
│   └── package.json       # Extension-Manifest
├── tests/                 # Testdateien
├── docs/                  # Dokumentation
└── package.json           # Projektkonfiguration
```

## Architekturübersicht

### MCP-Server-Architektur

```
Client (AI) ↔ MCP-Protokoll ↔ Server ↔ Dateisystem
                              ↓
                          Dashboard
```

### Hauptkomponenten

#### 1. MCP-Server (`src/index.ts`)
- Behandelt MCP-Protokollkommunikation
- Verarbeitet Tool-Anfragen
- Verwaltet Projektzustand
- Dateisystemoperationen

#### 2. Dashboard-Server (`src/server.ts`)
- Stellt Web-Dashboard bereit
- WebSocket-Verbindungen
- Echtzeit-Updates
- HTTP-API-Endpunkte

#### 3. Tools (`src/tools/`)
Jedes Tool ist ein separates Modul:
- Eingabevalidierung
- Geschäftslogik
- Dateioperationen
- Response-Formatierung

#### 4. Prompts (`src/prompts/`)
Template-Strings für:
- Dokumentgenerierung
- Workflow-Anleitung
- Fehlermeldungen
- Benutzeranweisungen

## Neue Funktionen implementieren

### Neues Tool hinzufügen

1. **Tool-Datei erstellen** in `src/tools/`:

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: 'Beschreibung, was das Tool macht',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameterbeschreibung' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // Tool-Implementierung
    const { param1, param2 = 0 } = params;

    // Geschäftslogik hier

    return {
      success: true,
      data: 'Tool-Antwort'
    };
  }
};
```

2. **Im Index registrieren** (`src/tools/index.ts`):

```typescript
export { myNewTool } from './my-new-tool';
```

3. **Zum Server hinzufügen** (`src/index.ts`):

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### Dashboard-Funktionen hinzufügen

1. **HTML aktualisieren** (`dashboard/index.html`):

```html
<div class="new-feature">
  <h3>Neue Funktion</h3>
  <button id="new-action">Aktion</button>
</div>
```

2. **JavaScript hinzufügen** (`dashboard/script.js`):

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // Funktionslogik
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **Im Server behandeln** (`src/server.ts`):

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // Neue Aktion behandeln
  }
});
```

## Testen

### Tests ausführen

```bash
# Alle Tests ausführen
npm test

# Spezifische Testdatei ausführen
npm test -- src/tools/my-tool.test.ts

# Mit Coverage ausführen
npm run test:coverage

# Watch-Modus
npm run test:watch
```

### Tests schreiben

Testdateien neben Quelldateien erstellen:

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('sollte Eingabe korrekt verarbeiten', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('erwartet');
  });

  it('sollte Fehler behandeln', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Integrationstests

Vollständige Workflows testen:

```typescript
// tests/integration/workflow.test.ts
describe('Vollständiger Workflow', () => {
  it('sollte Spec von Anfang bis Ende erstellen', async () => {
    // Anforderungen erstellen
    // Anforderungen genehmigen
    // Design erstellen
    // Design genehmigen
    // Aufgaben erstellen
    // Struktur überprüfen
  });
});
```

## Debuggen

### MCP-Server debuggen

1. **Debug-Ausgabe hinzufügen**:

```typescript
console.error('[DEBUG]', 'Tool aufgerufen:', toolName, params);
```

2. **VSCode-Debugger verwenden**:

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug MCP Server",
  "program": "${workspaceFolder}/dist/index.js",
  "args": ["/pfad/zu/test/projekt"],
  "console": "integratedTerminal"
}
```

### Dashboard debuggen

1. **Browser DevTools**:
   - Dashboard im Browser öffnen
   - F12 für DevTools drücken
   - Konsole auf Fehler überprüfen
   - Netzwerk-Tab für WebSocket überwachen

2. **Logging hinzufügen**:

```javascript
console.log('WebSocket-Nachricht:', message);
console.log('Zustandsaktualisierung:', newState);
```

## Code-Stil und Standards

### TypeScript-Richtlinien

- Strict-Modus verwenden
- Interfaces für Datenstrukturen definieren
- `any` Typ vermeiden
- async/await statt Callbacks verwenden

### Dateiorganisation

- Eine Komponente pro Datei
- Verwandte Funktionalität gruppieren
- Klare Namenskonventionen
- Umfassende Kommentare

### Namenskonventionen

- **Dateien**: kebab-case (`my-tool.ts`)
- **Klassen**: PascalCase (`SpecManager`)
- **Funktionen**: camelCase (`createSpec`)
- **Konstanten**: UPPER_SNAKE (`MAX_RETRIES`)

## Mitwirken

### Mitwirkungsprozess

1. **Repository forken**
2. **Feature-Branch erstellen**:
   ```bash
   git checkout -b feature/meine-funktion
   ```
3. **Änderungen vornehmen**
4. **Tests schreiben**
5. **Tests und Lint ausführen**:
   ```bash
   npm test
   npm run lint
   ```
6. **Änderungen committen**:
   ```bash
   git commit -m "feat: neue Funktion hinzufügen"
   ```
7. **Branch pushen**:
   ```bash
   git push origin feature/meine-funktion
   ```
8. **Pull Request erstellen**

### Commit-Nachrichtenformat

Conventional Commits befolgen:

- `feat:` Neue Funktion
- `fix:` Fehlerbehebung
- `docs:` Dokumentation
- `style:` Formatierung
- `refactor:` Code-Umstrukturierung
- `test:` Tests
- `chore:` Wartung

Beispiele:
```
feat: Freigabe-Revisionsworkflow hinzufügen
fix: Dashboard-WebSocket-Wiederverbindungsproblem beheben
docs: Konfigurationsanleitung aktualisieren
```

### Pull-Request-Richtlinien

- Klare Beschreibung
- Verwandte Issues referenzieren
- Screenshots für UI-Änderungen einschließen
- Sicherstellen, dass alle Tests bestehen
- Dokumentation aktualisieren

## Veröffentlichung

### NPM-Paket

1. **Version aktualisieren**:
   ```bash
   npm version patch|minor|major
   ```

2. **Paket erstellen**:
   ```bash
   npm run build
   ```

3. **Veröffentlichen**:
   ```bash
   npm publish
   ```

### VSCode Extension

1. **Extension-Version aktualisieren** in `vscode-extension/package.json`

2. **Extension erstellen**:
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **Im Marketplace veröffentlichen**:
   ```bash
   vsce publish
   ```

## Leistungsoptimierung

### Server-Leistung

- Caching für Dateilesevorgänge verwenden
- Debouncing für Datei-Watcher implementieren
- WebSocket-Nachrichtenbatching optimieren
- Große Dokumente lazy laden

### Dashboard-Leistung

- DOM-Updates minimieren
- Virtuelles Scrolling für lange Listen verwenden
- Progressive Rendering implementieren
- WebSocket-Wiederverbindung optimieren

## Sicherheitsüberlegungen

### Eingabevalidierung

Tool-Eingaben immer validieren:

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Ungültiger Spec-Name');
}

// Dateipfade bereinigen
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Ungültiger Pfad');
}
```

### Dateisystem-Sicherheit

- Operationen auf Projektverzeichnis beschränken
- Alle Dateipfade validieren
- Sichere Dateioperationen verwenden
- Berechtigungsprüfungen implementieren

## Fehlerbehebung bei Entwicklungsproblemen

### Häufige Build-Fehler

| Fehler | Lösung |
|--------|--------|
| TypeScript-Fehler | `npm run build` ausführen, um detaillierte Fehler zu sehen |
| Modul nicht gefunden | Imports überprüfen und `npm install` ausführen |
| Port bereits verwendet | Port ändern oder bestehenden Prozess beenden |
| WebSocket-Verbindung fehlgeschlagen | Prüfen, ob Server läuft und Port korrekt ist |

### Entwicklungstipps

1. **TypeScript Strict-Modus verwenden** für bessere Typsicherheit
2. **Source Maps aktivieren** für einfacheres Debuggen
3. **nodemon verwenden** für Auto-Restart während der Entwicklung
4. **Dateioperationen testen** in isoliertem Verzeichnis
5. **Leistung überwachen** mit Chrome DevTools

## Ressourcen

- [MCP SDK Dokumentation](https://github.com/anthropics/mcp-sdk)
- [TypeScript Handbuch](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [VSCode Extension API](https://code.visualstudio.com/api)

## Verwandte Dokumentation

- [Konfigurationsanleitung](CONFIGURATION.de.md) - Server-Konfiguration
- [Benutzerhandbuch](USER-GUIDE.de.md) - Verwendung des Servers
- [Tools-Referenz](TOOLS-REFERENCE.de.md) - Tool-Dokumentation
- [Fehlerbehebung](TROUBLESHOOTING.de.md) - Häufige Probleme
