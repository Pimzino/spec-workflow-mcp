# Riferimento Strumenti

Documentazione completa per tutti gli strumenti MCP forniti da Spec Workflow MCP.

## Panoramica

Spec Workflow MCP fornisce strumenti specializzati per lo sviluppo software strutturato. Questi strumenti sono accessibili agli assistenti AI tramite il Model Context Protocol.

## Categorie Strumenti

1. **Guide Workflow** - Documentazione e guida
2. **Gestione Specifiche** - Crea e gestisci specifiche
3. **Strumenti Contesto** - Recupera informazioni progetto
4. **Strumenti Steering** - Guida a livello progetto
5. **Strumenti Approvazione** - Flusso approvazione documenti

## Strumenti Guide Workflow

### spec-workflow-guide

**Scopo**: Fornisce guida completa per il processo workflow basato su specifiche.

**Parametri**: Nessuno

**Ritorna**: Guida markdown che spiega workflow completo

**Esempio Uso**:
```
"Mostrami la guida al workflow specifiche"
```

**Risposta Contiene**:
- Panoramica workflow
- Processo passo-passo
- Best practice
- Esempi prompt

### steering-guide

**Scopo**: Guida per creare documenti steering progetto.

**Parametri**: Nessuno

**Ritorna**: Guida markdown per creazione documenti steering

**Esempio Uso**:
```
"Mostrami come creare documenti steering"
```

**Risposta Contiene**:
- Tipi documenti steering
- Processo creazione
- Linee guida contenuto
- Esempi

## Strumenti Gestione Specifiche

### create-spec-doc

**Scopo**: Crea o aggiorna documenti specifica (requisiti, design, task).

**Parametri**:

| Parametro | Tipo | Richiesto | Descrizione |
|-----------|------|----------|-------------|
| specName | string | Sì | Nome specifica (kebab-case) |
| docType | string | Sì | Tipo: "requirements", "design" o "tasks" |
| content | string | Sì | Contenuto markdown del documento |
| revision | boolean | No | Se è una revisione (default: false) |

**Esempio Uso**:
```typescript
{
  specName: "user-authentication",
  docType: "requirements",
  content: "# Requisiti Autenticazione Utente\n\n## Panoramica\n...",
  revision: false
}
```

**Ritorna**:
```typescript
{
  success: true,
  message: "Documento requisiti creato con successo",
  path: ".spec-workflow/specs/user-authentication/requirements.md",
  requestedApproval: true
}
```

**Note**:
- Crea directory specifica se non esiste
- Richiede automaticamente approvazione per nuovi documenti
- Valida formato markdown
- Preserva documenti esistenti quando si creano nuovi tipi

### spec-list

**Scopo**: Elenca tutte le specifiche con il loro stato corrente.

**Parametri**: Nessuno

**Ritorna**: Array di riassunti specifiche

**Struttura Risposta**:
```typescript
[
  {
    name: "user-authentication",
    status: "in-progress",
    progress: 45,
    documents: {
      requirements: "approved",
      design: "pending-approval",
      tasks: "not-created"
    },
    taskStats: {
      total: 15,
      completed: 7,
      inProgress: 1,
      pending: 7
    }
  }
]
```

**Esempio Uso**:
```
"Elenca tutte le mie specifiche"
```

### spec-status

**Scopo**: Ottiene informazioni stato dettagliate per una specifica specifica.

**Parametri**:

| Parametro | Tipo | Richiesto | Descrizione |
|-----------|------|----------|-------------|
| specName | string | Sì | Nome specifica da controllare |

**Ritorna**: Stato specifica dettagliato

**Struttura Risposta**:
```typescript
{
  exists: true,
  name: "user-authentication",
  documents: {
    requirements: {
      exists: true,
      approved: true,
      lastModified: "2024-01-15T10:30:00Z",
      size: 4523
    },
    design: {
      exists: true,
      approved: false,
      pendingApproval: true,
      lastModified: "2024-01-15T14:20:00Z",
      size: 6234
    },
    tasks: {
      exists: true,
      taskCount: 15,
      completedCount: 7,
      inProgressCount: 1,
      progress: 45
    }
  },
  overallProgress: 45,
  currentPhase: "implementation"
}
```

**Esempio Uso**:
```
"Mostrami stato specifica user-authentication"
```

### manage-tasks

**Scopo**: Gestione task completa inclusi aggiornamenti, cambi stato e tracciamento progressi.

**Parametri**:

| Parametro | Tipo | Richiesto | Descrizione |
|-----------|------|----------|-------------|
| specName | string | Sì | Nome specifica |
| action | string | Sì | Azione: "update", "complete", "list", "progress" |
| taskId | string | A volte | ID task (richiesto per update/complete) |
| status | string | No | Nuovo stato: "pending", "in-progress", "completed" |
| notes | string | No | Note aggiuntive per task |

**Azioni**:

1. **Aggiorna Stato Task**:
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "Implementazione iniziata"
}
```

2. **Completa Task**:
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **Elenca Task**:
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **Ottieni Progressi**:
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**Ritorna**: Informazioni task o conferma aggiornamento

## Strumenti Contesto

### get-template-context

**Scopo**: Recupera template markdown per tutti i tipi documento.

**Parametri**: Nessuno

**Ritorna**: Oggetto contenente tutti i template

**Struttura Risposta**:
```typescript
{
  requirements: "# Template Requisiti\n\n## Panoramica\n...",
  design: "# Template Design\n\n## Architettura\n...",
  tasks: "# Template Task\n\n## Task Implementazione\n...",
  product: "# Template Steering Prodotto\n...",
  tech: "# Template Steering Tecnico\n...",
  structure: "# Template Steering Struttura\n..."
}
```

**Esempio Uso**:
```
"Ottieni tutti i template documenti"
```

### get-steering-context

**Scopo**: Recupera documenti steering progetto e guida.

**Parametri**:

| Parametro | Tipo | Richiesto | Descrizione |
|-----------|------|----------|-------------|
| docType | string | No | Doc specifico: "product", "tech", "structure" o "all" |

**Ritorna**: Contenuto documento steering

**Esempio Uso**:
```typescript
{
  docType: "tech"  // Ritorna solo steering tecnico
}
```

**Struttura Risposta**:
```typescript
{
  product: "# Steering Prodotto\n\n## Visione\n...",
  tech: "# Steering Tecnico\n\n## Architettura\n...",
  structure: "# Steering Struttura\n\n## Organizzazione\n..."
}
```

### get-spec-context

**Scopo**: Recupera contesto completo per una specifica specifica.

**Parametri**:

| Parametro | Tipo | Richiesto | Descrizione |
|-----------|------|----------|-------------|
| specName | string | Sì | Nome specifica |
| includeContent | boolean | No | Includi contenuto documento (default: true) |

**Ritorna**: Contesto specifica completo

**Struttura Risposta**:
```typescript
{
  name: "user-authentication",
  exists: true,
  documents: {
    requirements: {
      exists: true,
      content: "# Requisiti\n\n...",
      approved: true
    },
    design: {
      exists: true,
      content: "# Design\n\n...",
      approved: false
    },
    tasks: {
      exists: true,
      content: "# Task\n\n...",
      stats: {
        total: 15,
        completed: 7,
        progress: 45
      }
    }
  },
  relatedSpecs: ["user-profile", "session-management"],
  dependencies: ["database-setup", "auth-library"]
}
```

**Esempio Uso**:
```
"Ottieni contesto completo per specifica user-authentication"
```

## Strumenti Documenti Steering

### create-steering-doc

**Scopo**: Crea documenti steering progetto (product, tech, structure).

**Parametri**:

| Parametro | Tipo | Richiesto | Descrizione |
|-----------|------|----------|-------------|
| docType | string | Sì | Tipo: "product", "tech" o "structure" |
| content | string | Sì | Contenuto markdown documento |

**Esempio Uso**:
```typescript
{
  docType: "product",
  content: "# Steering Prodotto\n\n## Visione\nCostruire il migliore..."
}
```

**Ritorna**:
```typescript
{
  success: true,
  message: "Documento steering prodotto creato",
  path: ".spec-workflow/steering/product.md"
}
```

**Note**:
- Crea directory steering se necessario
- Sovrascrive documenti steering esistenti
- Nessuna approvazione richiesta per documenti steering
- Dovrebbe essere creato prima delle specifiche

## Strumenti Sistema Approvazione

### request-approval

**Scopo**: Richiede approvazione utente per un documento.

**Parametri**:

| Parametro | Tipo | Richiesto | Descrizione |
|-----------|------|----------|-------------|
| specName | string | Sì | Nome specifica |
| docType | string | Sì | Tipo documento da approvare |
| documentId | string | Sì | ID unico per tracciamento |
| content | string | Sì | Contenuto documento per revisione |

**Esempio Uso**:
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# Requisiti\n\n..."
}
```

