# Guide de configuration

Ce guide couvre toutes les options de configuration pour Spec Workflow MCP.

## Options de ligne de commande

### Utilisation de base

```bash
npx -y @pimzino/spec-workflow-mcp@latest [chemin-projet] [options]
```

### Options disponibles

| Option | Description | Exemple |
|--------|-------------|---------|
| `--help` | Afficher les informations d'utilisation complètes | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | Exécuter en mode tableau de bord uniquement (port par défaut : 5000) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--port <numéro>` | Spécifier un port personnalisé pour le tableau de bord (1024-65535) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080` |

### Notes importantes

- **Instance unique de tableau de bord** : Un seul tableau de bord s'exécute à la fois. Tous les serveurs MCP se connectent au même tableau de bord.
- **Port par défaut** : Le tableau de bord utilise le port 5000 par défaut. Utilisez `--port` uniquement si le port 5000 n'est pas disponible.
- **Tableau de bord séparé** : Exécutez toujours le tableau de bord séparément des serveurs MCP.

## Exemples d'utilisation

### Flux de travail typique

1. **Démarrer le tableau de bord** (faites ceci en premier, une seule fois) :
```bash
# Utilise le port par défaut 5000
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

2. **Démarrer les serveurs MCP** (un par projet, dans des terminaux séparés) :
```bash
# Projet 1
npx -y @pimzino/spec-workflow-mcp@latest ~/projets/app1

# Projet 2
npx -y @pimzino/spec-workflow-mcp@latest ~/projets/app2

# Projet 3
npx -y @pimzino/spec-workflow-mcp@latest ~/projets/app3
```

Tous les projets apparaîtront dans le tableau de bord à http://localhost:5000

### Tableau de bord avec port personnalisé

Utilisez un port personnalisé uniquement si le port 5000 n'est pas disponible :

```bash
# Démarrer le tableau de bord sur le port 8080
npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
```

## Variables d'environnement

### SPEC_WORKFLOW_HOME

Remplace le répertoire d'état global par défaut (`~/.spec-workflow-mcp`). Ceci est utile pour les environnements isolés où `$HOME` est en lecture seule.

| Variable | Défaut | Description |
|----------|---------|-------------|
| `SPEC_WORKFLOW_HOME` | `~/.spec-workflow-mcp` | Répertoire pour les fichiers d'état globaux |

**Fichiers stockés dans ce répertoire :**
- `activeProjects.json` - Registre des projets
- `activeSession.json` - Informations de session du tableau de bord
- `settings.json` - Paramètres globaux
- `job-execution-history.json` - Historique d'exécution des tâches
- `migration.log` - Suivi de la migration du journal d'implémentation

**Exemples d'utilisation :**

```bash
# Chemin absolu
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace

# Chemin relatif (résolu par rapport au répertoire de travail actuel)
SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest .

# Pour le mode tableau de bord
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

**Environnements isolés (par exemple, Codex CLI) :**

Lors de l'exécution dans des environnements isolés comme Codex CLI avec `sandbox_mode=workspace-write`, définissez `SPEC_WORKFLOW_HOME` sur un emplacement accessible en écriture dans votre espace de travail :

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

## Gestion de session du tableau de bord

Le tableau de bord stocke ses informations de session dans `~/.spec-workflow-mcp/activeSession.json` (ou `$SPEC_WORKFLOW_HOME/activeSession.json` si défini). Ce fichier :
- Impose une instance unique de tableau de bord
- Permet aux serveurs MCP de découvrir le tableau de bord en cours d'exécution
- Se nettoie automatiquement lorsque le tableau de bord s'arrête

### Application d'instance unique

Un seul tableau de bord peut s'exécuter à la fois. Si vous essayez de démarrer un deuxième tableau de bord :

```
Le tableau de bord est déjà en cours d'exécution à : http://localhost:5000

Vous pouvez :
  1. Utiliser le tableau de bord existant à : http://localhost:5000
  2. L'arrêter d'abord (Ctrl+C ou kill PID), puis en démarrer un nouveau

Remarque : Une seule instance de tableau de bord est nécessaire pour tous vos projets.
```

## Gestion des ports

**Port par défaut** : 5000
**Port personnalisé** : Utilisez `--port <numéro>` uniquement si le port 5000 n'est pas disponible

### Conflits de ports

Si le port 5000 est déjà utilisé par un autre service :

```bash
Échec du démarrage du tableau de bord : Le port 5000 est déjà utilisé.

Il peut s'agir d'un autre service utilisant le port 5000.
Pour utiliser un port différent :
  spec-workflow-mcp --dashboard --port 8080
```

## Fichier de configuration (Obsolète)

### Emplacement par défaut

Le serveur recherche la configuration à : `<répertoire-projet>/.spec-workflow/config.toml`

### Format de fichier

La configuration utilise le format TOML. Voici un exemple complet :

```toml
# Répertoire du projet (par défaut le répertoire actuel)
projectDir = "/chemin/vers/votre/projet"

# Port du tableau de bord (1024-65535)
port = 3456

# Exécuter en mode tableau de bord uniquement
dashboardOnly = false

# Langue de l'interface
# Options : en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "fr"

# Notifications sonores (extension VSCode uniquement)
[notifications]
enabled = true
volume = 0.5

# Paramètres avancés
[advanced]
# Tentatives de reconnexion WebSocket
maxReconnectAttempts = 10

# Paramètres du surveillant de fichiers
[watcher]
enabled = true
debounceMs = 300
```

### Options de configuration

#### Paramètres de base

