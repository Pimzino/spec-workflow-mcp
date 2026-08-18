# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://vsmarketplacebadges.dev/version-short/Pimzino.spec-workflow-mcp.svg)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

Un server Model Context Protocol (MCP) per lo sviluppo strutturato basato su specifiche con dashboard in tempo reale ed estensione VSCode.

## ☕ Sostieni Questo Progetto

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📺 Showcase

### 🔄 Sistema di Approvazione in Azione
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*Guarda come funziona il sistema di approvazione: crea documenti, richiedi approvazione tramite la dashboard, fornisci feedback e traccia le revisioni.*

### 📊 Dashboard e Gestione delle Specifiche
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*Esplora la dashboard in tempo reale: visualizza le specifiche, traccia i progressi, naviga tra i documenti e monitora il tuo flusso di lavoro di sviluppo.*

## ✨ Caratteristiche Principali

- **Flusso di Lavoro Strutturato** - Creazione sequenziale delle specifiche (Requisiti → Design → Task)
- **Dashboard Web in Tempo Reale** - Monitora specifiche, task e progressi con aggiornamenti live
- **Estensione VSCode** - Dashboard integrata nella sidebar per utenti VSCode
- **Flusso di Approvazione** - Processo di approvazione completo con revisioni
- **Tracciamento Progressi Task** - Barre di progresso visive e stato dettagliato
- **Log di Implementazione** - Log ricercabili di tutte le implementazioni dei task con statistiche del codice
- **Supporto Multi-Lingua** - Disponibile in 11 lingue

## 🌍 Lingue Supportate

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 Avvio Rapido

### Passo 1: Aggiungi al tuo strumento AI

Aggiungi alla configurazione MCP (vedi configurazione specifica per client qui sotto):

```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```

### Passo 2: Scegli la tua interfaccia

**Opzione A: Dashboard Web** (Richiesta per utenti CLI)
Avvia la dashboard (viene eseguita sulla porta 5000 di default):
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

La dashboard sarà accessibile a: http://localhost:5000

> **Nota:** È necessaria solo un'istanza della dashboard. Tutti i tuoi progetti si connetteranno alla stessa dashboard.

**Opzione B: Estensione VSCode** (Consigliata per utenti VSCode)

Installa [Spec Workflow MCP Extension](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp) dal marketplace VSCode.

## 📝 Come Utilizzare

Menziona semplicemente spec-workflow nella tua conversazione:

- **"Crea una specifica per l'autenticazione utente"** - Crea il flusso completo delle specifiche
- **"Elenca le mie specifiche"** - Mostra tutte le specifiche e il loro stato
- **"Esegui il task 1.2 nella specifica user-auth"** - Esegue un task specifico

[Vedi altri esempi →](docs/PROMPTING-GUIDE.it.md)

## 🔧 Configurazione Client MCP

<details>
<summary><strong>Augment Code</strong></summary>

Configura nelle impostazioni di Augment:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Code CLI</strong></summary>

Aggiungi alla configurazione MCP:
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
```

**Note Importanti:**
- Il flag `-y` bypassa i prompt npm per un'installazione più fluida
- Il separatore `--` assicura che il percorso venga passato allo script spec-workflow, non a npx
- Sostituisci `/path/to/your/project` con il percorso effettivo della directory del tuo progetto

**Alternativa per Windows (se quanto sopra non funziona):**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Aggiungi a `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```

> **Importante:** Esegui la dashboard separatamente con `--dashboard` prima di avviare il server MCP.

</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

Aggiungi alla configurazione del server MCP:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Continue IDE Extension</strong></summary>

Aggiungi alla configurazione di Continue:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor IDE</strong></summary>

Aggiungi alle impostazioni di Cursor (`settings.json`):
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>OpenCode</strong></summary>

Aggiungi al file di configurazione `opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "spec-workflow": {
      "type": "local",
      "command": ["npx", "-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"],
      "enabled": true
    }
  }
}
```
</details>

<details>
<summary><strong>Windsurf</strong></summary>

Aggiungi al file di configurazione `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Codex</strong></summary>

Aggiungi al file di configurazione `~/.codex/config.toml`:
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
```
</details>

## 🐳 Distribuzione Docker

Esegui la dashboard in un container Docker per una distribuzione isolata:

```bash
# Usando Docker Compose (consigliato)
cd containers
docker-compose up --build

# Oppure usando Docker CLI
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

La dashboard sarà disponibile a: http://localhost:5000

[Vedi guida configurazione Docker →](containers/README.md)

## 🔒 Ambienti Sandboxed

Per ambienti sandboxed (es. Codex CLI con `sandbox_mode=workspace-write`) dove `$HOME` è in sola lettura, usa la variabile d'ambiente `SPEC_WORKFLOW_HOME` per reindirizzare i file di stato globale in una posizione scrivibile:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

[Vedi Guida alla Configurazione →](docs/CONFIGURATION.it.md#variabili-dambiente)

## 📚 Documentazione

- [Guida alla Configurazione](docs/CONFIGURATION.it.md) - Opzioni da riga di comando, file di configurazione
- [Guida Utente](docs/USER-GUIDE.it.md) - Esempi d'uso completi
- [Processo di Workflow](docs/WORKFLOW.it.md) - Flusso di lavoro di sviluppo e best practice
- [Guida alle Interfacce](docs/INTERFACES.it.md) - Dettagli dashboard ed estensione VSCode
- [Guida ai Prompt](docs/PROMPTING-GUIDE.it.md) - Esempi avanzati di prompting
- [Riferimento Strumenti](docs/TOOLS-REFERENCE.it.md) - Documentazione completa degli strumenti
- [Sviluppo](docs/DEVELOPMENT.it.md) - Contribuzione e configurazione sviluppo
- [Risoluzione Problemi](docs/TROUBLESHOOTING.it.md) - Problemi comuni e soluzioni

## 📁 Struttura del Progetto

```
your-project/
  .spec-workflow/
    approvals/
    archive/
    specs/
    steering/
    templates/
    user-templates/
    config.example.toml
```

## 🛠️ Sviluppo

```bash
# Installa le dipendenze
npm install

# Compila il progetto
npm run build

# Esegui in modalità sviluppo
npm run dev
```

[Vedi guida allo sviluppo →](docs/DEVELOPMENT.it.md)

## 📄 Licenza

GPL-3.0

## ⭐ Cronologia Stelle

<a href="https://star-history.dera.page/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>
