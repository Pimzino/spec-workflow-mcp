# Guida ai Prompt

Una guida completa con esempi e best practice per interagire con Spec Workflow MCP tramite assistenti AI.

## Riferimento Rapido

### Comandi Essenziali

```
"Crea una specifica per [funzionalità]"
"Elenca tutte le mie specifiche"
"Mostra stato di [nome-specifica]"
"Implementa task [numero] da [specifica]"
"Crea documenti steering"
```

## Creazione Specifiche

### Creazione Specifica Base

#### Richiesta Semplice
```
"Crea una specifica per autenticazione utente"
```

L'AI creerà:
- Documento requisiti
- Documento design (dopo approvazione)
- Suddivisione task (dopo approvazione design)

#### Richiesta Dettagliata
```
"Crea una specifica chiamata payment-processing con:
- Pagamenti carta credito tramite Stripe
- Integrazione PayPal
- Gestione rimborsi
- Elaborazione webhook per eventi pagamento
- Considerazioni conformità PCI"
```

#### Da Documentazione Esistente
```
"Crea una specifica dal PRD in @product-requirements.md"
```

```
"Costruisci una specifica basata sul documento design in @figma-export.md"
```

### Creazione Specifica Avanzata

#### Con Vincoli Tecnici
```
"Crea una specifica per notifiche real-time che:
- Usa WebSocket per aggiornamenti live
- Fallback a polling per browser vecchi
- Gestisce fino a 10.000 connessioni concorrenti
- Mantiene ordine messaggi
- Include supporto coda offline"
```

#### Con Criteri Accettazione
```
"Crea una specifica per funzionalità ricerca con questi criteri accettazione:
- Risultati appaiono entro 200ms
- Supporta matching fuzzy
- Include filtri per data, categoria e autore
- Mostra scoring rilevanza
- Gestisce errori battitura e sinonimi"
```

#### Specifica Microservizio
```
"Crea una specifica per microservizio inventario che:
- Espone API REST
- Usa PostgreSQL per storage
- Pubblica eventi su Kafka
- Implementa pattern CQRS
- Include endpoint health check"
```

## Gestione Specifiche

### Elenco e Stato

#### Ottieni Panoramica
```
"Elenca tutte le mie specifiche"
"Mostrami tutte le specifiche e i loro progressi"
"Quali specifiche sono in attesa di approvazione?"
"Quali specifiche sono attualmente in corso?"
```

#### Stato Specifico
```
"Mostra stato della specifica user-auth"
"Qual è il progresso su payment-processing?"
"Mostrami cosa resta da fare nella specifica notifiche"
"Quali task sono completati in user-profile?"
```

#### Filtraggio
```
"Mostrami specifiche completate oltre il 50%"
"Elenca specifiche in attesa di mia approvazione"
"Quali specifiche non hanno ancora task completati?"
"Mostra specifiche bloccate o ferme"
```

### Gestione Documenti

#### Visualizzazione Documenti
```
"Mostrami requisiti per user-auth"
"Visualizza documento design per payments"
"Quali sono i task per il sistema notifiche?"
"Mostra tutti i documenti per la specifica search"
```

#### Aggiornamento Documenti
```
"Aggiorna requisiti user-auth per includere 2FA"
"Rivedi design pagamenti per usare Stripe Connect"
"Aggiungi task per security testing a user-profile"
"Aggiorna requisiti basati sul feedback: [feedback]"
```

## Prompt Implementazione

### Task Individuali

#### Implementazione Base
```
"Implementa task 1.2 da user-auth"
"Completa task 2.1.3 nella specifica payment"
"Lavora sul prossimo task pending in notifications"
```

#### Con Contesto
```
"Implementa task 1.2 da user-auth usando TypeScript ed Express"
"Completa task migrazione database usando Prisma"
"Implementa task endpoint API seguendo convenzioni REST"
```

### Implementazione Batch

#### Per Sezione
```
"Implementa tutti i task database da user-auth"
"Completa tutti i task frontend nella specifica dashboard"
"Lavora attraverso tutti i task API per payments"
```

#### Per Priorità
```
"Implementa prima tutti i task critici"
"Completa i task MVP da user-profile"
"Focalizzati sui task necessari per la demo"
```

#### Sequenziale
```
"Implementa task da 1.1 a 1.5 da user-auth"
"Completa tutti i subtask sotto sezione 2"
"Lavora attraverso i task setup in ordine"
```

### Strategie Implementazione

