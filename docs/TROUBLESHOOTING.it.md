# Guida alla Risoluzione Problemi

Questa guida ti aiuta a risolvere problemi comuni con Spec Workflow MCP.

## Diagnostica Rapida

### Verifica Installazione
```bash
# Verifica che il pacchetto npm sia accessibile
npx -y @pimzino/spec-workflow-mcp@latest --help

# Controlla se sei nella directory corretta
pwd  # o 'cd' su Windows

# Verifica che esista la directory .spec-workflow
ls -la .spec-workflow  # o 'dir .spec-workflow' su Windows
```

### Verifica Servizi
```bash
# Testa server MCP
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project

# Testa dashboard
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# Controlla disponibilità porta
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## Problemi Comuni e Soluzioni

## Problemi Installazione

### Pacchetto NPM Non Trovato

**Errore**: `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**Soluzioni**:
1. Verifica connessione internet
2. Pulisci cache npm:
   ```bash
   npm cache clean --force
   ```
3. Prova senza tag versione:
   ```bash
   npx @pimzino/spec-workflow-mcp /path/to/project
   ```
4. Installa globalmente prima:
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /path/to/project
   ```

### Permesso Negato

**Errore**: `EACCES: permission denied`

**Soluzioni**:
1. **macOS/Linux**: Usa permessi npm appropriati:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**: Esegui come Amministratore o sistema permessi npm:
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. Usa npx con flag -y:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## Problemi Server MCP

### Server Non si Avvia

**Errore**: `Failed to start MCP server`

**Soluzioni**:
1. Verifica versione Node.js:
   ```bash
   node --version  # Dovrebbe essere 18.0 o superiore
   ```
2. Verifica che percorso progetto esista:
   ```bash
   ls -la /path/to/project
   ```
3. Controlla processi in conflitto:
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. Prova con percorso assoluto:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP Non si Connette allo Strumento AI

**Errore**: `MCP server unreachable` o `Connection refused`

**Soluzioni**:

1. **Claude Desktop**: Verifica file configurazione:
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/percorso/assoluto/al/progetto"]
       }
     }
   }
   ```

2. **Claude Code CLI**: Verifica setup:
   ```bash
   claude mcp list  # Controlla se spec-workflow è elencato
   claude mcp remove spec-workflow  # Rimuovi se esiste
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/project
   ```

3. **Problemi Percorso**: Assicurati che percorso sia assoluto ed esistente:
   - ❌ `~/project` o `./project`
   - ✅ `/Users/name/project` o `C:\Users\name\project`

### Strumenti Non Disponibili

**Errore**: `Tool 'spec-workflow' not found`

**Soluzioni**:
1. Riavvia completamente il tuo strumento AI
2. Verifica che server MCP sia in esecuzione (cerca processo)
3. Verifica che configurazione sia salvata correttamente
4. Prova a menzionare strumento esplicitamente: "Usa spec-workflow per creare una specifica"

## Problemi Dashboard

### Dashboard Non si Carica

**Errore**: `Cannot connect to dashboard` o pagina bianca

**Soluzioni**:
1. Verifica che dashboard sia avviata:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. Verifica URL nel browser (nota la porta):
   ```
   http://localhost:3000  # O qualsiasi porta mostrata
   ```
3. Prova browser diverso o modalità incognito
4. Controlla console browser per errori (F12 → Console)
5. Disabilita temporaneamente estensioni browser

### Porta Già in Uso

**Errore**: `Error: listen EADDRINUSE: address already in use :::3000`

**Soluzioni**:
1. Usa porta diversa:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3456
   ```
2. Trova e termina processo che usa la porta:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. Usa porta effimera (ometti flag --port):
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```

### Connessione WebSocket Fallita

**Errore**: `WebSocket connection lost` o aggiornamenti tempo reale non funzionano

**Soluzioni**:
1. Aggiorna pagina browser
2. Verifica se firewall blocca WebSocket
3. Verifica che dashboard e server MCP siano in esecuzione dallo stesso progetto
4. Controlla console browser per errori specifici
5. Prova rete diversa (se su rete aziendale)

