# Guida allo Sviluppo

Questa guida copre la configurazione di un ambiente di sviluppo, la compilazione del progetto, il contributo al codice e la comprensione dell'architettura di Spec Workflow MCP.

## Prerequisiti

### Software Richiesto

- **Node.js** 18.0 o superiore
- **npm** 9.0 o superiore
- **Git** per il controllo versione
- **TypeScript** conoscenza utile

### Strumenti Consigliati

- **VSCode** con estensioni TypeScript
- **Chrome/Edge DevTools** per debug dashboard
- **Postman/Insomnia** per test API

## Configurazione Ambiente di Sviluppo

### 1. Clona il Repository

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. Installa le Dipendenze

```bash
npm install
```

Questo installa:
- MCP SDK
- TypeScript e strumenti di build
- Express per server dashboard
- Librerie WebSocket
- Framework di testing

### 3. Compila il Progetto

```bash
npm run build
```

Questo compila i file TypeScript in JavaScript nella directory `dist/`.

## Comandi di Sviluppo

### Comandi Principali

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia in modalità sviluppo con auto-reload |
| `npm run build` | Compila bundle produzione |
| `npm start` | Esegui server produzione |
| `npm test` | Esegui suite di test |
| `npm run clean` | Rimuovi artefatti build |
| `npm run lint` | Esegui linter codice |
| `npm run format` | Formatta codice con Prettier |

### Modalità Sviluppo

```bash
npm run dev
```

Funzionalità:
- Auto-ricompilazione su modifiche file
- Hot reload per dashboard
- Messaggi errore dettagliati
- Source map per debugging

### Compilazione per Produzione

```bash
npm run clean && npm run build
```

Ottimizzazioni:
- JavaScript minificato
- Dimensione bundle ottimizzata
- Gestione errori produzione
- Miglioramenti prestazioni

## Struttura del Progetto

```
spec-workflow-mcp/
├── src/                    # Codice sorgente
│   ├── index.ts           # Entry point server MCP
│   ├── server.ts          # Server dashboard
│   ├── tools/             # Implementazioni strumenti MCP
│   ├── prompts/           # Template prompt
│   ├── utils/             # Funzioni utilità
│   └── types/             # Definizioni tipi TypeScript
├── dist/                   # JavaScript compilato
├── dashboard/             # File dashboard web
│   ├── index.html         # UI dashboard
│   ├── styles.css         # Stili dashboard
│   └── script.js          # JavaScript dashboard
├── vscode-extension/      # Estensione VSCode
│   ├── src/               # Sorgente estensione
│   └── package.json       # Manifest estensione
├── tests/                 # File di test
├── docs/                  # Documentazione
└── package.json           # Configurazione progetto
```

## Panoramica Architettura

### Architettura Server MCP

```
Client (AI) ↔ Protocollo MCP ↔ Server ↔ File System
                              ↓
                          Dashboard
```

### Componenti Chiave

#### 1. Server MCP (`src/index.ts`)
- Gestisce comunicazione protocollo MCP
- Elabora richieste strumenti
- Gestisce stato progetto
- Operazioni file system

#### 2. Server Dashboard (`src/server.ts`)
- Serve dashboard web
- Connessioni WebSocket
- Aggiornamenti in tempo reale
- Endpoint API HTTP

#### 3. Strumenti (`src/tools/`)
Ogni strumento è un modulo separato:
- Validazione input
- Logica business
- Operazioni file
- Formattazione risposta

#### 4. Prompt (`src/prompts/`)
Stringhe template per:
- Generazione documenti
- Guida workflow
- Messaggi errore
- Istruzioni utente

## Implementazione Nuove Funzionalità

### Aggiungere un Nuovo Strumento

1. **Crea file strumento** in `src/tools/`:

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: 'Descrizione di cosa fa lo strumento',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Descrizione parametro' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // Implementazione strumento
    const { param1, param2 = 0 } = params;

    // Logica business qui

    return {
      success: true,
      data: 'Risposta strumento'
    };
  }
};
```

2. **Registra in index** (`src/tools/index.ts`):

```typescript
export { myNewTool } from './my-new-tool';
```

3. **Aggiungi al server** (`src/index.ts`):

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### Aggiungere Funzionalità Dashboard

1. **Aggiorna HTML** (`dashboard/index.html`):

```html
<div class="new-feature">
  <h3>Nuova Funzionalità</h3>
  <button id="new-action">Azione</button>
</div>
```

2. **Aggiungi JavaScript** (`dashboard/script.js`):

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // Logica funzionalità
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **Gestisci nel server** (`src/server.ts`):

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // Gestisci nuova azione
  }
});
```

## Testing

### Esecuzione Test

```bash
# Esegui tutti i test
npm test

# Esegui file test specifico
npm test -- src/tools/my-tool.test.ts

# Esegui con coverage
npm run test:coverage

# Modalità watch
npm run test:watch
```

### Scrittura Test

