# Workflow-Prozess-Leitfaden

Dieser Leitfaden erklärt den vollständigen spezifikationsgetriebenen Entwicklungsworkflow und Best Practices für die Verwendung von Spec Workflow MCP.

## Überblick

Der spezifikationsgetriebene Workflow folgt einem strukturierten Ansatz:

```
Steering → Spezifikationen → Implementierung → Verifizierung
```

Jede Phase baut auf der vorherigen auf und gewährleistet systematische und gut dokumentierte Entwicklung.

## Phase 1: Projekteinrichtung mit Steering-Dokumenten

### Warum Steering-Dokumente?

Steering-Dokumente bieten hochrangige Leitlinien, die Ihr Projekt ausgerichtet und konsistent halten. Sie fungieren als Nordstern für alle Entwicklungsentscheidungen.

### Steering-Dokumente erstellen

```
"Erstelle Steering-Dokumente für mein Projekt"
```

Dies generiert drei Schlüsseldokumente:

#### 1. Product Steering (`steering/product.md`)
- Produktvision und Mission
- Zielbenutzer und Personas
- Kernfunktionen und Prioritäten
- Erfolgsmetriken und KPIs
- Nicht-Ziele und Einschränkungen

#### 2. Technical Steering (`steering/tech.md`)
- Architekturentscheidungen
- Technologie-Stack-Auswahl
- Leistungsanforderungen
- Sicherheitsüberlegungen
- Skalierbarkeitsan­satz

#### 3. Structure Steering (`steering/structure.md`)
- Projektorganisation
- Datei- und Ordnerkonventionen
- Namensstandards
- Modulgrenzen
- Dokumentationsstruktur

### Best Practices für Steering

1. **Früh erstellen** - Steering vor allen Specs einrichten
2. **Aktuell halten** - Überarbeiten, wenn sich Projekt entwickelt
3. **Häufig referenzieren** - Für Entscheidungsfindung verwenden
4. **Weit teilen** - Team-Ausrichtung sicherstellen

## Phase 2: Spezifikationserstellung

### Das Drei-Dokument-System

Jede Spec besteht aus drei sequenziellen Dokumenten:

```
Anforderungen → Design → Aufgaben
```

### Anforderungsdokument

**Zweck**: Definieren WAS gebaut werden muss

**Inhalt**:
- Feature-Überblick
- User Stories
- Funktionale Anforderungen
- Nicht-funktionale Anforderungen
- Akzeptanzkriterien
- Einschränkungen und Annahmen

**Erstellungsbeispiel**:
```
"Erstelle Anforderungen für ein Benutzerbenachrichtigungssystem, das unterstützt:
- E-Mail-Benachrichtigungen
- In-App-Benachrichtigungen
- Push-Benachrichtigungen
- Benutzerpräferenzen
- Benachrichtigungsverlauf"
```

### Design-Dokument

**Zweck**: Definieren WIE es gebaut wird

**Inhalt**:
- Technische Architektur
- Komponenten-Design
- Datenmodelle
- API-Spezifikationen
- Integrationspunkte
- Implementierungsansatz

**Automatische Generierung**: Nach Anforderungsfreigabe erstellt

### Aufgabendokument

**Zweck**: Definieren der SCHRITTE zum Bauen

**Inhalt**:
- Hierarchische Aufgabenaufschlüsselung
- Abhängigkeiten
- Aufwandsschätzungen
- Implementierungsreihenfolge
- Testanforderungen

**Strukturbeispiel**:
```
1.0 Datenbank-Setup
  1.1 Benachrichtigungstabellen erstellen
  1.2 Indizes einrichten
  1.3 Migrationsskripte erstellen

2.0 Backend-Implementierung
  2.1 Benachrichtigungsdienst erstellen
    2.1.1 E-Mail-Handler
    2.1.2 Push-Handler
  2.2 API-Endpunkte erstellen
  2.3 Authentifizierung hinzufügen

3.0 Frontend-Implementierung
  3.1 Benachrichtigungskomponenten erstellen
  3.2 Mit API integrieren
  3.3 Präferenz-UI hinzufügen
```

## Phase 3: Überprüfung und Freigabe

### Freigabe-Workflow

1. **Dokumenterstellung** - AI generiert Dokument
2. **Überprüfungsanfrage** - Freigabe automatisch angefordert
3. **Benutzerüberprüfung** - Im Dashboard/Extension überprüfen
4. **Entscheidung** - Genehmigen, Änderungen anfordern oder ablehnen
5. **Revision** (falls nötig) - AI aktualisiert basierend auf Feedback
6. **Endgültige Freigabe** - Dokument für Implementierung gesperrt

