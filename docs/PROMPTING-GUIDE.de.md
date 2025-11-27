# Prompting-Leitfaden

Ein umfassender Leitfaden mit Beispielen und Best Practices für die Interaktion mit Spec Workflow MCP durch AI-Assistenten.

## Schnellreferenz

### Wesentliche Befehle

```
"Erstelle eine Spec für [Feature]"
"Liste alle meine Specs auf"
"Zeige Status von [spec-name]"
"Implementiere Aufgabe [nummer] aus [spec]"
"Erstelle Steering-Dokumente"
```

## Spezifikationen erstellen

### Grundlegende Spec-Erstellung

#### Einfache Anfrage
```
"Erstelle eine Spec für Benutzerauthentifizierung"
```

Die AI erstellt:
- Anforderungsdokument
- Design-Dokument (nach Freigabe)
- Aufgabenaufschlüsselung (nach Design-Freigabe)

#### Detaillierte Anfrage
```
"Erstelle eine Spec namens payment-processing mit:
- Kreditkartenzahlungen über Stripe
- PayPal-Integration
- Rückerstattungsbearbeitung
- Webhook-Verarbeitung für Zahlungsereignisse
- PCI-Compliance-Überlegungen"
```

#### Aus bestehender Dokumentation
```
"Erstelle eine Spec aus dem PRD in @product-requirements.md"
```

```
"Erstelle eine Spec basierend auf dem Design-Dokument in @figma-export.md"
```

### Erweiterte Spec-Erstellung

#### Mit technischen Einschränkungen
```
"Erstelle eine Spec für Echtzeit-Benachrichtigungen, die:
- WebSockets für Live-Updates verwendet
- Auf Polling für ältere Browser zurückgreift
- Bis zu 10.000 gleichzeitige Verbindungen verarbeitet
- Nachrichtenreihenfolge beibehält
- Offline-Queue-Unterstützung einschließt"
```

#### Mit Akzeptanzkriterien
```
"Erstelle eine Spec für Suchfunktion mit diesen Akzeptanzkriterien:
- Ergebnisse erscheinen innerhalb von 200ms
- Unterstützt Fuzzy-Matching
- Beinhaltet Filter für Datum, Kategorie und Autor
- Zeigt Relevanz-Bewertung
- Behandelt Tippfehler und Synonyme"
```

## Spezifikationen verwalten

### Auflisten und Status

#### Übersicht erhalten
```
"Liste alle meine Specs auf"
"Zeige mir alle Specs und ihren Fortschritt"
"Welche Specs warten auf Freigabe?"
"Welche Specs sind derzeit in Bearbeitung?"
```

#### Spezifischer Status
```
"Zeige den Status der user-auth Spec"
"Wie ist der Fortschritt bei payment-processing?"
"Zeige mir, was noch zu tun ist in der notification Spec"
"Welche Aufgaben sind in user-profile erledigt?"
```

## Implementierungs-Prompts

### Einzelne Aufgaben

#### Grundlegende Implementierung
```
"Implementiere Aufgabe 1.2 aus user-auth"
"Vervollständige Aufgabe 2.1.3 in der payment Spec"
"Arbeite an der nächsten ausstehenden Aufgabe in notifications"
```

#### Mit Kontext
```
"Implementiere Aufgabe 1.2 aus user-auth mit TypeScript und Express"
"Vervollständige die Datenbankmigrations-Aufgabe mit Prisma"
"Implementiere die API-Endpunkt-Aufgabe nach REST-Konventionen"
```

### Batch-Implementierung

#### Nach Abschnitt
```
"Implementiere alle Datenbankaufgaben aus user-auth"
"Vervollständige alle Frontend-Aufgaben in der dashboard Spec"
"Arbeite alle API-Aufgaben für payments durch"
```

#### Nach Priorität
```
"Implementiere zuerst alle kritischen Aufgaben"
"Vervollständige die MVP-Aufgaben aus user-profile"
"Konzentriere dich auf Aufgaben, die für die Demo benötigt werden"
```

## Steering-Dokumente

### Steering erstellen

#### Vollständiges Set
```
"Erstelle Steering-Dokumente für mein E-Commerce-Projekt"
"Richte Steering für eine SaaS-Anwendung ein"
"Erstelle Projektleitlinien für eine mobile App"
```

#### Einzelne Dokumente
```
"Erstelle ein Product Steering-Dokument mit Fokus auf Benutzererfahrung"
"Erstelle Technical Steering für eine Microservices-Architektur"
"Erstelle Structure Steering für ein Monorepo-Setup"
```

## Freigabe-Workflows

### Feedback anfordern

#### Mit spezifischen Bedenken
```
"Fordere Freigabe für user-auth Anforderungen an - prüfe besonders den Sicherheitsabschnitt"
"Bitte um Überprüfung des payment Design - Fokus auf Fehlerbehandlung"
"Fordere Feedback zur Aufgabenaufschlüsselung an - ist sie zu detailliert?"
```