Crea file di test accanto ai file sorgente:

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('dovrebbe elaborare input correttamente', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('atteso');
  });

  it('dovrebbe gestire errori', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Test di Integrazione

Testa workflow completi:

```typescript
// tests/integration/workflow.test.ts
describe('Workflow Completo', () => {
  it('dovrebbe creare spec dall\'inizio alla fine', async () => {
    // Crea requisiti
    // Approva requisiti
    // Crea design
    // Approva design
    // Crea task
    // Verifica struttura
  });
});
```

## Debugging

### Debug Server MCP

1. **Aggiungi output debug**:

```typescript
console.error('[DEBUG]', 'Strumento chiamato:', toolName, params);
```

2. **Usa debugger VSCode**:

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug MCP Server",
  "program": "${workspaceFolder}/dist/index.js",
  "args": ["/path/to/test/project"],
  "console": "integratedTerminal"
}
```

### Debug Dashboard

1. **DevTools Browser**:
   - Apri dashboard nel browser
   - Premi F12 per DevTools
   - Controlla Console per errori
   - Monitora tab Network per WebSocket

2. **Aggiungi logging**:

```javascript
console.log('Messaggio WebSocket:', message);
console.log('Aggiornamento stato:', newState);
```

## Stile Codice e Standard

### Linee Guida TypeScript

- Usa modalità strict
- Definisci interfacce per strutture dati
- Evita tipo `any`
- Usa async/await invece di callback

### Organizzazione File

- Un componente per file
- Raggruppa funzionalità correlate
- Convenzioni di naming chiare
- Commenti completi

### Convenzioni Naming

- **File**: kebab-case (`my-tool.ts`)
- **Classi**: PascalCase (`SpecManager`)
- **Funzioni**: camelCase (`createSpec`)
- **Costanti**: UPPER_SNAKE (`MAX_RETRIES`)

## Contribuire

### Processo di Contribuzione

1. **Fork repository**
2. **Crea branch feature**:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Fai modifiche**
4. **Scrivi test**
5. **Esegui test e lint**:
   ```bash
   npm test
   npm run lint
   ```
6. **Commit modifiche**:
   ```bash
   git commit -m "feat: aggiungi nuova funzionalità"
   ```
7. **Push branch**:
   ```bash
   git push origin feature/my-feature
   ```
8. **Crea Pull Request**

### Formato Messaggio Commit

Segui conventional commits:

- `feat:` Nuova funzionalità
- `fix:` Correzione bug
- `docs:` Documentazione
- `style:` Formattazione
- `refactor:` Ristrutturazione codice
- `test:` Testing
- `chore:` Manutenzione

Esempi:
```
feat: aggiungi workflow revisione approvazione
fix: risolvi problema riconnessione WebSocket dashboard
docs: aggiorna guida configurazione
```

### Linee Guida Pull Request

- Descrizione chiara
- Riferimento issue correlati
- Includi screenshot per modifiche UI
- Assicurati che tutti i test passino
- Aggiorna documentazione

## Pubblicazione

### Pacchetto NPM

1. **Aggiorna versione**:
   ```bash
   npm version patch|minor|major
   ```

2. **Compila pacchetto**:
   ```bash
   npm run build
   ```

3. **Pubblica**:
   ```bash
   npm publish
   ```

### Estensione VSCode

1. **Aggiorna versione estensione** in `vscode-extension/package.json`

2. **Compila estensione**:
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **Pubblica su marketplace**:
   ```bash
   vsce publish
   ```

## Ottimizzazione Prestazioni

### Prestazioni Server

- Usa caching per letture file
- Implementa debouncing per watcher file
- Ottimizza batching messaggi WebSocket
- Carica documenti grandi in modo lazy

### Prestazioni Dashboard

- Minimizza aggiornamenti DOM
- Usa scrolling virtuale per liste lunghe
- Implementa rendering progressivo
- Ottimizza riconnessione WebSocket

## Considerazioni Sicurezza

### Validazione Input

Valida sempre input strumenti:

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Nome spec non valido');
}

// Sanitizza percorsi file
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Percorso non valido');
}
```

### Sicurezza File System

- Limita operazioni alla directory progetto
- Valida tutti i percorsi file
- Usa operazioni file sicure
- Implementa controlli permessi

## Risoluzione Problemi Sviluppo

### Errori Build Comuni

| Errore | Soluzione |
|-------|----------|
| Errori TypeScript | Esegui `npm run build` per vedere errori dettagliati |
| Modulo non trovato | Controlla import ed esegui `npm install` |
| Porta già in uso | Cambia porta o termina processo esistente |
| Connessione WebSocket fallita | Verifica che server sia in esecuzione e porta corretta |

### Suggerimenti Sviluppo

1. **Usa modalità strict TypeScript** per migliore sicurezza tipi
2. **Abilita source map** per debugging più facile
3. **Usa nodemon** per auto-restart durante sviluppo
4. **Testa operazioni file** in directory isolata
5. **Monitora prestazioni** con Chrome DevTools

## Risorse

- [Documentazione MCP SDK](https://github.com/anthropics/mcp-sdk)
- [Manuale TypeScript](https://www.typescriptlang.org/docs/)
- [Best Practice Node.js](https://github.com/goldbergyoni/nodebestpractices)
- [API Estensione VSCode](https://code.visualstudio.com/api)

## Documentazione Correlata

- [Guida Configurazione](CONFIGURATION.it.md) - Configurazione server
- [Guida Utente](USER-GUIDE.it.md) - Usare il server
- [Riferimento Strumenti](TOOLS-REFERENCE.it.md) - Documentazione strumenti
- [Risoluzione Problemi](TROUBLESHOOTING.it.md) - Problemi comuni