### Freigabeentscheidungen treffen

#### Wann genehmigen
- Anforderungen sind vollständig und klar
- Design löst das festgelegte Problem
- Aufgaben sind logisch und umfassend
- Keine größeren Bedenken oder Lücken

#### Wann Änderungen anfordern
- Wichtige Details fehlen
- Unklare Spezifikationen
- Besserer Ansatz verfügbar
- Benötigt Ausrichtung an Standards

#### Wann ablehnen
- Grundlegendes Missverständnis
- Völlig falscher Ansatz
- Erfordert komplettes Umdenken

### Effektives Feedback geben

Gutes Feedback:
```
"Der Authentifizierungs-Flow sollte JWT-Tokens statt Sessions verwenden.
Rate Limiting zu API-Endpunkten hinzufügen.
Fehlerbehandlung für Netzwerkausfälle einschließen."
```

Schlechtes Feedback:
```
"Das sieht nicht richtig aus. Repariere es."
```

## Phase 4: Implementierung

### Aufgabenausführungsstrategie

#### Sequenzielle Implementierung
Am besten für abhängige Aufgaben:
```
"Implementiere Aufgabe 1.1 aus user-auth Spec"
"Implementiere jetzt Aufgabe 1.2"
"Fahre mit Aufgabe 1.3 fort"
```

#### Parallele Implementierung
Für unabhängige Aufgaben:
```
"Implementiere alle UI-Aufgaben aus der Dashboard-Spec, während ich am Backend arbeite"
```

#### Abschnittsbasierte Implementierung
Für logische Gruppierungen:
```
"Implementiere alle Datenbankaufgaben aus der payment Spec"
```

### Fortschrittsverfolgung

Implementierung überwachen durch:
- Dashboard-Aufgabenansicht
- Fortschrittsbalken
- Statusindikatoren
- Fertigstellungsprozentsätze

### Blocker behandeln

Wenn blockiert:
1. Blocker dokumentieren
2. Unteraufgabe für Lösung erstellen
3. Zu parallelen Aufgaben wechseln wenn möglich
4. Aufgabenstatus auf "blockiert" aktualisieren

## Phase 5: Verifizierung

### Teststrategie

Nach Implementierung:

1. **Unit-Testing**
   ```
   "Erstelle Unit-Tests für den Benachrichtigungsdienst"
   ```

2. **Integrationstests**
   ```
   "Erstelle Integrationstests für die API-Endpunkte"
   ```

3. **End-to-End-Tests**
   ```
   "Erstelle E2E-Tests für den kompletten Benachrichtigungs-Flow"
   ```

### Dokumentationsaktualisierungen

Dokumentation aktuell halten:
```
"Aktualisiere die API-Dokumentation für die neuen Endpunkte"
"Füge Verwendungsbeispiele zum README hinzu"
```

## Dateistruktur und Organisation

### Standard-Projektstruktur

```
ihr-projekt/
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
│       └── [Freigabe-Tracking-Dateien]
├── src/
│   └── [Ihre Implementierung]
└── tests/
    └── [Ihre Tests]
```

### Namenskonventionen

**Spec-Namen**:
- kebab-case verwenden: `user-authentication`
- Beschreibend sein: `payment-processing` nicht `payments`
- Versionen vermeiden: `user-profile` nicht `user-profile-v2`

**Dokumentnamen**:
- Immer: `requirements.md`, `design.md`, `tasks.md`
- Konsistent über alle Specs

## Erweiterte Workflows

### Feature-Iterationen

Für sich entwickelnde Features:

1. Initiale Spec erstellen
2. MVP implementieren
3. Enhancement-Spec erstellen
4. Original-Spec referenzieren
5. Auf bestehender Arbeit aufbauen

Beispiel:
```
"Erstelle eine Enhancement-Spec für user-auth, die hinzufügt:
- Social Login (Google, Facebook)
- Biometrische Authentifizierung
- Verbesserungen der Sitzungsverwaltung"
```

### Refactoring-Workflow

1. **Aktuellen Zustand dokumentieren**
   ```
   "Erstelle eine Spec, die das aktuelle Authentifizierungssystem dokumentiert"
   ```

2. **Verbesserungen entwerfen**
   ```
   "Entwerfe Refactoring zur Verbesserung der Authentifizierungsleistung"
   ```

3. **Migration planen**
   ```
   "Erstelle Migrationsaufgaben für das Refactoring"
   ```

