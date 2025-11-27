# Guida alle Interfacce

Questa guida copre le due interfacce principali per Spec Workflow MCP: la Dashboard Web e l'Estensione VSCode.

## Panoramica

Spec Workflow MCP fornisce due interfacce:

1. **Dashboard Web** - Interfaccia browser per utenti CLI
2. **Estensione VSCode** - Esperienza IDE integrata per utenti VSCode

Entrambe le interfacce forniscono le stesse funzionalità principali con ottimizzazioni specifiche per piattaforma.

## Dashboard Web

### Panoramica

La dashboard web è un'applicazione web in tempo reale che fornisce accesso visivo alle tue specifiche, task e flussi di approvazione.

### Avvio della Dashboard

#### Dashboard Standalone
```bash
# Usa porta effimera
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# Porta personalizzata
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard --port 3000
```

#### Con Server MCP
```bash
# Auto-start con MCP
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --AutoStartDashboard
```

### Funzionalità Dashboard

#### Vista Principale

La home della dashboard visualizza:

- **Panoramica Progetto**
  - Conteggio specifiche attive
  - Task totali
  - Percentuale completamento
  - Attività recente

- **Card Specifiche**
  - Nome specifica e stato
  - Barra progressi
  - Indicatori documenti
  - Azioni rapide

#### Vista Dettaglio Specifica

Cliccando su una specifica mostra:

- **Tab Documenti**
  - Requisiti
  - Design
  - Task

- **Contenuto Documento**
  - Markdown renderizzato
  - Evidenziazione sintassi
  - Indice contenuti

- **Azioni Approvazione**
  - Pulsante approva
  - Richiedi modifiche
  - Opzione rifiuto
  - Campo commento

#### Gestione Task

La vista task fornisce:

- **Lista Task Gerarchica**
  - Task numerati (1.0, 1.1, 1.1.1)
  - Indicatori stato
  - Tracciamento progressi

- **Azioni Task**
  - Pulsante copia prompt
  - Segna completo
  - Aggiungi note
  - Visualizza dipendenze

- **Visualizzazione Progressi**
  - Barra progressi complessiva
  - Progressi sezione
  - Stime tempo

#### Documenti Steering

Accedi alla guida progetto:

- **Steering Prodotto**
  - Visione e obiettivi
  - Persona utenti
  - Metriche successo

- **Steering Tecnico**
  - Decisioni architetturali
  - Scelte tecnologiche
  - Obiettivi prestazioni

- **Steering Struttura**
  - Organizzazione file
  - Convenzioni naming
  - Confini moduli

### Navigazione Dashboard

#### Scorciatoie Tastiera

| Scorciatoia | Azione |
|----------|--------|
| `Alt + S` | Focus lista specifiche |
| `Alt + T` | Visualizza task |
| `Alt + R` | Visualizza requisiti |
| `Alt + D` | Visualizza design |
| `Alt + A` | Apri dialogo approvazione |
| `Esc` | Chiudi dialogo |

#### Struttura URL

Link diretti a viste specifiche:
- `/` - Home dashboard
- `/spec/{name}` - Specifica specifica
- `/spec/{name}/requirements` - Documento requisiti
- `/spec/{name}/design` - Documento design
- `/spec/{name}/tasks` - Lista task
- `/steering/{type}` - Documenti steering

### Aggiornamenti in Tempo Reale

La dashboard usa WebSocket per aggiornamenti live:

- **Refresh Automatico**
  - Nuove specifiche appaiono istantaneamente
  - Aggiornamenti stato task
  - Cambi progressi
  - Notifiche approvazione

- **Stato Connessione**
  - Verde: Connesso
  - Giallo: Riconnessione
  - Rosso: Disconnesso

- **Sistema Notifiche**
  - Richieste approvazione
  - Completamenti task
  - Alert errori
  - Messaggi successo

### Personalizzazione Dashboard

#### Impostazioni Tema

Alterna tra modalità chiara e scura:
- Clicca icona tema nell'header
- Persiste tra sessioni
- Rispetta preferenza sistema

#### Selezione Lingua

Cambia lingua interfaccia:
1. Clicca icona impostazioni
2. Seleziona lingua da dropdown
3. Interfaccia si aggiorna immediatamente

Lingue supportate:
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

#### Opzioni Display

Personalizza preferenze vista:
- Card specifiche compatte/espanse
- Mostra/nascondi task completati
- Dimensione font documento
- Tema sintassi codice

## Estensione VSCode

### Installazione

Installa da VSCode Marketplace:

1. Apri Estensioni VSCode (Ctrl+Shift+X)
2. Cerca "Spec Workflow MCP"
3. Clicca Installa
4. Ricarica VSCode

Oppure via riga di comando:
```bash
code --install-extension Pimzino.spec-workflow-mcp
```

### Funzionalità Estensione

#### Pannello Sidebar

Accedi tramite icona Activity Bar:

- **Explorer Specifiche**
  - Vista albero di tutte le specifiche
  - Espandi per vedere documenti
  - Indicatori stato
  - Azioni menu contestuale

- **Lista Task**
  - Vista task filtrabile
  - Tracciamento progressi
  - Azioni rapide
  - Funzionalità ricerca

- **Vista Archivio**
  - Specifiche completate
  - Dati storici
  - Opzione ripristino
  - Operazioni bulk

#### Visualizzatore Documenti

Apri documenti nell'editor:

- **Evidenziazione Sintassi**
  - Rendering markdown
  - Blocchi codice
  - Checkbox task
  - Link e riferimenti

- **Azioni Documento**
  - Modifica sul posto
  - Modalità anteprima
  - Vista split
  - Opzioni esportazione

#### Approvazioni Integrate

Dialoghi nativi VSCode per:

- **Richieste Approvazione**
  - Notifiche pop-up
  - Commenti inline
  - Rapida approvazione/rifiuto
  - Feedback dettagliato

- **Flusso Revisione**
  - Traccia modifiche
  - Thread commenti
  - Confronto versioni
  - Cronologia approvazioni

#### Azioni Menu Contestuale

Azioni click-destro nell'editor:

- **Su File Specifiche**
  - Approva documento
  - Richiedi modifiche
  - Visualizza in dashboard
  - Copia percorso specifica

- **Su Item Task**
  - Segna completo
  - Copia prompt
  - Aggiungi subtask
  - Visualizza dettagli

### Impostazioni Estensione

Configura nelle impostazioni VSCode:

```json
{
  "specWorkflow.language": "it",
  "specWorkflow.notifications.enabled": true,
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.5,
  "specWorkflow.archive.showInExplorer": true,
  "specWorkflow.tasks.autoRefresh": true,
  "specWorkflow.tasks.refreshInterval": 5000,
  "specWorkflow.theme.followVSCode": true
}
```

#### Descrizioni Impostazioni

| Impostazione | Descrizione | Predefinito |
|---------|-------------|---------|
| `language` | Lingua interfaccia | "en" |
| `notifications.enabled` | Mostra notifiche | true |
| `notifications.sound` | Riproduci alert sonori | true |
| `notifications.volume` | Volume suono (0-1) | 0.5 |
| `archive.showInExplorer` | Mostra specifiche archiviate | true |
| `tasks.autoRefresh` | Auto-refresh task | true |
| `tasks.refreshInterval` | Intervallo refresh (ms) | 5000 |
| `theme.followVSCode` | Adatta tema VSCode | true |

### Comandi Estensione

Disponibili in Command Palette (Ctrl+Shift+P):

| Comando | Descrizione |
|---------|-------------|
| `Spec Workflow: Create Spec` | Avvia nuova specifica |
| `Spec Workflow: List Specs` | Mostra tutte le specifiche |
| `Spec Workflow: View Dashboard` | Apri dashboard web |
| `Spec Workflow: Archive Spec` | Sposta in archivio |
| `Spec Workflow: Restore Spec` | Ripristina da archivio |
| `Spec Workflow: Refresh` | Ricarica dati specifiche |
| `Spec Workflow: Show Steering` | Visualizza documenti steering |
| `Spec Workflow: Export Spec` | Esporta in markdown |

### Notifiche Sonore

L'estensione include alert audio per:

- **Richieste Approvazione** - Suono delicato
- **Completamento Task** - Suono successo
- **Errori** - Tono alert
- **Aggiornamenti** - Notifica soft

Configura nelle impostazioni:
```json
{
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.3
}
```

## Confronto Funzionalità

| Funzionalità | Dashboard Web | Estensione VSCode |
|---------|--------------|------------------|
| Visualizza specifiche | ✅ | ✅ |
| Gestisci task | ✅ | ✅ |
| Approvazioni | ✅ | ✅ |
| Aggiornamenti tempo reale | ✅ | ✅ |
| Sistema archivio | ❌ | ✅ |
| Notifiche sonore | ❌ | ✅ |
| Integrazione editor | ❌ | ✅ |
| Menu contestuali | ❌ | ✅ |
| Scorciatoie tastiera | Limitate | Complete |
| Multi-progetto | Manuale | Automatico |
| Accesso offline | ❌ | ✅ |
| Opzioni esportazione | Base | Avanzate |