#### Test-Driven
```
"Per task 1.2, scrivi prima i test poi implementa"
"Implementa task 2.1 con copertura test completa"
"Crea unit test mentre implementi task servizio"
```

#### Con Documentazione
```
"Implementa task 1.3 e documenta l'API"
"Completa task autenticazione con commenti inline"
"Implementa e crea esempi uso per task 2.2"
```

## Documenti Steering

### Creazione Steering

#### Set Completo
```
"Crea documenti steering per il mio progetto e-commerce"
"Configura steering per applicazione SaaS"
"Crea guida progetto per app mobile"
```

#### Documenti Individuali
```
"Crea documento steering prodotto focalizzato su esperienza utente"
"Crea steering tecnico per architettura microservizi"
"Crea steering struttura per setup monorepo"
```

#### Da Contesto
```
"Crea documenti steering basati su @project-brief.md"
"Genera steering dalle nostre decisioni tecniche in @architecture.md"
```

### Aggiornamento Steering

```
"Aggiorna steering prodotto per includere funzionalità B2B"
"Rivedi steering tecnico per usare GraphQL invece di REST"
"Aggiorna steering struttura per nuovo sistema moduli"
```

## Flussi Approvazione

### Richiesta Feedback

#### Con Preoccupazioni Specifiche
```
"Richiedi approvazione per requisiti user-auth - controlla particolarmente sezione sicurezza"
"Chiedi revisione design pagamenti - focalizzati su gestione errori"
"Richiedi feedback su suddivisione task - è troppo granulare?"
```

#### Richieste Revisione
```
"I requisiti necessitano più dettagli su:
- Scenari gestione errori
- Requisiti prestazioni
- Considerazioni sicurezza
Rivedi e risubmit"
```

### Decisioni Approvazione

#### Approvazione
```
"Approva requisiti user-auth"
"Il design sembra buono, approvalo"
"Accetta suddivisione task così com'è"
```

#### Richiesta Modifiche
```
"Richiedi modifiche ai requisiti:
- Aggiungi supporto multi-tenant
- Includi rate limiting
- Specifica policy conservazione dati"
```

#### Rifiuto
```
"Rifiuta design corrente - dobbiamo usare architettura event-driven invece"
"Ricomincia con i requisiti - lo scope è troppo ampio"
```

## Flusso Bug

### Segnalazione Bug

#### Report Dettagliato
```
"Crea bug report:
Titolo: Login fallisce con caratteri speciali
Passi: 1) Inserisci email con '+' 2) Submit form 3) Vedi errore
Atteso: Login riesce
Effettivo: errore 500
Priorità: Alta
Ambiente: Produzione"
```

#### Da Log Errori
```
"Crea bug report da questo errore: [incolla stack trace]"
"Documenta questo bug dall'alert Sentry: [link]"
```

### Risoluzione Bug

#### Investigazione
```
"Investiga causa radice del bug #45"
"Analizza perché webhook pagamento sta fallendo"
"Debug problema prestazioni in endpoint search"
```

#### Implementazione Correzione
```
"Crea correzione per bug #45 in autenticazione utente"
"Implementa soluzione per problema timeout pagamento"
"Sistema memory leak in servizio notifiche"
```

## Modifiche Mid-Implementazione

### Quando Specifiche Cambiano Durante Sviluppo

Requisiti e design spesso evolvono durante implementazione. Quando succede, devi mantenere tasks.md allineato con specifica corrente preservando lavoro completato.

### Uso Funzionalità Refresh Task

L'AI ha accesso a istruzioni refresh task complete tramite prompt refresh-tasks. Semplicemente informa l'AI delle tue modifiche:

#### Refresh Task Base
```
"I requisiti sono stati aggiornati. Aggiorna tasks.md per allinearlo con requirements.md e design.md correnti."
```

#### Refresh Task Dettagliato con Contesto
```
"Ho aggiornato la specifica con le seguenti modifiche:
- Rimosso modulo reporting
- Cambiato database da MongoDB a PostgreSQL
- Aggiunta funzionalità login social

Aggiorna tasks.md seguendo processo refresh task:
1. Preserva tutti i task completati e in-progress
2. Aggiungi task migrazione per cambio database
3. Rimuovi task pending per modulo reporting
4. Aggiungi nuovi task per login social"
```

