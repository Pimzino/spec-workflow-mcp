# Guida al Processo di Workflow

Questa guida spiega il processo completo di sviluppo basato su specifiche e le best practice per l'utilizzo di Spec Workflow MCP.

## Panoramica

Il workflow basato su specifiche segue un approccio strutturato:

```
Steering → Specifiche → Implementazione → Verifica
```

Ogni fase si basa sulla precedente, garantendo uno sviluppo sistematico e ben documentato.

## Fase 1: Configurazione Progetto con Documenti Steering

### Perché Documenti Steering?

I documenti steering forniscono una guida di alto livello che mantiene il tuo progetto allineato e consistente. Agiscono come una stella polare per tutte le decisioni di sviluppo.

### Creazione Documenti Steering

```
"Crea documenti steering per il mio progetto"
```

Questo genera tre documenti chiave:

#### 1. Steering Prodotto (`steering/product.md`)
- Visione e missione prodotto
- Utenti target e persona
- Funzionalità principali e priorità
- Metriche successo e KPI
- Non-obiettivi e vincoli

#### 2. Steering Tecnico (`steering/tech.md`)
- Decisioni architetturali
- Scelte stack tecnologico
- Requisiti prestazioni
- Considerazioni sicurezza
- Approccio scalabilità

#### 3. Steering Struttura (`steering/structure.md`)
- Organizzazione progetto
- Convenzioni file e cartelle
- Standard naming
- Confini moduli
- Struttura documentazione

### Best Practice per Steering

1. **Crea presto** - Configura steering prima di qualsiasi specifica
2. **Mantieni aggiornato** - Rivedi man mano che il progetto evolve
3. **Fai riferimento spesso** - Usa per prendere decisioni
4. **Condividi ampiamente** - Assicura allineamento team

## Fase 2: Creazione Specifiche

### Il Sistema a Tre Documenti

Ogni specifica consiste di tre documenti sequenziali:

```
Requisiti → Design → Task
```

### Documento Requisiti

**Scopo**: Definire COSA deve essere costruito

**Contenuti**:
- Panoramica funzionalità
- User stories
- Requisiti funzionali
- Requisiti non funzionali
- Criteri accettazione
- Vincoli e assunzioni

**Esempio Creazione**:
```
"Crea requisiti per un sistema notifiche utente che supporti:
- Notifiche email
- Notifiche in-app
- Notifiche push
- Preferenze utente
- Cronologia notifiche"
```

### Documento Design

**Scopo**: Definire COME verrà costruito

**Contenuti**:
- Architettura tecnica
- Design componenti
- Modelli dati
- Specifiche API
- Punti integrazione
- Approccio implementazione

**Generazione Automatica**: Creato dopo approvazione requisiti

### Documento Task

**Scopo**: Definire i PASSI per costruirlo

**Contenuti**:
- Suddivisione task gerarchica
- Dipendenze
- Stime sforzo
- Ordine implementazione
- Requisiti testing

**Esempio Struttura**:
```
1.0 Setup Database
  1.1 Crea tabelle notifiche
  1.2 Configura indici
  1.3 Crea script migrazione

2.0 Implementazione Backend
  2.1 Crea servizio notifiche
    2.1.1 Handler email
    2.1.2 Handler push
  2.2 Crea endpoint API
  2.3 Aggiungi autenticazione

3.0 Implementazione Frontend
  3.1 Crea componenti notifica
  3.2 Integra con API
  3.3 Aggiungi UI preferenze
```

## Fase 3: Revisione e Approvazione

### Flusso Approvazione

1. **Creazione Documento** - AI genera documento
2. **Richiesta Revisione** - Approvazione richiesta automaticamente
3. **Revisione Utente** - Rivedi in dashboard/estensione
4. **Decisione** - Approva, richiedi modifiche o rifiuta
5. **Revisione** (se necessario) - AI aggiorna in base a feedback
6. **Approvazione Finale** - Documento bloccato per implementazione

### Prendere Decisioni di Approvazione