### Dashboard Non si Aggiorna

**Sintomi**: Modifiche non riflesse in tempo reale

**Soluzioni**:
1. Hard refresh browser (Ctrl+Shift+R o Cmd+Shift+R)
2. Pulisci cache browser
3. Verifica stato connessione WebSocket (dovrebbe mostrare verde)
4. Verifica che watcher file system funzionino:
   ```bash
   # Crea file test nel progetto
   touch .spec-workflow/test.md
   # Dovrebbe trigger aggiornamento in dashboard
   ```

## Problemi Sistema Approvazione

### Approvazioni Non Mostrate

**Errore**: Nessuna notifica approvazione in dashboard

**Soluzioni**:
1. Assicurati dashboard sia in esecuzione insieme a server MCP:
   ```bash
   # Esegui entrambi separatamente
   # Terminale 1: Avviare dashboard
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard
   # Terminale 2: Avviare server MCP
   npx -y @pimzino/spec-workflow-mcp@latest /path
   ```
2. Verifica che esista directory approval:
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. Trigger manualmente richiesta approvazione tramite AI

### Non si Riescono ad Approvare Documenti

**Errore**: Pulsanti approvazione non funzionano

**Soluzioni**:
1. Controlla console browser per errori JavaScript
2. Verifica di essere sulla pagina specifica corretta
3. Assicurati documento abbia stato approvazione pending
4. Prova a usare estensione VSCode invece (se disponibile)

## Problemi File System

### File Specifiche Non Creati

**Errore**: Documenti specifiche non appaiono nel file system

**Soluzioni**:
1. Verifica permessi scrittura:
   ```bash
   touch .spec-workflow/test.txt
   ```
2. Verifica directory lavoro corretta:
   ```bash
   pwd  # Dovrebbe essere root progetto
   ```
3. Cerca file nascosti:
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. Controlla se antivirus blocca creazione file

### Permesso Negato su File

**Errore**: `EACCES` o `Permission denied` durante creazione specifiche

**Soluzioni**:
1. Sistema permessi directory:
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. Verifica ownership file:
   ```bash
   ls -la .spec-workflow
   # Dovrebbe essere di proprietà del tuo utente
   ```
3. Esegui da directory di cui sei proprietario (non directory sistema)

## Problemi Estensione VSCode

### Estensione Non si Carica

**Errore**: Icona Spec Workflow non appare in Activity Bar

**Soluzioni**:
1. Verifica che estensione sia installata:
   - Apri Estensioni (Ctrl+Shift+X)
   - Cerca "Spec Workflow MCP"
   - Controlla se installata e abilitata
2. Ricarica finestra VSCode:
   - Ctrl+Shift+P → "Developer: Reload Window"
3. Controlla output estensione:
   - View → Output → Seleziona "Spec Workflow" da dropdown
4. Assicurati progetto abbia directory `.spec-workflow`

### Comandi Estensione Non Funzionano

**Errore**: Comandi falliscono o mostrano errori

**Soluzioni**:
1. Apri cartella progetto che contiene `.spec-workflow`
2. Verifica che VSCode usi workspace corretto
3. Visualizza log estensione per errori specifici
4. Prova a reinstallare estensione:
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## Problemi Configurazione

### File Config Non Caricato

**Errore**: Impostazioni in config.toml non applicate

**Soluzioni**:
1. Verifica sintassi TOML:
   ```bash
   # Installa validatore TOML
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. Verifica posizione file:
   - Predefinito: `.spec-workflow/config.toml`
   - Personalizzato: Usa flag `--config`
3. Assicurati nessun errore sintassi:
   ```toml
   # Corretto
   port = 3000
   lang = "it"

   # Sbagliato
   port: 3000  # Dovrebbe usare = non :
   lang = it   # Dovrebbe avere virgolette
   ```

### Argomenti Linea Comando Non Funzionano

**Errore**: Flag come `--port` ignorati

**Soluzioni**:
1. Verifica ordine argomenti:
   ```bash
   # Corretto
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3000

   # Sbagliato
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /path --port 3000
   ```
2. Assicurati valori flag validi:
   - Porta: 1024-65535
   - Lingua: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. Usa `--help` per vedere tutte le opzioni

## Problemi Prestazioni

### Tempi Risposta Lenti

**Sintomi**: Dashboard o strumenti rispondono lentamente

**Soluzioni**:
1. Verifica risorse sistema:
   ```bash
   # Uso CPU e memoria
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. Riduci watcher file in progetti grandi:
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. Pulisci vecchi record approvazione:
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. Usa nomi specifiche specifici invece di elencare tutti