#### Cambio Architettura Richiedente Migrazione
```
"Stiamo passando da API REST a GraphQL. Diversi endpoint REST sono già implementati. Aggiorna tasks.md con:
1. Tutto lavoro REST completato preservato
2. Task migrazione per wrappare logica REST in resolver GraphQL
3. Nuovi task implementazione GraphQL
4. Task cleanup per rimuovere REST dopo verifica GraphQL"
```

### Comportamento AI Atteso

Quando richiedi refresh task, l'AI:

1. **Analizza Stato Corrente**
   - Legge requirements.md e design.md per specifica corrente
   - Identifica task completati, in-progress e pending
   - Determina quali funzionalità sono state aggiunte, rimosse o modificate

2. **Preserva Lavoro Completato**
   - Mantiene tutti i task [x] completati invariati
   - Mantiene tutti i task [-] in-progress invariati
   - Aggiunge note quando lavoro completato è per funzionalità rimosse

3. **Gestisce Cambi Architettura**
   - Aggiunge task migrazione dopo lavoro completato che necessita aggiornamento
   - Crea task transizione per migrazione progressiva
   - Include task verifica prima di rimuovere vecchia implementazione

4. **Aggiorna Task Pending**
   - Rimuove task pending per funzionalità eliminate
   - Aggiorna task pending per requisiti modificati
   - Aggiunge nuovi task per nuove funzionalità

5. **Mantiene Struttura Task**
   - Mantiene numerazione sequenziale
   - Preserva formato task
   - Include riferimenti requisiti
   - Mantiene ordine dipendenze

### Scenari Esempio

#### Rimozione Funzionalità
```
"Abbiamo deciso di rimuovere modulo reporting dalla specifica. Aggiorna tasks.md di conseguenza."
```

Comportamento AI atteso:
- Mantieni tutti i task reporting completati con loro stato [x]
- Mantieni tutti i task reporting in-progress con loro stato [-]
- Rimuovi solo task reporting pending [ ]
- Aggiungi nota: "_Nota: Funzionalità reporting rimossa da specifica ma lavoro completato preservato_"

#### Cambio Architettura con Lavoro Completato
```
"Stiamo passando da MongoDB a PostgreSQL. Aggiorna i task database pending. Nota che abbiamo già implementato schemi MongoDB e logica connessione."
```

Comportamento AI atteso:
- Preserva tutti i task MongoDB completati esattamente come scritti
- Preserva tutti i task MongoDB in-progress esattamente come scritti
- Aggiungi nuovi task migrazione immediatamente dopo lavoro MongoDB completato:
  - Migra schemi MongoDB a tabelle PostgreSQL
  - Sostituisci logica connessione MongoDB con client PostgreSQL
  - Aggiorna query database da sintassi MongoDB a PostgreSQL
  - Migra dati MongoDB esistenti a PostgreSQL
  - Aggiorna configurazione ambiente per PostgreSQL
  - Rimuovi dipendenze MongoDB dopo verifica migrazione
- Aggiorna task database pending rimanenti per usare PostgreSQL
- Mantieni sequenza numerazione task

#### Aggiunta Funzionalità
```
"Aggiungi login social alla specifica autenticazione. Requisiti e design sono stati aggiornati."
```

Comportamento AI atteso:
- Analizza struttura task corrente per punto inserimento logico
- Aggiungi nuovi task login social con numerazione appropriata
- Fai riferimento a requisiti specifici per login social
- Assicurati che nuovi task mantengano ordine dipendenze
- Se autenticazione base è già implementata, aggiungi task integrazione

### Gestione Migrazioni Architettura

Quando cambi architettura affettano codice già implementato:

#### Migrazione REST a GraphQL
```
"Stiamo cambiando da REST a GraphQL. Diversi endpoint REST sono già implementati."
```

Aggiunte task attese:
- Preserva task endpoint REST completati
- Aggiungi task definizione schema GraphQL
- Aggiungi task implementazione resolver
- Aggiungi task migrazione per wrappare logica REST esistente in resolver GraphQL
- Aggiungi task per aggiornare codice client per usare GraphQL
- Aggiungi task cleanup per rimuovere endpoint REST dopo verifica GraphQL

#### Divisione Monolite in Microservizi
```
"Stiamo dividendo servizio utente monolitico in servizi auth e profile separati."
```

Aggiunte task attese:
- Preserva task servizio monolitico completati
- Aggiungi task separazione servizi
- Aggiungi task comunicazione inter-servizi
- Aggiungi task migrazione dati se database si dividono
- Aggiungi task configurazione deployment per nuovi servizi
- Aggiungi task cleanup per rimuovere codice monolitico dopo verifica servizi

