# Guida alla Configurazione

Questa guida copre tutte le opzioni di configurazione per Spec Workflow MCP.

## Opzioni da Riga di Comando

### Uso Base

```bash
npx -y @pimzino/spec-workflow-mcp@latest [project-path] [opzioni]
```

### Opzioni Disponibili

| Opzione | Descrizione | Esempio |
|--------|-------------|---------|
| `--help` | Mostra informazioni complete sull'uso | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | Esegui solo modalità dashboard (porta predefinita: 5000) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--port <numero>` | Specifica porta dashboard personalizzata (1024-65535) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080` |

### Note Importanti

- **Singola Istanza Dashboard**: Solo una dashboard viene eseguita alla volta. Tutti i server MCP si connettono alla stessa dashboard.
- **Porta Predefinita**: La dashboard usa la porta 5000 di default. Usa `--port` solo se 5000 non è disponibile.
- **Dashboard Separata**: Esegui sempre la dashboard separatamente dai server MCP.

## Esempi di Utilizzo

### Flusso di Lavoro Tipico

1. **Avvia la Dashboard** (fallo prima, solo una volta):
```bash
# Usa la porta predefinita 5000
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

2. **Avvia i Server MCP** (uno per progetto, in terminali separati):
```bash
# Progetto 1
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app1

# Progetto 2
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app2

# Progetto 3
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app3
```

Tutti i progetti appariranno nella dashboard a http://localhost:5000

### Dashboard con Porta Personalizzata

Usa una porta personalizzata solo se la porta 5000 non è disponibile:

```bash
# Avvia la dashboard sulla porta 8080
npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
```

## Variabili d'Ambiente

### SPEC_WORKFLOW_HOME

Sostituisci la directory di stato globale predefinita (`~/.spec-workflow-mcp`). Questo è utile per ambienti sandboxed dove `$HOME` è in sola lettura.

| Variabile | Predefinito | Descrizione |
|----------|---------|-------------|
| `SPEC_WORKFLOW_HOME` | `~/.spec-workflow-mcp` | Directory per file di stato globale |

**File memorizzati in questa directory:**
- `activeProjects.json` - Registro dei progetti
- `activeSession.json` - Info sessione dashboard
- `settings.json` - Impostazioni globali
- `job-execution-history.json` - Cronologia esecuzione job
- `migration.log` - Tracciamento migrazione log implementazione

**Esempi di utilizzo:**

```bash
# Percorso assoluto
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace

# Percorso relativo (risolto rispetto alla directory di lavoro corrente)
SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest .

# Per modalità dashboard
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

**Ambienti sandboxed (es. Codex CLI):**

Quando si esegue in ambienti sandboxed come Codex CLI con `sandbox_mode=workspace-write`, imposta `SPEC_WORKFLOW_HOME` su una posizione scrivibile all'interno del tuo workspace:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

## Gestione Sessione Dashboard

La dashboard memorizza le informazioni di sessione in `~/.spec-workflow-mcp/activeSession.json` (o `$SPEC_WORKFLOW_HOME/activeSession.json` se impostato). Questo file:
- Applica l'istanza singola della dashboard
- Consente ai server MCP di scoprire la dashboard in esecuzione
- Si pulisce automaticamente quando la dashboard si ferma

### Applicazione Istanza Singola

Solo una dashboard può essere eseguita alla volta. Se provi ad avviare una seconda dashboard:

```
Dashboard già in esecuzione a: http://localhost:5000

Puoi:
  1. Usare la dashboard esistente a: http://localhost:5000
  2. Fermarla prima (Ctrl+C o kill PID), poi avviarne una nuova

Nota: È necessaria solo un'istanza della dashboard per tutti i tuoi progetti.
```

## Gestione Porte

**Porta Predefinita**: 5000
**Porta Personalizzata**: Usa `--port <numero>` solo se la porta 5000 non è disponibile

### Conflitti di Porta

Se la porta 5000 è già in uso da un altro servizio:

```bash
Impossibile avviare la dashboard: La porta 5000 è già in uso.

Potrebbe essere un altro servizio che usa la porta 5000.
Per usare una porta diversa:
  spec-workflow-mcp --dashboard --port 8080
```

## File di Configurazione (Deprecato)

### Posizione Predefinita

Il server cerca la configurazione in: `<project-dir>/.spec-workflow/config.toml`

### Formato File

La configurazione usa il formato TOML. Ecco un esempio completo:

```toml
# Directory del progetto (predefinita alla directory corrente)
projectDir = "/path/to/your/project"

# Porta dashboard (1024-65535)
port = 3456

# Esegui solo modalità dashboard
dashboardOnly = false

# Lingua interfaccia
# Opzioni: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "it"

# Notifiche sonore (solo estensione VSCode)
[notifications]
enabled = true
volume = 0.5

# Impostazioni avanzate
[advanced]
# Tentativi di riconnessione WebSocket
maxReconnectAttempts = 10

# Impostazioni watcher file
[watcher]
enabled = true
debounceMs = 300
```

### Opzioni di Configurazione

#### Impostazioni Base

