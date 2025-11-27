# Guide de développement

Ce guide couvre la configuration d'un environnement de développement, la compilation du projet, la contribution de code et la compréhension de l'architecture de Spec Workflow MCP.

## Prérequis

### Logiciels requis

- **Node.js** 18.0 ou supérieur
- **npm** 9.0 ou supérieur
- **Git** pour le contrôle de version
- Connaissance de **TypeScript** utile

### Outils recommandés

- **VSCode** avec extensions TypeScript
- **Chrome/Edge DevTools** pour le débogage du tableau de bord
- **Postman/Insomnia** pour les tests API

## Configuration de l'environnement de développement

### 1. Cloner le dépôt

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. Installer les dépendances

```bash
npm install
```

Cela installe :
- SDK MCP
- TypeScript et outils de compilation
- Express pour le serveur de tableau de bord
- Bibliothèques WebSocket
- Frameworks de test

### 3. Compiler le projet

```bash
npm run build
```

Cela compile les fichiers TypeScript en JavaScript dans le répertoire `dist/`.

## Commandes de développement

### Commandes principales

| Commande | Description |
|---------|-------------|
| `npm run dev` | Démarrer en mode développement avec rechargement automatique |
| `npm run build` | Compiler le bundle de production |
| `npm start` | Exécuter le serveur de production |
| `npm test` | Exécuter la suite de tests |
| `npm run clean` | Supprimer les artefacts de compilation |
| `npm run lint` | Exécuter le linter de code |
| `npm run format` | Formater le code avec Prettier |

### Mode développement

```bash
npm run dev
```

Fonctionnalités :
- Recompilation automatique lors des modifications de fichiers
- Rechargement à chaud pour le tableau de bord
- Messages d'erreur détaillés
- Source maps pour le débogage

### Compilation pour la production

```bash
npm run clean && npm run build
```

Optimisations :
- JavaScript minifié
- Taille de bundle optimisée
- Gestion d'erreur de production
- Améliorations de performance

## Structure du projet

```
spec-workflow-mcp/
├── src/                    # Code source
│   ├── index.ts           # Point d'entrée du serveur MCP
│   ├── server.ts          # Serveur de tableau de bord
│   ├── tools/             # Implémentations des outils MCP
│   ├── prompts/           # Modèles de prompts
│   ├── utils/             # Fonctions utilitaires
│   └── types/             # Définitions de types TypeScript
├── dist/                   # JavaScript compilé
├── dashboard/             # Fichiers du tableau de bord web
│   ├── index.html         # UI du tableau de bord
│   ├── styles.css         # Styles du tableau de bord
│   └── script.js          # JavaScript du tableau de bord
├── vscode-extension/      # Extension VSCode
│   ├── src/               # Source de l'extension
│   └── package.json       # Manifeste de l'extension
├── tests/                 # Fichiers de test
├── docs/                  # Documentation
└── package.json           # Configuration du projet
```

## Vue d'ensemble de l'architecture

### Architecture du serveur MCP

```
Client (IA) ↔ Protocole MCP ↔ Serveur ↔ Système de fichiers
                              ↓
                          Tableau de bord
```

### Composants clés

#### 1. Serveur MCP (`src/index.ts`)
- Gère la communication du protocole MCP
- Traite les requêtes d'outils
- Gère l'état du projet
- Opérations sur le système de fichiers

#### 2. Serveur de tableau de bord (`src/server.ts`)
- Sert le tableau de bord web
- Connexions WebSocket
- Mises à jour en temps réel
- Points de terminaison API HTTP

#### 3. Outils (`src/tools/`)
Chaque outil est un module séparé :
- Validation des entrées
- Logique métier
- Opérations sur les fichiers
- Formatage des réponses

#### 4. Prompts (`src/prompts/`)
Chaînes de modèles pour :
- Génération de documents
- Guidance du flux de travail
- Messages d'erreur
- Instructions utilisateur

## Implémentation de nouvelles fonctionnalités

### Ajout d'un nouvel outil

1. **Créer le fichier d'outil** dans `src/tools/` :

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: 'Description de ce que fait l\'outil',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Description du paramètre' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // Implémentation de l'outil
    const { param1, param2 = 0 } = params;

    // Logique métier ici

    return {
      success: true,
      data: 'Réponse de l\'outil'
    };
  }
};
```

2. **Enregistrer dans l'index** (`src/tools/index.ts`) :

```typescript
export { myNewTool } from './my-new-tool';
```

3. **Ajouter au serveur** (`src/index.ts`) :

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### Ajout de fonctionnalités au tableau de bord

1. **Mettre à jour le HTML** (`dashboard/index.html`) :

```html
<div class="new-feature">
  <h3>Nouvelle fonctionnalité</h3>
  <button id="new-action">Action</button>
</div>
```

2. **Ajouter du JavaScript** (`dashboard/script.js`) :

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // Logique de la fonctionnalité
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **Gérer dans le serveur** (`src/server.ts`) :

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // Gérer la nouvelle action
  }
});
```

## Tests

### Exécution des tests

```bash
# Exécuter tous les tests
npm test

# Exécuter un fichier de test spécifique
npm test -- src/tools/my-tool.test.ts

# Exécuter avec couverture
npm run test:coverage

# Mode surveillance
npm run test:watch
```

### Écriture de tests