#### Revisionsanfragen
```
"Die Anforderungen brauchen mehr Details zu:
- Fehlerbehandlungsszenarien
- Leistungsanforderungen
- Sicherheitsüberlegungen
Bitte überarbeiten und erneut einreichen"
```

## Mittlere Implementierungsänderungen

### Wenn sich Specs während der Entwicklung ändern

Anforderungen und Designs entwickeln sich oft während der Implementierung. Wenn dies passiert, müssen Sie tasks.md mit der aktuellen Spec in Einklang bringen und gleichzeitig abgeschlossene Arbeit bewahren.

### Die Task Refresh-Funktion verwenden

Die AI hat Zugriff auf umfassende Task-Refresh-Anweisungen durch den refresh-tasks Prompt. Informieren Sie die AI einfach über Ihre Änderungen:

#### Grundlegende Task-Aktualisierung
```
"Die Anforderungen wurden aktualisiert. Bitte aktualisiere tasks.md, um mit den aktuellen requirements.md und design.md übereinzustimmen."
```

#### Detaillierte Task-Aktualisierung mit Kontext
```
"Ich habe die Spec mit folgenden Änderungen aktualisiert:
- Reporting-Modul entfernt
- Datenbank von MongoDB auf PostgreSQL geändert
- Social Login-Feature hinzugefügt

Bitte aktualisiere tasks.md nach dem Task Refresh-Prozess:
1. Behalte alle erledigten und laufenden Aufgaben
2. Füge Migrations-Aufgaben für die Datenbankänderung hinzu
3. Entferne ausstehende Aufgaben für das Reporting-Modul
4. Füge neue Aufgaben für Social Login hinzu"
```

#### Architekturänderung, die Migration erfordert
```
"Wir wechseln von REST API zu GraphQL. Mehrere REST-Endpunkte sind bereits implementiert. Bitte aktualisiere tasks.md mit:
1. Alle abgeschlossene REST-Arbeit erhalten
2. Migrations-Aufgaben zum Wrappen von REST-Logik in GraphQL-Resolver
3. Neue GraphQL-Implementierungs-Aufgaben
4. Aufräum-Aufgaben zum Entfernen von REST nach GraphQL-Verifizierung"
```

### Erwartetes AI-Verhalten

Wenn Sie eine Task-Aktualisierung anfordern, wird die AI:

1. **Aktuellen Zustand analysieren**
   - requirements.md und design.md für aktuelle Spec lesen
   - Erledigte, laufende und ausstehende Aufgaben identifizieren
   - Bestimmen, welche Features hinzugefügt, entfernt oder geändert wurden

2. **Abgeschlossene Arbeit bewahren**
   - Alle [x] erledigten Aufgaben unverändert halten
   - Alle [-] laufenden Aufgaben unverändert halten
   - Notizen hinzufügen, wenn erledigte Arbeit für entfernte Features ist

3. **Architekturänderungen behandeln**
   - Migrations-Aufgaben nach abgeschlossener Arbeit hinzufügen, die Aktualisierung benötigt
   - Übergangs-Aufgaben für progressive Migration erstellen
   - Verifizierungs-Aufgaben vor Entfernung alter Implementierung einschließen

4. **Ausstehende Aufgaben aktualisieren**
   - Ausstehende Aufgaben für gelöschte Features entfernen
   - Ausstehende Aufgaben für geänderte Anforderungen aktualisieren
   - Neue Aufgaben für neue Features hinzufügen

5. **Aufgabenstruktur beibehalten**
   - Sequenzielle Nummerierung beibehalten
   - Aufgabenformat bewahren
   - Anforderungsreferenzen einschließen
   - Abhängigkeitsreihenfolge beibehalten

### Beispielszenarien

#### Feature-Entfernung
```
"Wir haben beschlossen, das Reporting-Modul aus der Spec zu entfernen. Aktualisiere tasks.md entsprechend."
```

Erwartetes AI-Verhalten:
- Alle erledigten Reporting-Aufgaben mit ihrem [x] Status behalten
- Alle laufenden Reporting-Aufgaben mit ihrem [-] Status behalten
- Nur ausstehende [ ] Reporting-Aufgaben entfernen
- Notiz hinzufügen: "_Hinweis: Reporting-Feature aus Spec entfernt, aber erledigte Arbeit bewahrt_"

#### Architekturänderung mit abgeschlossener Arbeit
```
"Wir wechseln von MongoDB zu PostgreSQL. Aktualisiere die ausstehenden Datenbankaufgaben. Beachte, dass wir bereits MongoDB-Schemas und Verbindungslogik implementiert haben."
```