4. **Schrittweise implementieren**
   ```
   "Implementiere Refactoring-Aufgaben mit Rückwärtskompatibilität"
   ```

### Bug-Lösungs-Workflow

1. **Bug-Bericht**
   ```
   "Erstelle Fehlerbericht für Login-Timeout-Problem"
   ```

2. **Untersuchung**
   ```
   "Untersuche Ursache von Bug #45"
   ```

3. **Lösungs-Design**
   ```
   "Entwerfe Fix für das Timeout-Problem"
   ```

4. **Implementierung**
   ```
   "Implementiere den Bug-Fix"
   ```

5. **Verifizierung**
   ```
   "Erstelle Regressionstests für Bug #45"
   ```

## Best Practices

### 1. Spec-Granularität beibehalten

**Gut**: Eine Spec pro Feature
- `user-authentication`
- `payment-processing`
- `notification-system`

**Schlecht**: Zu breite Specs
- `backend-system`
- `all-features`

### 2. Sequenzielle Dokumenterstellung

Immer der Reihenfolge folgen:
1. Anforderungen (was)
2. Design (wie)
3. Aufgaben (Schritte)

Niemals vorauseilen.

### 3. Freigabe vor Implementierung abschließen

- ✅ Anforderungen genehmigen → Design erstellen
- ✅ Design genehmigen → Aufgaben erstellen
- ✅ Aufgaben überprüfen → Implementierung starten
- ❌ Freigabe überspringen → Implementierungsprobleme

### 4. Specs aktuell halten

Wenn sich Anforderungen ändern:
```
"Aktualisiere die Anforderungen für user-auth, um SSO-Unterstützung einzuschließen"
```

### 5. Konsistente Terminologie verwenden

Konsistenz aufrechterhalten über:
- Spec-Namen
- Komponentennamen
- API-Terminologie
- Datenbankbenennung

### 6. Erledigte Specs archivieren

Workspace sauber halten:
```
"Archiviere die erledigte user-auth Spec"
```

## Häufige Muster

### MVP zu vollständigem Feature

1. Mit MVP-Spec beginnen
2. Kernfunktionalität implementieren
3. Enhancement-Specs erstellen
4. Inkrementell bauen
5. Rückwärtskompatibilität aufrechterhalten

### Microservices-Entwicklung

1. Service Steering-Dokument erstellen
2. Service-Grenzen definieren
3. Spec pro Service erstellen
4. Integrationspunkte definieren
5. Services unabhängig implementieren

### API-First-Entwicklung

1. Zuerst API-Spec erstellen
2. Verträge entwerfen
3. Dokumentation generieren
4. Endpunkte implementieren
5. Client-SDKs erstellen

## Fehlerbehebung bei Workflow-Problemen

### Specs werden zu groß

**Lösung**: In kleinere Specs aufteilen
```
"Teile die E-Commerce-Spec auf in:
- product-catalog
- shopping-cart
- checkout-process
- order-management"
```

### Unklare Anforderungen

**Lösung**: Klärung anfordern
```
"Die Anforderungen brauchen mehr Details zu:
- Benutzerrollen und Berechtigungen
- Fehlerbehandlungsszenarien
- Leistungsanforderungen"
```

### Design passt nicht zu Anforderungen

**Lösung**: Revision anfordern
```
"Das Design behandelt nicht die Multi-Tenancy-Anforderung.
Bitte überarbeiten, um Tenant-Isolation einzuschließen."
```

## Integration mit Entwicklungsprozess

### Git-Workflow

1. Feature-Branch pro Spec erstellen
2. Nach jedem Aufgabenabschluss committen
3. Spec in Commit-Nachrichten referenzieren
4. PR wenn Spec vollständig ist

### CI/CD-Integration

- Tests für erledigte Aufgaben ausführen
- Gegen Anforderungen validieren
- Erledigte Features deployen
- Gegen Erfolgsmetriken überwachen

### Team-Zusammenarbeit

- Dashboard-URL teilen
- Specs Teammitgliedern zuweisen
- Specs gegenseitig überprüfen
- Durch Freigaben koordinieren

## Verwandte Dokumentation

- [Benutzerhandbuch](USER-GUIDE.de.md) - Allgemeine Nutzungsanweisungen
- [Prompting-Leitfaden](PROMPTING-GUIDE.de.md) - Beispiel-Prompts und Muster
- [Tools-Referenz](TOOLS-REFERENCE.de.md) - Vollständige Tool-Dokumentation
- [Oberflächen-Leitfaden](INTERFACES.de.md) - Dashboard- und Extension-Details