### Uso Memoria Alto

**Soluzioni**:
1. Riavvia servizi periodicamente
2. Limita rate refresh dashboard:
   ```json
   // Impostazioni VSCode
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. Archivia specifiche completate
4. Pulisci cache browser per dashboard

## Problemi Rete

### Dietro Proxy Aziendale

**Soluzioni**:
1. Configura proxy npm:
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. Usa installazione locale:
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /path
   ```

### Firewall Blocca Connessioni

**Soluzioni**:
1. Consenti Node.js attraverso firewall
2. Usa localhost invece di 0.0.0.0
3. Configura regole porte specifiche
4. Prova range porte diverse

## Problemi Specifici Piattaforma

### Windows

#### Problemi Formato Percorso
**Errore**: `Invalid path` o percorso non trovato

**Soluzioni**:
```bash
# Usa slash avanti
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/name/project

# O backslash escaped
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\name\\project"
```

#### Policy Esecuzione PowerShell
**Errore**: `cannot be loaded because running scripts is disabled`

**Soluzioni**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Blocco Gatekeeper
**Errore**: `cannot be opened because the developer cannot be verified`

**Soluzioni**:
1. Preferenze Sistema → Sicurezza e Privacy → Consenti
2. O rimuovi quarantena:
   ```bash
   xattr -d com.apple.quarantine /path/to/node_modules
   ```

### Linux

#### Dipendenze Mancanti
**Errore**: `shared library not found`

**Soluzioni**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## Ottenere Aiuto

### Informazioni Diagnostiche

Quando segnali problemi, includi:

1. **Informazioni Sistema**:
   ```bash
   node --version
   npm --version
   uname -a  # o 'ver' su Windows
   ```

2. **Messaggi Errore**:
   - Testo errore completo
   - Screenshot se problema visivo
   - Log console browser

3. **Configurazione**:
   - Configurazione client MCP
   - Contenuti config.toml
   - Comando usato

4. **Passi per Riprodurre**:
   - Comandi esatti eseguiti
   - Comportamento atteso
   - Comportamento effettivo

### Canali Supporto

1. **GitHub Issues**: [Crea un issue](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **Documentazione**: Controlla altre guide in `/docs`
3. **Community**: Discussioni e Q&A

### Modalità Debug

Abilita logging dettagliato:

```bash
# Imposta variabile ambiente
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# Esegui con output debug
npx -y @pimzino/spec-workflow-mcp@latest /path --debug
```

## Suggerimenti Prevenzione

### Best Practice

1. **Usa sempre percorsi assoluti** nelle configurazioni
2. **Mantieni Node.js aggiornato** (v18+ richiesto)
3. **Esegui da directory root progetto**
4. **Usa --help** per verificare opzioni
5. **Testa in ambiente pulito** quando si verificano problemi
6. **Controlla log** prima di assumere fallimento
7. **Backup directory .spec-workflow** regolarmente

### Manutenzione Regolare

1. Pulisci vecchie approvazioni mensilmente
2. Archivia specifiche completate
3. Aggiorna pacchetti npm regolarmente
4. Monitora spazio disco per log
5. Riavvia servizi dopo aggiornamenti

## Documentazione Correlata

- [Guida Configurazione](CONFIGURATION.it.md) - Opzioni configurazione dettagliate
- [Guida Utente](USER-GUIDE.it.md) - Istruzioni uso generali
- [Guida Sviluppo](DEVELOPMENT.it.md) - Per contribuire correzioni
- [Guida Interfacce](INTERFACES.it.md) - Dettagli dashboard ed estensione
