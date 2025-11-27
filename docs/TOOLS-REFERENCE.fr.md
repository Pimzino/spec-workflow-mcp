# Référence des Outils

Documentation complète pour tous les outils MCP fournis par Spec Workflow MCP.

## Vue d'ensemble

Spec Workflow MCP fournit des outils spécialisés pour le développement logiciel structuré. Ces outils sont accessibles aux assistants IA via le Model Context Protocol.

## Catégories d'Outils

1. **Guides de Workflow** - Documentation et orientations
2. **Gestion de Spec** - Créer et gérer les spécifications
3. **Outils de Contexte** - Récupérer les informations du projet
4. **Outils de Direction** - Orientations au niveau du projet
5. **Outils d'Approbation** - Workflow d'approbation des documents

## Outils de Guide de Workflow

### spec-workflow-guide

**Objectif** : Fournit des orientations complètes pour le processus de workflow piloté par les spécifications.

**Paramètres** : Aucun

**Retourne** : Guide markdown expliquant le workflow complet

**Exemple d'Utilisation** :
```
"Montrer le guide du workflow de spec"
```

**La Réponse Contient** :
- Vue d'ensemble du workflow
- Processus étape par étape
- Meilleures pratiques
- Exemples de prompts

### steering-guide

**Objectif** : Guide pour créer des documents de direction de projet.

**Paramètres** : Aucun

**Retourne** : Guide markdown pour la création de documents de direction

**Exemple d'Utilisation** :
```
"Montrer comment créer des documents de direction"
```

**La Réponse Contient** :
- Types de documents de direction
- Processus de création
- Directives de contenu
- Exemples

## Outils de Gestion de Spec

### create-spec-doc

**Objectif** : Crée ou met à jour des documents de spécification (exigences, conception, tâches).

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|----------|-------------|
| specName | string | Oui | Nom de la spec (kebab-case) |
| docType | string | Oui | Type : "requirements", "design", ou "tasks" |
| content | string | Oui | Contenu markdown du document |
| revision | boolean | Non | Si c'est une révision (défaut : false) |

**Exemple d'Utilisation** :
```typescript
{
  specName: "user-authentication",
  docType: "requirements",
  content: "# Exigences d'Authentification Utilisateur\n\n## Vue d'ensemble\n...",
  revision: false
}
```

**Retourne** :
```typescript
{
  success: true,
  message: "Document d'exigences créé avec succès",
  path: ".spec-workflow/specs/user-authentication/requirements.md",
  requestedApproval: true
}
```

**Notes** :
- Crée le répertoire de spec s'il n'existe pas
- Demande automatiquement l'approbation pour les nouveaux documents
- Valide le format markdown
- Préserve les documents existants lors de la création de nouveaux types

### spec-list

**Objectif** : Liste toutes les spécifications avec leur statut actuel.

**Paramètres** : Aucun

**Retourne** : Tableau de résumés de spec

**Structure de Réponse** :
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

**Exemple d'Utilisation** :
```
"Lister toutes mes specs"
```

### spec-status

**Objectif** : Obtient des informations de statut détaillées pour une spec spécifique.

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|----------|-------------|
| specName | string | Oui | Nom de la spec à vérifier |

**Retourne** : Statut détaillé de la spec

**Structure de Réponse** :
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

**Exemple d'Utilisation** :
```
"Montrer le statut de la spec user-authentication"
```

### manage-tasks

**Objectif** : Gestion complète des tâches incluant les mises à jour, changements de statut et suivi de progression.

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|----------|-------------|
| specName | string | Oui | Nom de la spec |
| action | string | Oui | Action : "update", "complete", "list", "progress" |
| taskId | string | Parfois | ID de tâche (requis pour update/complete) |
| status | string | Non | Nouveau statut : "pending", "in-progress", "completed" |
| notes | string | Non | Notes additionnelles pour la tâche |

**Actions** :

