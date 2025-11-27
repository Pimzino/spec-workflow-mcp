# Guida Utente

Una guida completa all'utilizzo di Spec Workflow MCP per lo sviluppo software assistito da AI.

## Per Iniziare

### Cos'è Spec Workflow MCP?

Spec Workflow MCP è un server Model Context Protocol che fornisce strumenti strutturati e basati su specifiche agli assistenti AI. Ti aiuta a:

- Creare specifiche dettagliate prima di programmare
- Tracciare i progressi di implementazione
- Gestire approvazioni e revisioni
- Mantenere la documentazione del progetto

### Flusso di Lavoro Base

1. **Crea una specifica** - Definisci cosa vuoi costruire
2. **Revisiona e approva** - Assicurati che le specifiche soddisfino i requisiti
3. **Implementa i task** - Esegui il piano di implementazione
4. **Traccia i progressi** - Monitora lo stato di completamento

## Creazione Specifiche

### Creazione Specifica Semplice

Chiedi al tuo assistente AI di creare una specifica:

```
"Crea una specifica per l'autenticazione utente"
```

L'AI creerà automaticamente:
1. Un documento requisiti
2. La progettazione dell'approccio tecnico
3. La suddivisione dell'implementazione in task

### Creazione Specifica Dettagliata

Fornisci più contesto per specifiche migliori:

```
"Crea una specifica chiamata payment-gateway con le seguenti funzionalità:
- Elaborazione carta di credito
- Integrazione PayPal
- Gestione abbonamenti
- Gestione webhook per eventi di pagamento"
```

### Da Documenti Esistenti

Usa i tuoi PRD o documenti di design esistenti:

```
"Costruisci una specifica da @product-requirements.md"
```

## Gestione Specifiche

### Elencare Tutte le Specifiche

```
"Elenca tutte le mie specifiche"
```

Ritorna:
- Nomi specifiche
- Stato corrente
- Percentuale progresso
- Stati documenti

### Controllare Stato Specifica

```
"Mostrami lo stato della specifica user-auth"
```

Fornisce:
- Stato approvazione requisiti
- Stato approvazione design
- Progresso completamento task
- Suddivisione dettagliata task

### Visualizzare Documenti Specifica

Usa la dashboard o l'estensione VSCode per:
- Leggere documenti requisiti
- Revisionare documenti design
- Navigare liste task
- Tracciare progressi implementazione

## Lavorare con i Task

### Struttura Task

I task sono organizzati gerarchicamente:
- **1.0** - Sezioni principali
  - **1.1** - Subtask
  - **1.2** - Subtask
    - **1.2.1** - Passi dettagliati

### Implementare Task

#### Metodo 1: Implementazione Diretta
```
"Implementa il task 1.2 dalla specifica user-auth"
```

#### Metodo 2: Copia da Dashboard
1. Apri la dashboard
2. Naviga alla tua specifica
3. Clicca tab "Tasks"
4. Clicca pulsante "Copy Prompt" accanto a qualsiasi task
5. Incolla nella conversazione AI

#### Metodo 3: Implementazione Batch
```
"Implementa tutti i task di setup database dalla specifica user-auth"
```

### Stato Task

I task hanno tre stati:
- ⏳ **Pending** - Non iniziato
- 🔄 **In Progress** - Attualmente in lavorazione
- ✅ **Completed** - Completato

## Flusso di Approvazione

### Richiedere Approvazione

Quando i documenti sono pronti per la revisione:

1. L'AI richiede automaticamente approvazione
2. La dashboard mostra notifica
3. Rivedi il documento
4. Fornisci feedback o approva

### Azioni Approvazione

- **Approva** - Accetta il documento così com'è
- **Richiedi Modifiche** - Fornisci feedback per revisione
- **Rifiuta** - Ricomincia da zero con nuovi requisiti

### Processo di Revisione

1. Fornisci feedback specifico
2. L'AI rivede il documento
3. Rivedi versione aggiornata
4. Approva o richiedi ulteriori modifiche

## Flusso Bug

### Segnalare Bug

```
"Crea un bug report per errore login quando si usa SSO"
```

Crea:
- Descrizione bug
- Passi per riprodurre
- Comportamento atteso vs effettivo
- Priorità e gravità

### Risoluzione Bug

```
"Crea una correzione per il bug #123 nella specifica user-auth"
```

Genera:
- Analisi causa radice
- Piano implementazione correzione
- Requisiti testing
- Passi deployment

## Sistema Template

### Usare Template

Spec Workflow include template per:
- Documenti requisiti
- Documenti design
- Liste task
- Bug report
- Documenti steering

### Template Personalizzati

Crea i tuoi template in `.spec-workflow/templates/`:

```markdown
# Template Funzionalità Personalizzato

## Panoramica
[Descrizione funzionalità]

## User Stories
[User stories]

## Requisiti Tecnici
[Dettagli tecnici]
```

## Funzionalità Avanzate

### Documenti Steering

Crea guida di alto livello per il progetto:

```
"Crea documenti steering per il mio progetto e-commerce"
```

Genera:
- **Steering prodotto** - Visione e obiettivi
- **Steering tecnico** - Decisioni architetturali
- **Steering struttura** - Organizzazione progetto

### Sistema Archivio

Gestisci specifiche completate:
- Sposta specifiche finite in archivio
- Mantieni pulito workspace attivo
- Accedi a specifiche archiviate in qualsiasi momento
- Ripristina specifiche quando necessario

### Supporto Multi-Lingua

Cambia lingua interfaccia:

1. **Dashboard**: Impostazioni → Lingua
2. **Estensione VSCode**: Impostazioni Estensione → Lingua
3. **File config**: `lang = "it"` (o altro codice lingua)

## Best Practice

### 1. Inizia con Documenti Steering

Prima di creare specifiche:
```
"Crea documenti steering per guidare il progetto"
```

### 2. Sii Specifico nei Requisiti

Buono:
```
"Crea una specifica per autenticazione utente con:
- Login email/password
- OAuth2 (Google, GitHub)
- Supporto 2FA
- Flusso reset password"
```

Non ideale:
```
"Crea una specifica login"
```

### 3. Rivedi Prima dell'Implementazione

Rivedi e approva sempre:
1. Documento requisiti
2. Documento design
3. Suddivisione task

### 4. Implementa Incrementalmente

- Completa task in ordine
- Testa dopo ogni sezione principale
- Aggiorna stato task regolarmente

### 5. Usa la Dashboard

La dashboard fornisce:
- Tracciamento progressi visuale
- Navigazione facile documenti
- Azioni approvazione rapide
- Aggiornamenti in tempo reale

## Flussi di Lavoro Comuni

### Sviluppo Funzionalità

1. Crea specifica: `"Crea specifica per funzionalità carrello-acquisti"`
2. Rivedi requisiti in dashboard
3. Approva o richiedi modifiche
4. Rivedi documento design
5. Approva design
6. Implementa task sequenzialmente
7. Traccia progressi in dashboard

### Correzione Bug

1. Segnala bug: `"Crea bug report per errore checkout"`
2. Analizza: `"Analizza causa radice del bug #45"`
3. Pianifica correzione: `"Crea piano correzione per bug #45"`
4. Implementa: `"Implementa la correzione"`
5. Verifica: `"Crea piano test per correzione bug #45"`

### Refactoring

1. Crea specifica: `"Crea specifica per ottimizzazione database"`
2. Documenta stato corrente
3. Progetta miglioramenti
4. Pianifica passi migrazione
5. Implementa incrementalmente
6. Verifica ogni passo

## Suggerimenti e Trucchi

### Gestione Efficiente Task

- Usa raggruppamento task per item correlati
- Copia prompt da dashboard per accuratezza
- Segna task come completati immediatamente dopo il completamento

### Gestione Documenti

- Mantieni requisiti concisi ma completi
- Includi criteri di accettazione
- Aggiungi vincoli tecnici nel design
- Fai riferimento a documenti esterni quando necessario

### Collaborazione

- Usa commenti approvazione per feedback
- Condividi URL dashboard con il team
- Esporta documenti per revisione esterna
- Traccia modifiche attraverso cronologia revisioni

## Integrazione con Assistenti AI

### Consapevolezza Contestuale

L'assistente AI automaticamente:
- Conosce la struttura del tuo progetto
- Comprende relazioni specifiche
- Traccia progressi implementazione
- Mantiene consistenza

### Comandi Linguaggio Naturale

Parla naturalmente:
- "Quali specifiche ho?"
- "Mostrami cosa resta da fare"
- "Inizia a lavorare sul prossimo task"
- "Aggiorna il design per migliori prestazioni"

### Flusso Continuo

L'AI mantiene contesto tra sessioni:
- Riprendi da dove hai lasciato
- Fai riferimento a decisioni precedenti
- Costruisci su lavoro esistente
- Mantieni coerenza progetto

## Documentazione Correlata

- [Processo Workflow](WORKFLOW.it.md) - Guida dettagliata workflow
- [Guida Prompting](PROMPTING-GUIDE.it.md) - Esempi prompt
- [Guida Interfacce](INTERFACES.it.md) - Dettagli dashboard ed estensione
- [Riferimento Strumenti](TOOLS-REFERENCE.it.md) - Documentazione completa strumenti