| Option | Type | Défaut | Description |
|--------|------|---------|-------------|
| `projectDir` | string | Répertoire actuel | Chemin du répertoire du projet |
| `port` | number | Éphémère | Port du tableau de bord (1024-65535) |
| `dashboardOnly` | boolean | false | Exécuter le tableau de bord sans serveur MCP |
| `lang` | string | "en" | Langue de l'interface |

> **Remarque** : L'option `autoStartDashboard` a été supprimée dans la v2.0.0. Le tableau de bord utilise désormais un mode multi-projet unifié accessible via le flag `--dashboard`.

#### Options de langue

- `en` - English
- `ja` - Japanese (日本語)
- `zh` - Chinese (中文)
- `es` - Spanish (Español)
- `pt` - Portuguese (Português)
- `de` - German (Deutsch)
- `fr` - French (Français)
- `ru` - Russian (Русский)
- `it` - Italian (Italiano)
- `ko` - Korean (한국어)
- `ar` - Arabic (العربية)

### Créer une configuration personnalisée

1. Copiez l'exemple de configuration :
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. Modifiez la configuration :
```toml
# Configuration de mon projet
projectDir = "/Users/monnom/projets/monapp"
port = 3000
lang = "fr"
```

3. Utilisez la configuration :
```bash
# Utilise .spec-workflow/config.toml automatiquement
npx -y @pimzino/spec-workflow-mcp@latest

# Ou spécifiez explicitement
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## Priorité de configuration

Les valeurs de configuration sont appliquées dans cet ordre (priorité la plus élevée à la plus basse) :

1. **Arguments de ligne de commande** - Toujours prioritaires
2. **Fichier de configuration personnalisé** - Spécifié avec `--config`
3. **Fichier de configuration par défaut** - `.spec-workflow/config.toml`
4. **Valeurs par défaut intégrées** - Valeurs de repli

### Exemple de priorité

```toml
# config.toml
port = 3000
```

```bash
# L'argument de ligne de commande remplace le fichier de configuration
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# Résultat : port = 4000 (CLI gagne)
```

## Configurations spécifiques à l'environnement

### Configuration de développement

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
lang = "fr"

[advanced]
debugMode = true
verboseLogging = true
```

Utilisation :
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### Configuration de production

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
lang = "fr"

[advanced]
debugMode = false
verboseLogging = false
```

Utilisation :
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## Configuration des ports

### Plage de ports valide

Les ports doivent être entre 1024 et 65535.

### Ports éphémères

Lorsqu'aucun port n'est spécifié, le système sélectionne automatiquement un port éphémère disponible. Ceci est recommandé pour :
- Les environnements de développement
- Plusieurs projets simultanés
- Éviter les conflits de ports

### Ports fixes

Utilisez des ports fixes lorsque vous avez besoin de :
- URL cohérentes pour les signets
- Intégration avec d'autres outils
- Collaboration d'équipe avec des configurations partagées

### Résolution des conflits de ports

Si un port est déjà utilisé :

1. **Vérifiez ce qui utilise le port :**
   - Windows : `netstat -an | findstr :3000`
   - macOS/Linux : `lsof -i :3000`

2. **Solutions :**
   - Utilisez un port différent : `--port 3001`
   - Tuez le processus utilisant le port
   - Omettez `--port` pour utiliser un port éphémère

## Configuration multi-projet

### Configurations séparées

Créez des configurations spécifiques au projet :

```bash
# Projet A
projet-a/
  .spec-workflow/
    config.toml  # port = 3000

# Projet B
projet-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### Configuration partagée

Utilisez une configuration partagée avec des remplacements :

```bash
# Configuration de base partagée
~/configs/spec-workflow-base.toml

# Remplacements spécifiques au projet
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /chemin/vers/projet-a
```

## Configuration de l'extension VSCode

L'extension VSCode a ses propres paramètres :

1. Ouvrez les paramètres VSCode (Cmd/Ctrl + ,)
2. Recherchez "Spec Workflow"
3. Configurez :
   - Préférence de langue
   - Notifications sonores
   - Visibilité des archives
   - Intervalle de rafraîchissement automatique

## Dépannage de la configuration

### La configuration ne se charge pas

1. **Vérifiez l'emplacement du fichier :**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **Validez la syntaxe TOML :**
   ```bash
   # Installez l'outil CLI toml
   npm install -g @iarna/toml

   # Validez
   toml .spec-workflow/config.toml
   ```

3. **Vérifiez les permissions :**
   ```bash
   # Assurez-vous que le fichier est lisible
   chmod 644 .spec-workflow/config.toml
   ```

### Problèmes courants

| Problème | Solution |
|-------|----------|
| Port déjà utilisé | Utilisez un port différent ou omettez pour éphémère |
| Fichier de configuration introuvable | Vérifiez le chemin et utilisez un chemin absolu si nécessaire |
| Syntaxe TOML invalide | Validez avec un linter TOML |
| Les paramètres ne s'appliquent pas | Vérifiez la priorité de configuration |

## Bonnes pratiques

1. **Utilisez le contrôle de version** pour les fichiers de configuration
2. **Documentez les paramètres personnalisés** dans le README de votre projet
3. **Utilisez des ports éphémères** en développement
4. **Gardez les données sensibles** hors des fichiers de configuration
5. **Créez des configurations spécifiques** à l'environnement
6. **Testez les modifications de configuration** avant le déploiement

## Documentation associée

- [Guide utilisateur](USER-GUIDE.fr.md) - Utilisation du serveur configuré
- [Guide des interfaces](INTERFACES.fr.md) - Paramètres du tableau de bord et de l'extension
- [Dépannage](TROUBLESHOOTING.fr.md) - Problèmes de configuration courants