1. **Mettre à Jour le Statut de Tâche** :
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "Implémentation démarrée"
}
```

2. **Compléter une Tâche** :
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **Lister les Tâches** :
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **Obtenir la Progression** :
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**Retourne** : Informations de tâche ou confirmation de mise à jour

## Outils de Contexte

### get-template-context

**Objectif** : Récupère les templates markdown pour tous les types de documents.

**Paramètres** : Aucun

**Retourne** : Objet contenant tous les templates

**Structure de Réponse** :
```typescript
{
  requirements: "# Template d'Exigences\n\n## Vue d'ensemble\n...",
  design: "# Template de Conception\n\n## Architecture\n...",
  tasks: "# Template de Tâches\n\n## Tâches d'Implémentation\n...",
  product: "# Template de Direction Produit\n...",
  tech: "# Template de Direction Technique\n...",
  structure: "# Template de Direction Structurelle\n..."
}
```

**Exemple d'Utilisation** :
```
"Obtenir tous les templates de documents"
```

### get-steering-context

**Objectif** : Récupère les documents de direction de projet et les orientations.

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|----------|-------------|
| docType | string | Non | Doc spécifique : "product", "tech", "structure", ou "all" |

**Retourne** : Contenu du document de direction

**Exemple d'Utilisation** :
```typescript
{
  docType: "tech"  // Retourne uniquement la direction technique
}
```

**Structure de Réponse** :
```typescript
{
  product: "# Direction Produit\n\n## Vision\n...",
  tech: "# Direction Technique\n\n## Architecture\n...",
  structure: "# Direction Structurelle\n\n## Organisation\n..."
}
```

### get-spec-context

**Objectif** : Récupère le contexte complet pour une spec spécifique.

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|----------|-------------|
| specName | string | Oui | Nom de la spec |
| includeContent | boolean | Non | Inclure le contenu du document (défaut : true) |

**Retourne** : Contexte complet de la spec

**Structure de Réponse** :
```typescript
{
  name: "user-authentication",
  exists: true,
  documents: {
    requirements: {
      exists: true,
      content: "# Exigences\n\n...",
      approved: true
    },
    design: {
      exists: true,
      content: "# Conception\n\n...",
      approved: false
    },
    tasks: {
      exists: true,
      content: "# Tâches\n\n...",
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

**Exemple d'Utilisation** :
```
"Obtenir le contexte complet pour la spec user-authentication"
```

## Outils de Document de Direction

### create-steering-doc

**Objectif** : Crée des documents de direction de projet (product, tech, structure).

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|----------|-------------|
| docType | string | Oui | Type : "product", "tech", ou "structure" |
| content | string | Oui | Contenu markdown du document |

**Exemple d'Utilisation** :
```typescript
{
  docType: "product",
  content: "# Direction Produit\n\n## Vision\nConstruire le meilleur..."
}
```

**Retourne** :
```typescript
{
  success: true,
  message: "Document de direction produit créé",
  path: ".spec-workflow/steering/product.md"
}
```

**Notes** :
- Crée le répertoire de direction si nécessaire
- Écrase les documents de direction existants
- Aucune approbation requise pour les docs de direction
- Devrait être créé avant les specs

## Outils du Système d'Approbation

### request-approval

**Objectif** : Demande l'approbation utilisateur pour un document.

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|----------|-------------|
| specName | string | Oui | Nom de la spec |
| docType | string | Oui | Type de document à approuver |
| documentId | string | Oui | ID unique pour le suivi |
| content | string | Oui | Contenu du document pour révision |

**Exemple d'Utilisation** :
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# Exigences\n\n..."
}
```

**Retourne** :
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "Approbation demandée. Vérifier le tableau de bord pour réviser."
}
```

### get-approval-status

**Objectif** : Vérifie le statut d'approbation d'un document.

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|----------|-------------|
| specName | string | Oui | Nom de la spec |
| documentId | string | Oui | ID du document à vérifier |

**Retourne** :
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "Veuillez ajouter plus de détails sur la gestion des erreurs",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "user"
}
```

**Exemple d'Utilisation** :
```
"Vérifier le statut d'approbation pour les exigences user-auth"
```

### delete-approval

**Objectif** : Supprime les demandes d'approbation complétées pour nettoyer la file d'approbation.

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|----------|-------------|
| specName | string | Oui | Nom de la spec |
| documentId | string | Oui | ID du document à supprimer |

**Retourne** :
```typescript
{
  success: true,
  message: "Enregistrement d'approbation supprimé"
}
```

**Exemple d'Utilisation** :
```
"Nettoyer les approbations complétées pour user-auth"
```

## Patterns d'Intégration d'Outils

### Workflow Séquentiel

Les outils sont conçus pour fonctionner en séquence :

1. `steering-guide` → Apprendre sur la direction
2. `create-steering-doc` → Créer les documents de direction
3. `spec-workflow-guide` → Apprendre le workflow
4. `create-spec-doc` → Créer les exigences
5. `request-approval` → Demander une révision
6. `get-approval-status` → Vérifier le statut
7. `create-spec-doc` → Créer la conception (après approbation)
8. `manage-tasks` → Suivre l'implémentation

### Opérations Parallèles

Certains outils peuvent être utilisés simultanément :

- `spec-list` + `spec-status` → Obtenir vue d'ensemble et détails
- `get-spec-context` + `get-steering-context` → Contexte complet du projet
- Multiples `create-spec-doc` → Créer plusieurs specs

### Gestion des Erreurs

Tous les outils retournent des structures d'erreur cohérentes :

```typescript
{
  success: false,
  error: "Spec non trouvée",
  details: "Aucune spec nommée 'invalid-spec' n'existe",
  suggestion: "Utiliser spec-list pour voir les specs disponibles"
}
```

## Meilleures Pratiques

### Sélection d'Outils

1. **Collecte d'Informations** :
   - Utiliser `spec-list` pour la vue d'ensemble
   - Utiliser `spec-status` pour une spec spécifique
   - Utiliser `get-spec-context` pour l'implémentation

2. **Création de Document** :
   - Toujours créer les exigences en premier
   - Attendre l'approbation avant la conception
   - Créer les tâches après l'approbation de la conception

3. **Gestion de Tâches** :
   - Mettre à jour le statut au démarrage des tâches
   - Marquer complété immédiatement après avoir fini
   - Utiliser les notes pour le contexte important

### Considérations de Performance

- **Opérations par Lot** : Demander plusieurs specs dans une conversation
- **Mise en Cache** : Les outils mettent en cache les lectures de fichiers pour la performance
- **Chargement Sélectif** : Utiliser `includeContent: false` pour des vérifications de statut plus rapides

### Sécurité

- **Validation de Chemin** : Tous les chemins sont validés et assainis
- **Isolation de Projet** : Les outils n'accèdent qu'au répertoire du projet
- **Assainissement d'Entrée** : Le contenu markdown est assaini
- **Pas d'Exécution** : Les outils n'exécutent jamais de code

## Extension des Outils

### Développement d'Outils Personnalisés

Pour ajouter de nouveaux outils :

1. Créer un module d'outil dans `src/tools/`
2. Définir le schéma de paramètres
3. Implémenter la fonction de gestionnaire
4. Enregistrer avec le serveur MCP
5. Ajouter aux exports

Exemple de structure :
```typescript
export const customTool = {
  name: 'custom-tool',
  description: 'Description',
  parameters: {
    // JSON Schema
  },
  handler: async (params) => {
    // Implémentation
  }
};
```

## Versionnage des Outils

Les outils maintiennent la rétrocompatibilité :

- Les ajouts de paramètres sont optionnels
- Les structures de réponse étendent, ne remplacent pas
- Les fonctionnalités dépréciées affichent des avertissements
- Guides de migration fournis

## Documentation Associée

- [Guide Utilisateur](USER-GUIDE.md) - Utilisation efficace des outils
- [Processus de Workflow](WORKFLOW.md) - Utilisation des outils dans le workflow
- [Guide de Prompting](PROMPTING-GUIDE.md) - Exemples d'utilisation d'outils
- [Guide de Développement](DEVELOPMENT.md) - Ajout de nouveaux outils