### Formato Task per Migrazioni

Task migrazione dovrebbero indicare chiaramente loro scopo:

```
"Dopo aver aggiornato i task, vedo che hai aggiunto:
- [ ] 2.4 Migra schemi MongoDB a tabelle PostgreSQL
  - File: src/database/migrations/mongo-to-postgres.ts
  - Converti schemi documento a tabelle relazionali
  - Mappa documenti embedded a relazioni foreign key
  - Preserva tutte le relazioni dati esistenti
  - Scopo: Transizione layer database a nuova architettura
  - _Leverage: Schemi MongoDB completati in task 2.1-2.3_
  - _Requisiti: Sezione design 3.2_"
```

### Comunicare Modifiche all'AI

Quando informi l'AI su cambi specifica:

#### Sii Specifico su Modifiche e Impatto
```
"I requisiti elaborazione pagamenti sono cambiati. Stripe è ora richiesto invece di PayPal. Abbiamo già implementato handler webhook PayPal. Aggiorna tasks.md per riflettere questo cambio, includendo task migrazione."
```

#### Fornisci Contesto per Preservazione e Migrazione
```
"Anche se stiamo passando da MongoDB a PostgreSQL, mantieni tutti i task MongoDB completati dato che quel lavoro è già fatto. Aggiungi task migrazione per transizionare codice MongoDB implementato a PostgreSQL."
```

#### Richiedi Validazione
```
"Dopo aver aggiornato tasks.md, conferma che tutti i requisiti in requirements.md abbiano task corrispondenti, esistano percorsi migrazione per cambi architettura, e che non esistano task pending per funzionalità rimosse."
```

### Strategia Migrazione Progressiva

Per cambi architettura maggiori, l'AI dovrebbe creare task che supportino migrazione progressiva:

1. Implementa nuova architettura accanto a esistente
2. Aggiungi task compatibility layer
3. Migra funzionalità incrementalmente
4. Verifica ogni passo migrazione
5. Rimuovi vecchia implementazione solo dopo verifica completa

Questo assicura che applicazione rimanga funzionale durante transizione.

### Uso Prompt Refresh Tasks

Puoi anche invocare esplicitamente prompt refresh tasks:

```
"Usa prompt refresh-tasks per specifica user-auth. I cambi sono: passato da JWT a OAuth2 per autenticazione."
```

L'AI seguirà poi le istruzioni refresh complete per aggiornare i tuoi task preservando tutto il lavoro completato.

## Pattern Avanzati

### Workflow Multi-Spec

#### Specifiche Correlate
```
"Crea specifica per admin-dashboard che integri con:
- specifica user-management
- specifica analytics
- specifica reporting"
```

#### Dipendenze Specifiche
```
"Crea specifica per notifiche che dipenda da:
- user-auth essere completo
- message-queue essere implementato
- email-service essere disponibile"
```

### Sviluppo Incrementale

#### MVP Prima
```
"Crea specifica MVP per user-profiles con solo:
- Creazione profilo base
- Display name e avatar
- Vista profilo pubblica
(Aggiungeremo funzionalità social dopo)"
```

#### Specifiche Enhancement
```
"Crea specifica enhancement per user-auth aggiungendo:
- Login social (Google, GitHub)
- Autenticazione biometrica
- Gestione sessione avanzata
- Linking account"
```

### Scenari Complessi

#### Specifiche Migrazione
```
"Crea specifica per migrare da MongoDB a PostgreSQL:
- Documenta schema corrente
- Progetta nuova struttura relazionale
- Pianifica migrazione zero-downtime
- Include procedure rollback"
```

#### Specifiche Refactoring
```
"Crea specifica refactoring per:
- Dividere monolite in servizi
- Estrarre componenti condivisi
- Migliorare copertura test all'80%
- Mantenere compatibilità retroattiva"
```

#### Specifiche Prestazioni
```
"Crea specifica ottimizzazione prestazioni:
- Profila bottleneck correnti
- Progetta strategia caching
- Pianifica indicizzazione database
- Implementa monitoraggio"
```

## Combinazioni Workflow

### Flusso Funzionalità Completo
```
1. "Crea documenti steering per il progetto"
2. "Crea specifica per autenticazione utente"
3. "Rivedi e approva requisiti"
4. "Rivedi e approva design"
5. "Implementa task 1.1 - schema database"
6. "Implementa task 1.2 - servizio autenticazione"
7. "Crea test per flusso autenticazione"
8. "Segna tutti i task come completi"
```

