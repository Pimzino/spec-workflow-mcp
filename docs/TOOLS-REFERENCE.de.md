# Tools-Referenz

Vollständige Dokumentation für alle MCP-Tools, die von Spec Workflow MCP bereitgestellt werden.

## Überblick

Spec Workflow MCP bietet spezialisierte Tools für strukturierte Softwareentwicklung. Diese Tools sind AI-Assistenten über das Model Context Protocol zugänglich.

## Tool-Kategorien

1. **Workflow-Guides** - Dokumentation und Anleitungen
2. **Spec-Verwaltung** - Erstellen und Verwalten von Spezifikationen
3. **Kontext-Tools** - Projektinformationen abrufen
4. **Steering-Tools** - Projektebene-Leitlinien
5. **Freigabe-Tools** - Dokumentenfreigabe-Workflow

## Workflow-Guide-Tools

### spec-workflow-guide

**Zweck**: Bietet umfassende Anleitung für den spec-getriebenen Workflow-Prozess.

**Parameter**: Keine

**Rückgabe**: Markdown-Guide, der den vollständigen Workflow erklärt

**Verwendungsbeispiel**:
```
"Zeige mir den Spec Workflow-Guide"
```

**Antwort enthält**:
- Workflow-Überblick
- Schritt-für-Schritt-Prozess
- Best Practices
- Beispiel-Prompts

### steering-guide

**Zweck**: Anleitung zum Erstellen von Projekt-Steering-Dokumenten.

**Parameter**: Keine

**Rückgabe**: Markdown-Guide für Steering-Dokumenterstellung

**Verwendungsbeispiel**:
```
"Zeige mir, wie man Steering-Dokumente erstellt"
```

**Antwort enthält**:
- Steering-Dokumenttypen
- Erstellungsprozess
- Inhaltsrichtlinien
- Beispiele

## Spec-Verwaltungs-Tools

### create-spec-doc

**Zweck**: Erstellt oder aktualisiert Spezifikationsdokumente (Anforderungen, Design, Aufgaben).

**Parameter**:

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| specName | string | Ja | Name der Spec (kebab-case) |
| docType | string | Ja | Typ: "requirements", "design" oder "tasks" |
| content | string | Ja | Markdown-Inhalt des Dokuments |
| revision | boolean | Nein | Ob dies eine Revision ist (Standard: false) |

**Verwendungsbeispiel**:
```typescript
{
  specName: "user-authentication",
  docType: "requirements",
  content: "# User Authentication Anforderungen\n\n## Überblick\n...",
  revision: false
}
```

**Rückgabe**:
```typescript
{
  success: true,
  message: "Anforderungsdokument erfolgreich erstellt",
  path: ".spec-workflow/specs/user-authentication/requirements.md",
  requestedApproval: true
}
```

**Hinweise**:
- Erstellt Spec-Verzeichnis falls es nicht existiert
- Fordert automatisch Freigabe für neue Dokumente an
- Validiert Markdown-Format
- Bewahrt bestehende Dokumente beim Erstellen neuer Typen

### spec-list

**Zweck**: Listet alle Spezifikationen mit ihrem aktuellen Status auf.

**Parameter**: Keine

**Rückgabe**: Array von Spec-Zusammenfassungen

**Antwortstruktur**:
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

**Verwendungsbeispiel**:
```
"Liste alle meine Specs auf"
```

### spec-status

**Zweck**: Erhält detaillierte Statusinformationen für eine bestimmte Spec.

**Parameter**:

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| specName | string | Ja | Name der zu prüfenden Spec |

**Rückgabe**: Detaillierter Spec-Status

**Antwortstruktur**:
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

**Verwendungsbeispiel**:
```
"Zeige mir den Status der user-authentication Spec"
```

### manage-tasks

**Zweck**: Umfassende Aufgabenverwaltung einschließlich Updates, Statusänderungen und Fortschrittsverfolgung.

**Parameter**:

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| specName | string | Ja | Name der Spec |
| action | string | Ja | Aktion: "update", "complete", "list", "progress" |
| taskId | string | Manchmal | Aufgaben-ID (erforderlich für update/complete) |
| status | string | Nein | Neuer Status: "pending", "in-progress", "completed" |
| notes | string | Nein | Zusätzliche Notizen für die Aufgabe |

**Aktionen**:

1. **Aufgabenstatus aktualisieren**:
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "Implementierung gestartet"
}
```

2. **Aufgabe abschließen**:
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **Aufgaben auflisten**:
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **Fortschritt erhalten**:
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**Rückgabe**: Aufgabeninformationen oder Update-Bestätigung

## Kontext-Tools

### get-template-context

**Zweck**: Ruft Markdown-Templates für alle Dokumenttypen ab.

**Parameter**: Keine

**Rückgabe**: Objekt mit allen Templates

**Antwortstruktur**:
```typescript
{
  requirements: "# Anforderungs-Template\n\n## Überblick\n...",
  design: "# Design-Template\n\n## Architektur\n...",
  tasks: "# Aufgaben-Template\n\n## Implementierungsaufgaben\n...",
  product: "# Product Steering-Template\n...",
  tech: "# Technical Steering-Template\n...",
  structure: "# Structure Steering-Template\n..."
}
```

**Verwendungsbeispiel**:
```
"Hole alle Dokumenttemplates"
```

### get-steering-context

**Zweck**: Ruft Projekt-Steering-Dokumente und Leitlinien ab.

**Parameter**:

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| docType | string | Nein | Spezifisches Dok: "product", "tech", "structure" oder "all" |

**Rückgabe**: Steering-Dokumentinhalt

**Verwendungsbeispiel**:
```typescript
{
  docType: "tech"  // Gibt nur Technical Steering zurück
}
```

**Antwortstruktur**:
```typescript
{
  product: "# Product Steering\n\n## Vision\n...",
  tech: "# Technical Steering\n\n## Architektur\n...",
  structure: "# Structure Steering\n\n## Organisation\n..."
}
```

### get-spec-context

**Zweck**: Ruft vollständigen Kontext für eine bestimmte Spec ab.

**Parameter**:

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| specName | string | Ja | Name der Spec |
| includeContent | boolean | Nein | Dokumentinhalt einschließen (Standard: true) |

**Rückgabe**: Vollständiger Spec-Kontext

**Antwortstruktur**:
```typescript
{
  name: "user-authentication",
  exists: true,
  documents: {
    requirements: {
      exists: true,
      content: "# Anforderungen\n\n...",
      approved: true
    },
    design: {
      exists: true,
      content: "# Design\n\n...",
      approved: false
    },
    tasks: {
      exists: true,
      content: "# Aufgaben\n\n...",
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

**Verwendungsbeispiel**:
```
"Hole vollständigen Kontext für user-authentication Spec"
```

## Steering-Dokument-Tools

### create-steering-doc

**Zweck**: Erstellt Projekt-Steering-Dokumente (product, tech, structure).

**Parameter**:

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| docType | string | Ja | Typ: "product", "tech" oder "structure" |
| content | string | Ja | Markdown-Inhalt des Dokuments |

**Verwendungsbeispiel**:
```typescript
{
  docType: "product",
  content: "# Product Steering\n\n## Vision\nBaue das Beste..."
}
```

**Rückgabe**:
```typescript
{
  success: true,
  message: "Product Steering-Dokument erstellt",
  path: ".spec-workflow/steering/product.md"
}
```

**Hinweise**:
- Erstellt Steering-Verzeichnis falls nötig
- Überschreibt bestehende Steering-Dokumente
- Keine Freigabe für Steering-Dokumente erforderlich
- Sollte vor Specs erstellt werden

## Freigabesystem-Tools

### request-approval

**Zweck**: Fordert Benutzerfreigabe für ein Dokument an.

**Parameter**:

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| specName | string | Ja | Name der Spec |
| docType | string | Ja | Freizugebender Dokumenttyp |
| documentId | string | Ja | Eindeutige ID für Tracking |
| content | string | Ja | Dokumentinhalt zur Überprüfung |

**Verwendungsbeispiel**:
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# Anforderungen\n\n..."
}
```

**Rückgabe**:
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "Freigabe angefordert. Dashboard zur Überprüfung öffnen."
}
```

### get-approval-status

**Zweck**: Prüft den Freigabestatus eines Dokuments.

**Parameter**:

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| specName | string | Ja | Name der Spec |
| documentId | string | Ja | Zu prüfende Dokument-ID |

**Rückgabe**:
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "Bitte fügen Sie mehr Details zur Fehlerbehandlung hinzu",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "user"
}
```

**Verwendungsbeispiel**:
```
"Prüfe Freigabestatus für user-auth Anforderungen"
```

### delete-approval

**Zweck**: Entfernt abgeschlossene Freigabeanfragen, um die Freigabe-Queue zu bereinigen.

**Parameter**:

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| specName | string | Ja | Name der Spec |
| documentId | string | Ja | Zu entfernende Dokument-ID |

**Rückgabe**:
```typescript
{
  success: true,
  message: "Freigabedatensatz gelöscht"
}
```

**Verwendungsbeispiel**:
```
"Räume abgeschlossene Freigaben für user-auth auf"
```

## Tool-Integrationsmuster

### Sequenzieller Workflow

Tools sind für sequenzielle Arbeit konzipiert:

1. `steering-guide` → Über Steering lernen
2. `create-steering-doc` → Steering-Dokumente erstellen
3. `spec-workflow-guide` → Workflow lernen
4. `create-spec-doc` → Anforderungen erstellen
5. `request-approval` → Überprüfung anfordern
6. `get-approval-status` → Status prüfen
7. `create-spec-doc` → Design erstellen (nach Freigabe)
8. `manage-tasks` → Implementierung verfolgen

### Parallele Operationen

Einige Tools können gleichzeitig verwendet werden:

- `spec-list` + `spec-status` → Übersicht und Details erhalten
- `get-spec-context` + `get-steering-context` → Vollständiger Projektkontext
- Mehrere `create-spec-doc` → Mehrere Specs erstellen

### Fehlerbehandlung

Alle Tools geben konsistente Fehlerstrukturen zurück:

```typescript
{
  success: false,
  error: "Spec nicht gefunden",
  details: "Keine Spec namens 'invalid-spec' existiert",
  suggestion: "Verwende spec-list, um verfügbare Specs zu sehen"
}
```

## Best Practices

### Tool-Auswahl

1. **Informationsbeschaffung**:
   - `spec-list` für Überblick verwenden
   - `spec-status` für spezifische Spec verwenden
   - `get-spec-context` für Implementierung verwenden

2. **Dokumenterstellung**:
   - Immer zuerst Anforderungen erstellen
   - Auf Freigabe vor Design warten
   - Aufgaben nach Design-Freigabe erstellen

3. **Aufgabenverwaltung**:
   - Status beim Starten von Aufgaben aktualisieren
   - Sofort nach Abschluss als erledigt markieren
   - Notizen für wichtigen Kontext verwenden

## Verwandte Dokumentation

- [Benutzerhandbuch](USER-GUIDE.de.md) - Tools effektiv nutzen
- [Workflow-Prozess](WORKFLOW.de.md) - Tool-Verwendung im Workflow
- [Prompting-Leitfaden](PROMPTING-GUIDE.de.md) - Beispiel-Tool-Verwendung
- [Entwicklungsanleitung](DEVELOPMENT.de.md) - Neue Tools hinzufügen