Créez des fichiers de test à côté des fichiers source :

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('devrait traiter l\'entrée correctement', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('expected');
  });

  it('devrait gérer les erreurs', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Tests d'intégration

Testez des flux de travail complets :

```typescript
// tests/integration/workflow.test.ts
describe('Flux de travail complet', () => {
  it('devrait créer une spécification du début à la fin', async () => {
    // Créer les exigences
    // Approuver les exigences
    // Créer la conception
    // Approuver la conception
    // Créer les tâches
    // Vérifier la structure
  });
});
```

## Débogage

### Déboguer le serveur MCP

1. **Ajouter une sortie de débogage** :

```typescript
console.error('[DEBUG]', 'Outil appelé :', toolName, params);
```

2. **Utiliser le débogueur VSCode** :

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug MCP Server",
  "program": "${workspaceFolder}/dist/index.js",
  "args": ["/chemin/vers/projet/test"],
  "console": "integratedTerminal"
}
```

### Déboguer le tableau de bord

1. **DevTools du navigateur** :
   - Ouvrir le tableau de bord dans le navigateur
   - Appuyer sur F12 pour DevTools
   - Vérifier la Console pour les erreurs
   - Surveiller l'onglet Network pour WebSocket

2. **Ajouter de la journalisation** :

```javascript
console.log('Message WebSocket :', message);
console.log('Mise à jour d\'état :', newState);
```

## Style de code et normes

### Directives TypeScript

- Utiliser le mode strict
- Définir des interfaces pour les structures de données
- Éviter le type `any`
- Utiliser async/await plutôt que des callbacks

### Organisation des fichiers

- Un composant par fichier
- Regrouper les fonctionnalités liées
- Conventions de nommage claires
- Commentaires complets

### Conventions de nommage

- **Fichiers** : kebab-case (`my-tool.ts`)
- **Classes** : PascalCase (`SpecManager`)
- **Fonctions** : camelCase (`createSpec`)
- **Constantes** : UPPER_SNAKE (`MAX_RETRIES`)

## Contribution

### Processus de contribution

1. **Forker le dépôt**
2. **Créer une branche de fonctionnalité** :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. **Effectuer les modifications**
4. **Écrire des tests**
5. **Exécuter les tests et le linter** :
   ```bash
   npm test
   npm run lint
   ```
6. **Valider les modifications** :
   ```bash
   git commit -m "feat: ajouter nouvelle fonctionnalité"
   ```
7. **Pousser la branche** :
   ```bash
   git push origin feature/ma-fonctionnalite
   ```
8. **Créer une Pull Request**

### Format des messages de commit

Suivre les commits conventionnels :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage
- `refactor:` Restructuration du code
- `test:` Tests
- `chore:` Maintenance

Exemples :
```
feat: ajouter le flux de travail de révision d'approbation
fix: résoudre le problème de reconnexion WebSocket du tableau de bord
docs: mettre à jour le guide de configuration
```

### Directives pour les Pull Requests

- Description claire
- Référencer les problèmes liés
- Inclure des captures d'écran pour les modifications UI
- S'assurer que tous les tests passent
- Mettre à jour la documentation

## Publication

### Package NPM

1. **Mettre à jour la version** :
   ```bash
   npm version patch|minor|major
   ```

2. **Compiler le package** :
   ```bash
   npm run build
   ```

3. **Publier** :
   ```bash
   npm publish
   ```

### Extension VSCode

1. **Mettre à jour la version de l'extension** dans `vscode-extension/package.json`

2. **Compiler l'extension** :
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **Publier sur le marketplace** :
   ```bash
   vsce publish
   ```

## Optimisation des performances

### Performance du serveur

- Utiliser le cache pour les lectures de fichiers
- Implémenter le debouncing pour les surveillants de fichiers
- Optimiser le batching des messages WebSocket
- Chargement paresseux des documents volumineux

### Performance du tableau de bord

- Minimiser les mises à jour du DOM
- Utiliser le défilement virtuel pour les longues listes
- Implémenter le rendu progressif
- Optimiser la reconnexion WebSocket

## Considérations de sécurité

### Validation des entrées

Toujours valider les entrées des outils :

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Nom de spécification invalide');
}

// Assainir les chemins de fichiers
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Chemin invalide');
}
```

### Sécurité du système de fichiers

- Restreindre les opérations au répertoire du projet
- Valider tous les chemins de fichiers
- Utiliser des opérations de fichiers sûres
- Implémenter des vérifications de permissions

## Dépannage des problèmes de développement

### Erreurs de compilation courantes

| Erreur | Solution |
|-------|----------|
| Erreurs TypeScript | Exécuter `npm run build` pour voir les erreurs détaillées |
| Module introuvable | Vérifier les imports et exécuter `npm install` |
| Port déjà utilisé | Changer le port ou tuer le processus existant |
| Échec de connexion WebSocket | Vérifier que le serveur est en cours d'exécution et que le port est correct |

### Conseils de développement

1. **Utiliser le mode strict TypeScript** pour une meilleure sécurité des types
2. **Activer les source maps** pour un débogage plus facile
3. **Utiliser nodemon** pour le redémarrage automatique pendant le développement
4. **Tester les opérations de fichiers** dans un répertoire isolé
5. **Surveiller les performances** avec Chrome DevTools

## Ressources

- [Documentation du SDK MCP](https://github.com/anthropics/mcp-sdk)
- [Manuel TypeScript](https://www.typescriptlang.org/docs/)
- [Meilleures pratiques Node.js](https://github.com/goldbergyoni/nodebestpractices)
- [API Extension VSCode](https://code.visualstudio.com/api)

## Documentation associée

- [Guide de configuration](CONFIGURATION.fr.md) - Configuration du serveur
- [Guide utilisateur](USER-GUIDE.fr.md) - Utilisation du serveur
- [Référence des outils](TOOLS-REFERENCE.fr.md) - Documentation des outils
- [Dépannage](TROUBLESHOOTING.fr.md) - Problèmes courants