#### Quando Approvare
- Requisiti sono completi e chiari
- Design risolve problema dichiarato
- Task sono logici e completi
- Nessuna preoccupazione o gap importante

#### Quando Richiedere Modifiche
- Mancano dettagli importanti
- Specifiche poco chiare
- Approccio migliore disponibile
- Serve allineamento con standard

#### Quando Rifiutare
- Incomprensione fondamentale
- Approccio completamente sbagliato
- Richiede ripensamento completo

### Fornire Feedback Efficace

Buon feedback:
```
"Il flusso autenticazione dovrebbe usare token JWT invece di sessioni.
Aggiungi rate limiting agli endpoint API.
Includi gestione errori per fallimenti rete."
```

Feedback scarso:
```
"Questo non sembra giusto. Sistemalo."
```

## Fase 4: Implementazione

### Strategia Esecuzione Task

#### Implementazione Sequenziale
Migliore per task dipendenti:
```
"Implementa task 1.1 dalla specifica user-auth"
"Ora implementa task 1.2"
"Continua con task 1.3"
```

#### Implementazione Parallela
Per task indipendenti:
```
"Implementa tutti i task UI dalla specifica dashboard mentre lavoro sul backend"
```

#### Implementazione Basata su Sezioni
Per raggruppamenti logici:
```
"Implementa tutti i task database dalla specifica payment"
```

### Tracciamento Progressi

Monitora implementazione tramite:
- Vista task dashboard
- Barre progressi
- Indicatori stato
- Percentuali completamento

### Gestione Blocchi

Quando bloccato:
1. Documenta il blocco
2. Crea sub-task per risoluzione
3. Passa a task paralleli se possibile
4. Aggiorna stato task a "bloccato"

## Fase 5: Verifica

### Strategia Testing

Dopo implementazione:

1. **Unit Testing**
   ```
   "Crea unit test per il servizio notifiche"
   ```

2. **Integration Testing**
   ```
   "Crea integration test per gli endpoint API"
   ```

3. **End-to-End Testing**
   ```
   "Crea test E2E per il flusso notifiche completo"
   ```

### Aggiornamenti Documentazione

Mantieni documentazione aggiornata:
```
"Aggiorna documentazione API per i nuovi endpoint"
"Aggiungi esempi uso al README"
```

## Struttura File e Organizzazione

### Struttura Progetto Standard

```
your-project/
├── .spec-workflow/
│   ├── steering/
│   │   ├── product.md
│   │   ├── tech.md
│   │   └── structure.md
│   ├── specs/
│   │   ├── user-auth/
│   │   │   ├── requirements.md
│   │   │   ├── design.md
│   │   │   └── tasks.md
│   │   └── payment-gateway/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── approval/
│       └── [file tracciamento approvazioni]
├── src/
│   └── [tua implementazione]
└── tests/
    └── [tuoi test]
```

### Convenzioni Naming

**Nomi Specifiche**:
- Usa kebab-case: `user-authentication`
- Sii descrittivo: `payment-processing` non `payments`
- Evita versioni: `user-profile` non `user-profile-v2`

**Nomi Documenti**:
- Sempre: `requirements.md`, `design.md`, `tasks.md`
- Consistente tra tutte le specifiche

## Workflow Avanzati

### Iterazioni Funzionalità

Per funzionalità in evoluzione:

1. Crea specifica iniziale
2. Implementa MVP
3. Crea specifica enhancement
4. Fai riferimento a specifica originale
5. Costruisci su lavoro esistente

Esempio:
```
"Crea specifica enhancement per user-auth che aggiunga:
- Login social (Google, Facebook)
- Autenticazione biometrica
- Miglioramenti gestione sessioni"
```

### Workflow Refactoring

1. **Documenta Stato Corrente**
   ```
   "Crea specifica che documenti sistema autenticazione corrente"
   ```

2. **Progetta Miglioramenti**
   ```
   "Progetta refactoring per migliorare prestazioni autenticazione"
   ```

3. **Pianifica Migrazione**
   ```
   "Crea task migrazione per il refactoring"
   ```