| Opzione | Tipo | Predefinito | Descrizione |
|--------|------|---------|-------------|
| `projectDir` | string | Directory corrente | Percorso directory progetto |
| `port` | number | Effimera | Porta dashboard (1024-65535) |
| `dashboardOnly` | boolean | false | Esegui dashboard senza server MCP |
| `lang` | string | "en" | Lingua interfaccia |

> **Nota**: L'opzione `autoStartDashboard` è stata rimossa nella v2.0.0. La dashboard ora usa una modalità multi-progetto unificata accessibile tramite il flag `--dashboard`.

#### Opzioni Lingua

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

### Creare una Configurazione Personalizzata

1. Copia la configurazione di esempio:
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. Modifica la configurazione:
```toml
# Configurazione del mio progetto
projectDir = "/Users/myname/projects/myapp"
port = 3000
lang = "it"
```

3. Usa la configurazione:
```bash
# Usa automaticamente .spec-workflow/config.toml
npx -y @pimzino/spec-workflow-mcp@latest

# Oppure specificalo esplicitamente
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## Precedenza Configurazione

I valori di configurazione vengono applicati in questo ordine (dalla priorità più alta alla più bassa):

1. **Argomenti da riga di comando** - Hanno sempre la precedenza
2. **File config personalizzato** - Specificato con `--config`
3. **File config predefinito** - `.spec-workflow/config.toml`
4. **Predefiniti integrati** - Valori di fallback

### Esempio Precedenza

```toml
# config.toml
port = 3000
```

```bash
# L'argomento da riga di comando sovrascrive il file di configurazione
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# Risultato: port = 4000 (vince CLI)
```

## Configurazioni Specifiche per Ambiente

### Configurazione Sviluppo

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
lang = "it"

[advanced]
debugMode = true
verboseLogging = true
```

Uso:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### Configurazione Produzione

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
lang = "it"

[advanced]
debugMode = false
verboseLogging = false
```

Uso:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## Configurazione Porta

### Intervallo Porte Valide

Le porte devono essere comprese tra 1024 e 65535.

### Porte Effimere

Quando non viene specificata alcuna porta, il sistema seleziona automaticamente una porta effimera disponibile. Questo è consigliato per:
- Ambienti di sviluppo
- Progetti multipli simultanei
- Evitare conflitti di porta

### Porte Fisse

Usa porte fisse quando hai bisogno di:
- URL coerenti per i segnalibri
- Integrazione con altri strumenti
- Collaborazione di team con configurazioni condivise

### Risoluzione Conflitti Porta

Se una porta è già in uso:

1. **Controlla cosa sta usando la porta:**
   - Windows: `netstat -an | findstr :3000`
   - macOS/Linux: `lsof -i :3000`

2. **Soluzioni:**
   - Usa una porta diversa: `--port 3001`
   - Termina il processo che usa la porta
   - Ometti `--port` per usare una porta effimera

## Configurazione Multi-Progetto

### Configurazioni Separate

Crea configurazioni specifiche per progetto:

```bash
# Progetto A
project-a/
  .spec-workflow/
    config.toml  # port = 3000

# Progetto B
project-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### Configurazione Condivisa

Usa una configurazione condivisa con sovrascritture:

```bash
# Config base condiviso
~/configs/spec-workflow-base.toml

# Sovrascritture specifiche per progetto
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /path/to/project-a
```

## Configurazione Estensione VSCode

L'estensione VSCode ha le proprie impostazioni:

1. Apri Impostazioni VSCode (Cmd/Ctrl + ,)
2. Cerca "Spec Workflow"
3. Configura:
   - Preferenza lingua
   - Notifiche sonore
   - Visibilità archivio
   - Intervallo auto-refresh

## Risoluzione Problemi Configurazione

### Configurazione Non Caricata

1. **Verifica posizione file:**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **Valida sintassi TOML:**
   ```bash
   # Installa strumento CLI toml
   npm install -g @iarna/toml

   # Valida
   toml .spec-workflow/config.toml
   ```

3. **Verifica permessi:**
   ```bash
   # Assicurati che il file sia leggibile
   chmod 644 .spec-workflow/config.toml
   ```

### Problemi Comuni

| Problema | Soluzione |
|-------|----------|
| Porta già in uso | Usa porta diversa o ometti per effimera |
| File config non trovato | Verifica percorso e usa percorso assoluto se necessario |
| Sintassi TOML non valida | Valida con linter TOML |
| Impostazioni non applicate | Verifica precedenza configurazione |

## Best Practice

1. **Usa controllo versione** per i file di configurazione
2. **Documenta impostazioni personalizzate** nel README del progetto
3. **Usa porte effimere** in sviluppo
4. **Mantieni dati sensibili** fuori dai file di configurazione
5. **Crea configurazioni specifiche** per ambiente
6. **Testa modifiche configurazione** prima del deploy

## Documentazione Correlata

- [Guida Utente](USER-GUIDE.it.md) - Usare il server configurato
- [Guida Interfacce](INTERFACES.it.md) - Impostazioni dashboard ed estensione
- [Risoluzione Problemi](TROUBLESHOOTING.it.md) - Problemi comuni di configurazione