Erwartetes AI-Verhalten:
- Alle abgeschlossenen MongoDB-Aufgaben genau so bewahren
- Alle laufenden MongoDB-Aufgaben genau so bewahren
- Neue Migrations-Aufgaben unmittelbar nach abgeschlossener MongoDB-Arbeit hinzufügen:
  - MongoDB-Schemas zu PostgreSQL-Tabellen migrieren
  - MongoDB-Verbindungslogik durch PostgreSQL-Client ersetzen
  - Datenbankabfragen von MongoDB- zu PostgreSQL-Syntax aktualisieren
  - Vorhandene MongoDB-Daten zu PostgreSQL migrieren
  - Umgebungskonfiguration für PostgreSQL aktualisieren
  - MongoDB-Abhängigkeiten nach Migrations-Verifizierung entfernen
- Verbleibende ausstehende Datenbankaufgaben für PostgreSQL aktualisieren
- Aufgabennummerierungssequenz beibehalten

## Erweiterte Muster

### Multi-Spec-Workflows

#### Verwandte Specs
```
"Erstelle eine Spec für admin-dashboard, die integriert mit:
- user-management Spec
- analytics Spec
- reporting Spec"
```

#### Spec-Abhängigkeiten
```
"Erstelle eine Spec für notifications, die abhängt von:
- user-auth ist vollständig
- message-queue ist implementiert
- email-service ist verfügbar"
```

### Inkrementelle Entwicklung

#### MVP zuerst
```
"Erstelle eine MVP-Spec für user-profiles mit nur:
- Grundlegende Profilerstellung
- Anzeigename und Avatar
- Öffentliche Profilansicht
(Wir fügen später Social-Features hinzu)"
```

## Tipps für effektives Prompting

### Spezifisch sein
❌ **Vage**: "Erstelle eine Login-Spec"
✅ **Spezifisch**: "Erstelle eine Spec für E-Mail/Passwort-Login mit 2FA, 'Angemeldet bleiben' und Passwort-Reset"

### Kontext bereitstellen
❌ **Ohne Kontext**: "Implementiere die Aufgabe"
✅ **Mit Kontext**: "Implementiere Aufgabe 1.2 mit unserer bestehenden Express-Middleware und PostgreSQL-Datenbank"

### Klare Erwartungen setzen
❌ **Unklar**: "Mach es besser"
✅ **Klar**: "Verbessere das Design, um 10x aktuellen Traffic mit Antwortzeiten unter 200ms zu verarbeiten"

### Inkrementelle Anfragen verwenden
❌ **Zu viel**: "Erstelle 5 Specs und implementiere alles"
✅ **Inkrementell**: "Erstelle zuerst die user-auth Spec, dann überprüfen wir, bevor wir zur nächsten übergehen"

### Auf bestehende Arbeit verweisen
❌ **Von Grund auf neu**: "Erstelle ein neues Zahlungssystem"
✅ **Darauf aufbauen**: "Erweitere unsere payment Spec um Abonnement-Abrechnung"

## Häufige Muster-Bibliothek

### CRUD-Operationen
```
"Erstelle eine Spec für CRUD-Operationen auf Produkte einschließlich:
- Erstellen mit Validierung
- Lesen mit Paginierung und Filterung
- Aktualisieren mit optimistischem Sperren
- Soft Delete mit Wiederherstellungsoption"
```

### Authentifizierung & Autorisierung
```
"Erstelle eine Auth-Spec mit:
- JWT-basierte Authentifizierung
- Rollenbasierte Zugriffskontrolle
- API-Schlüsselverwaltung
- Sitzungsbehandlung
- Refresh-Token-Rotation"
```

### Echtzeit-Features
```
"Erstelle eine Spec für Echtzeit-Chat:
- WebSocket-Verbindungen
- Nachrichtenpersistenz
- Tipp-Indikatoren
- Lesebestätigungen
- Offline-Nachrichten-Queue"
```

## Fehlerbehebungs-Prompts

### Wenn Dinge schief gehen
```
"Warum wird diese Spec nicht angezeigt?"
"Debugge, warum die Aufgabe nicht abgeschlossen wird"
"Was blockiert die Freigabe?"
"Hilf mir, diesen Fehler zu verstehen"
```

### Aus der Klemme kommen
```
"Was sollte ich als nächstes tun?"
"Zeige mir, was den Fortschritt blockiert"
"An welchen Aufgaben kann ich arbeiten während ich warte?"
"Wie löse ich diese Abhängigkeit?"
```

## Verwandte Dokumentation

- [Benutzerhandbuch](USER-GUIDE.de.md) - Allgemeine Nutzungsanweisungen
- [Workflow-Prozess](WORKFLOW.de.md) - Workflow verstehen
- [Tools-Referenz](TOOLS-REFERENCE.de.md) - Vollständige Tool-Dokumentation
- [Fehlerbehebung](TROUBLESHOOTING.de.md) - Häufige Probleme lösen