4. **Implementa Gradualmente**
   ```
   "Implementa task refactoring con compatibilità retroattiva"
   ```

### Workflow Risoluzione Bug

1. **Bug Report**
   ```
   "Crea bug report per problema timeout login"
   ```

2. **Investigazione**
   ```
   "Investiga causa radice del bug #45"
   ```

3. **Design Soluzione**
   ```
   "Progetta correzione per problema timeout"
   ```

4. **Implementazione**
   ```
   "Implementa correzione bug"
   ```

5. **Verifica**
   ```
   "Crea test regressione per bug #45"
   ```

## Best Practice

### 1. Mantieni Granularità Specifica

**Buono**: Una specifica per funzionalità
- `user-authentication`
- `payment-processing`
- `notification-system`

**Scarso**: Specifiche troppo ampie
- `backend-system`
- `all-features`

### 2. Creazione Documento Sequenziale

Segui sempre l'ordine:
1. Requisiti (cosa)
2. Design (come)
3. Task (passi)

Non saltare mai avanti.

### 3. Approvazione Completa Prima dell'Implementazione

- ✅ Approva requisiti → Crea design
- ✅ Approva design → Crea task
- ✅ Rivedi task → Inizia implementazione
- ❌ Salta approvazione → Problemi implementazione

### 4. Mantieni Specifiche Aggiornate

Quando requisiti cambiano:
```
"Aggiorna requisiti per user-auth per includere supporto SSO"
```

### 5. Usa Terminologia Consistente

Mantieni consistenza in:
- Nomi specifiche
- Nomi componenti
- Terminologia API
- Naming database

### 6. Archivia Specifiche Completate

Mantieni pulito workspace:
```
"Archivia specifica user-auth completata"
```

## Pattern Comuni

### Da MVP a Funzionalità Completa

1. Inizia con specifica MVP
2. Implementa funzionalità core
3. Crea specifiche enhancement
4. Costruisci incrementalmente
5. Mantieni compatibilità retroattiva

### Sviluppo Microservizi

1. Crea documento steering servizio
2. Definisci confini servizio
3. Crea specifica per servizio
4. Definisci punti integrazione
5. Implementa servizi indipendentemente

### Sviluppo API-First

1. Crea specifica API prima
2. Progetta contratti
3. Genera documentazione
4. Implementa endpoint
5. Crea SDK client

## Risoluzione Problemi Workflow

### Specifiche Diventano Troppo Grandi

**Soluzione**: Dividi in specifiche più piccole
```
"Dividi specifica e-commerce in:
- product-catalog
- shopping-cart
- checkout-process
- order-management"
```

### Requisiti Poco Chiari

**Soluzione**: Richiedi chiarimenti
```
"I requisiti necessitano più dettagli su:
- Ruoli e permessi utente
- Scenari gestione errori
- Requisiti prestazioni"
```

### Design Non Corrisponde a Requisiti

**Soluzione**: Richiedi revisione
```
"Il design non affronta requisito multi-tenancy.
Rivedi per includere isolamento tenant."
```

## Integrazione con Processo Sviluppo

### Workflow Git

1. Crea branch feature per specifica
2. Commit dopo ogni completamento task
3. Fai riferimento a specifica in messaggi commit
4. PR quando specifica è completa

### Integrazione CI/CD

- Esegui test per task completati
- Valida contro requisiti
- Deploya funzionalità completate
- Monitora contro metriche successo

### Collaborazione Team

- Condividi URL dashboard
- Assegna specifiche a membri team
- Rivedi specifiche reciprocamente
- Coordina tramite approvazioni

## Documentazione Correlata

- [Guida Utente](USER-GUIDE.it.md) - Istruzioni uso generali
- [Guida Prompting](PROMPTING-GUIDE.it.md) - Esempi prompt e pattern
- [Riferimento Strumenti](TOOLS-REFERENCE.it.md) - Documentazione completa strumenti
- [Guida Interfacce](INTERFACES.it.md) - Dettagli dashboard ed estensione