**Ritorna**:
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "Approvazione richiesta. Controlla dashboard per revisionare."
}
```

### get-approval-status

**Scopo**: Controlla stato approvazione di un documento.

**Parametri**:

| Parametro | Tipo | Richiesto | Descrizione |
|-----------|------|----------|-------------|
| specName | string | Sì | Nome specifica |
| documentId | string | Sì | ID documento da controllare |

**Ritorna**:
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "Aggiungi più dettagli su gestione errori",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "user"
}
```

**Esempio Uso**:
```
"Controlla stato approvazione per requisiti user-auth"
```

### delete-approval

**Scopo**: Rimuove richieste approvazione completate per pulire coda approvazione.

**Parametri**:

| Parametro | Tipo | Richiesto | Descrizione |
|-----------|------|----------|-------------|
| specName | string | Sì | Nome specifica |
| documentId | string | Sì | ID documento da rimuovere |

**Ritorna**:
```typescript
{
  success: true,
  message: "Record approvazione eliminato"
}
```

**Esempio Uso**:
```
"Pulisci approvazioni completate per user-auth"
```

## Pattern Integrazione Strumenti

### Workflow Sequenziale

Gli strumenti sono progettati per funzionare in sequenza:

1. `steering-guide` → Impara su steering
2. `create-steering-doc` → Crea documenti steering
3. `spec-workflow-guide` → Impara workflow
4. `create-spec-doc` → Crea requisiti
5. `request-approval` → Richiedi revisione
6. `get-approval-status` → Controlla stato
7. `create-spec-doc` → Crea design (dopo approvazione)
8. `manage-tasks` → Traccia implementazione

### Operazioni Parallele

Alcuni strumenti possono essere usati simultaneamente:

- `spec-list` + `spec-status` → Ottieni panoramica e dettagli
- `get-spec-context` + `get-steering-context` → Contesto progetto completo
- Multipli `create-spec-doc` → Crea specifiche multiple

### Gestione Errori

Tutti gli strumenti ritornano strutture errore consistenti:

```typescript
{
  success: false,
  error: "Specifica non trovata",
  details: "Nessuna specifica chiamata 'invalid-spec' esiste",
  suggestion: "Usa spec-list per vedere specifiche disponibili"
}
```

## Best Practice

### Selezione Strumenti

1. **Raccolta Informazioni**:
   - Usa `spec-list` per panoramica
   - Usa `spec-status` per specifica specifica
   - Usa `get-spec-context` per implementazione

2. **Creazione Documenti**:
   - Crea sempre requisiti per primi
   - Aspetta approvazione prima del design
   - Crea task dopo approvazione design

3. **Gestione Task**:
   - Aggiorna stato quando inizi task
   - Segna completo immediatamente dopo completamento
   - Usa note per contesto importante

### Considerazioni Prestazioni

- **Operazioni Batch**: Richiedi specifiche multiple in una conversazione
- **Caching**: Gli strumenti cachano letture file per prestazioni
- **Caricamento Selettivo**: Usa `includeContent: false` per controlli stato più veloci

### Sicurezza

- **Validazione Percorso**: Tutti i percorsi sono validati e sanitizzati
- **Isolamento Progetto**: Gli strumenti accedono solo directory progetto
- **Sanitizzazione Input**: Contenuto markdown è sanitizzato
- **Nessuna Esecuzione**: Gli strumenti non eseguono mai codice

## Estendere Strumenti

### Sviluppo Strumento Personalizzato

Per aggiungere nuovi strumenti:

1. Crea modulo strumento in `src/tools/`
2. Definisci schema parametri
3. Implementa funzione handler
4. Registra con server MCP
5. Aggiungi a export

Esempio struttura:
```typescript
export const customTool = {
  name: 'custom-tool',
  description: 'Descrizione',
  parameters: {
    // JSON Schema
  },
  handler: async (params) => {
    // Implementazione
  }
};
```

## Versionamento Strumenti

Gli strumenti mantengono compatibilità retroattiva:

- Aggiunte parametri sono opzionali
- Strutture risposta si estendono, non sostituiscono
- Funzionalità deprecate mostrano avvisi
- Guide migrazione fornite

## Documentazione Correlata

- [Guida Utente](USER-GUIDE.it.md) - Usare strumenti efficacemente
- [Processo Workflow](WORKFLOW.it.md) - Uso strumenti nel workflow
- [Guida Prompting](PROMPTING-GUIDE.it.md) - Esempio uso strumenti
- [Guida Sviluppo](DEVELOPMENT.it.md) - Aggiungere nuovi strumenti