## Scegliere l'Interfaccia Giusta

### Usa Dashboard Web Quando:

- Usi strumenti AI basati su CLI
- Lavori su più IDE
- Serve accesso browser
- Condividi con membri team
- Serve panoramica rapida progetto

### Usa Estensione VSCode Quando:

- IDE primario è VSCode
- Vuoi esperienza integrata
- Serve funzionalità editor
- Preferisci dialoghi nativi
- Vuoi notifiche sonore

## Sincronizzazione Interfacce

Entrambe le interfacce condividono gli stessi dati:

- **Sincronizzazione Tempo Reale**
  - Modifiche in una si riflettono nell'altra
  - Stato approvazione condiviso
  - Stato task consistente
  - Tracciamento progressi unificato

- **Archiviazione Dati**
  - Singola fonte verità
  - Storage basato su file
  - Nessuna sincronizzazione necessaria
  - Aggiornamenti istantanei

## Accesso Mobile e Tablet

### Dashboard Web su Mobile

La dashboard è responsive:

- **Vista Telefono**
  - Card specifiche impilate
  - Navigazione collassabile
  - Pulsanti ottimizzati touch
  - Gesti swipe

- **Vista Tablet**
  - Layout affiancato
  - Interazioni touch
  - Spaziatura ottimizzata
  - Supporto landscape

### Limitazioni su Mobile

- Nessuna estensione VSCode
- Scorciatoie tastiera limitate
- Multi-tasking ridotto
- Interazioni semplificate

## Funzionalità Accessibilità

### Dashboard Web

- **Navigazione Tastiera**
  - Tab tra elementi
  - Enter per attivare
  - Escape per annullare
  - Tasti freccia per liste

- **Supporto Screen Reader**
  - Etichette ARIA
  - Attributi ruolo
  - Annunci stato
  - Gestione focus

- **Accessibilità Visiva**
  - Modalità alto contrasto
  - Dimensione font regolabile
  - Friendly per daltonici
  - Indicatori focus

### Estensione VSCode

Eredita accessibilità VSCode:
- Supporto screen reader
- Navigazione tastiera
- Temi alto contrasto
- Funzionalità zoom

## Ottimizzazione Prestazioni

### Prestazioni Dashboard

- **Caricamento Lazy**
  - Documenti caricati su richiesta
  - Paginazione per liste lunghe
  - Rendering progressivo
  - Ottimizzazione immagini

- **Strategia Caching**
  - Caching browser
  - Service worker
  - Supporto offline (limitato)
  - Navigazione rapida

### Prestazioni Estensione

- **Gestione Risorse**
  - Uso memoria minimo
  - Watching file efficiente
  - Aggiornamenti debounced
  - Elaborazione background

## Risoluzione Problemi Interfacce

### Problemi Dashboard

| Problema | Soluzione |
|-------|----------|
| Non si carica | Controlla server in esecuzione, verifica URL |
| Nessun aggiornamento | Controlla connessione WebSocket, aggiorna pagina |
| Approvazione non funziona | Assicurati dashboard e MCP connessi |
| Stile rotto | Pulisci cache browser, controlla console |

### Problemi Estensione

| Problema | Soluzione |
|-------|----------|
| Non mostra specifiche | Controlla che progetto abbia directory .spec-workflow |
| Comandi non funzionano | Ricarica finestra VSCode |
| Nessuna notifica | Controlla impostazioni estensione |
| Archivio non visibile | Abilita nelle impostazioni |

## Uso Avanzato

### URL Dashboard Personalizzato

Configura in terminali multipli:
```bash
# Terminale 1: Server MCP
npx -y @pimzino/spec-workflow-mcp@latest /project

# Terminale 2: Dashboard
npx -y @pimzino/spec-workflow-mcp@latest /project --dashboard --port 3000
```

### Workspace Multi-Root Estensione

L'estensione supporta workspace multi-root VSCode:

1. Aggiungi cartelle progetto multiple
2. Ognuna mostra specifiche separate
3. Alterna tra progetti
4. Configurazioni indipendenti

## Documentazione Correlata

- [Guida Configurazione](CONFIGURATION.it.md) - Setup e configurazione
- [Guida Utente](USER-GUIDE.it.md) - Usare le interfacce
- [Processo Workflow](WORKFLOW.it.md) - Flusso lavoro sviluppo
- [Risoluzione Problemi](TROUBLESHOOTING.it.md) - Problemi comuni