### Sviluppo Parallelo
```
"Mentre rivedo i requisiti, inizia a bozzare design API"
"Crea specifiche per frontend e backend in parallelo"
"Lavora su task UI mentre team backend fa task API"
```

### Raffinamento Iterativo
```
1. "Crea specifica iniziale per search"
2. "Implementa ricerca base (task 1-3)"
3. "Crea specifica enhancement per ricerca avanzata"
4. "Aggiungi funzionalità filtro e ordinamento"
5. "Crea specifica ottimizzazione per prestazioni search"
```

## Prompt Context-Aware

### Uso Contesto Progetto
```
"Crea specifica che segua i nostri pattern esistenti"
"Implementa questo task consistente con il nostro codebase"
"Progetta questa funzionalità per integrarsi con architettura corrente"
```

### Riferimento Altre Specifiche
```
"Crea specifica simile a user-auth ma per autenticazione admin"
"Usa stessi pattern design della specifica payment"
"Segui struttura task dalla nostra specifica notification"
```

### Costruire su Lavoro Precedente
```
"Estendi specifica user-auth per includere gestione team"
"Aggiungi supporto GraphQL alla specifica API REST esistente"
"Migliora specifica search con funzionalità machine learning"
```

## Suggerimenti per Prompting Efficace

### Sii Specifico
❌ **Vago**: "Crea specifica login"
✅ **Specifico**: "Crea specifica per login email/password con 2FA, ricordami e reset password"

### Fornisci Contesto
❌ **Nessun contesto**: "Implementa il task"
✅ **Con contesto**: "Implementa task 1.2 usando nostro middleware Express esistente e database PostgreSQL"

### Imposta Aspettative Chiare
❌ **Poco chiaro**: "Rendilo migliore"
✅ **Chiaro**: "Migliora design per gestire 10x traffico corrente con tempi risposta sotto 200ms"

### Usa Richieste Incrementali
❌ **Troppo**: "Crea 5 specifiche e implementa tutto"
✅ **Incrementale**: "Crea prima specifica user-auth, poi revisioneremo prima di passare alla prossima"

### Fai Riferimento a Lavoro Esistente
❌ **Da zero**: "Crea nuovo sistema pagamenti"
✅ **Costruendo su**: "Migliora nostra specifica payment per aggiungere fatturazione abbonamenti"

## Libreria Pattern Comuni

### Operazioni CRUD
```
"Crea specifica per operazioni CRUD su prodotti includendo:
- Create con validazione
- Read con paginazione e filtri
- Update con locking ottimistico
- Soft delete con opzione recovery"
```

### Autenticazione & Autorizzazione
```
"Crea specifica auth con:
- Autenticazione basata JWT
- Controllo accesso basato ruoli
- Gestione API key
- Gestione sessioni
- Rotazione refresh token"
```

### Funzionalità Real-time
```
"Crea specifica per chat real-time:
- Connessioni WebSocket
- Persistenza messaggi
- Indicatori digitazione
- Conferme lettura
- Coda messaggi offline"
```

### Gestione File
```
"Crea specifica caricamento file:
- Caricamenti chunked per file grandi
- Tracciamento progressi
- Capacità resume
- Scansione virus
- Integrazione CDN"
```

### Analytics & Reporting
```
"Crea specifica analytics:
- Tracciamento eventi
- Dimensioni personalizzate
- Dashboard real-time
- Report schedulati
- Opzioni esportazione dati"
```

## Prompt Risoluzione Problemi

### Quando le Cose Vanno Male
```
"Perché questa specifica non si mostra?"
"Debug perché task non si completa"
"Cosa blocca l'approvazione?"
"Aiutami a capire questo errore"
```

### Sbloccarsi
```
"Cosa dovrei fare dopo?"
"Mostrami cosa blocca i progressi"
"Su quali task posso lavorare mentre aspetto?"
"Come risolvo questa dipendenza?"
```

## Documentazione Correlata

- [Guida Utente](USER-GUIDE.it.md) - Istruzioni uso generali
- [Processo Workflow](WORKFLOW.it.md) - Comprendere il workflow
- [Riferimento Strumenti](TOOLS-REFERENCE.it.md) - Documentazione completa strumenti
- [Risoluzione Problemi](TROUBLESHOOTING.it.md) - Risolvere problemi comuni
