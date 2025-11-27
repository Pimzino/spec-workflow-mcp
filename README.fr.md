# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://vsmarketplacebadges.dev/version-short/Pimzino.spec-workflow-mcp.svg)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

Un serveur Model Context Protocol (MCP) pour le développement structuré basé sur les spécifications avec tableau de bord en temps réel et extension VSCode.

## ☕ Soutenez ce projet

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📺 Démonstration

### 🔄 Système d'approbation en action
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*Découvrez comment fonctionne le système d'approbation : créez des documents, demandez l'approbation via le tableau de bord, fournissez des commentaires et suivez les révisions.*

### 📊 Tableau de bord et gestion des spécifications
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*Explorez le tableau de bord en temps réel : visualisez les spécifications, suivez la progression, naviguez dans les documents et surveillez votre flux de développement.*

## ✨ Fonctionnalités principales

- **Flux de développement structuré** - Création séquentielle de spécifications (Exigences → Conception → Tâches)
- **Tableau de bord web en temps réel** - Surveillez les spécifications, les tâches et la progression avec des mises à jour en direct
- **Extension VSCode** - Tableau de bord intégré dans la barre latérale pour les utilisateurs de VSCode
- **Flux d'approbation** - Processus d'approbation complet avec révisions
- **Suivi de la progression des tâches** - Barres de progression visuelles et statut détaillé
- **Journaux d'implémentation** - Journaux consultables de toutes les implémentations de tâches avec statistiques de code
- **Support multilingue** - Disponible en 11 langues

## 🌍 Langues prises en charge

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 Démarrage rapide

### Étape 1 : Ajoutez à votre outil IA

Ajoutez à votre configuration MCP (voir la configuration spécifique au client ci-dessous) :

```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/vers/votre/projet"]
    }
  }
}
```

### Étape 2 : Choisissez votre interface

**Option A : Tableau de bord web** (Requis pour les utilisateurs CLI)
Démarrez le tableau de bord (s'exécute sur le port 5000 par défaut) :
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

Le tableau de bord sera accessible à : http://localhost:5000

> **Remarque :** Une seule instance du tableau de bord est nécessaire. Tous vos projets se connecteront au même tableau de bord.

**Option B : Extension VSCode** (Recommandée pour les utilisateurs de VSCode)

Installez l'[Extension Spec Workflow MCP](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp) depuis le marketplace VSCode.

## 📝 Comment utiliser

Mentionnez simplement spec-workflow dans votre conversation :

- **"Créer une spécification pour l'authentification utilisateur"** - Crée un flux de spécification complet
- **"Lister mes spécifications"** - Affiche toutes les spécifications et leur statut
- **"Exécuter la tâche 1.2 dans la spécification user-auth"** - Exécute une tâche spécifique

[Voir plus d'exemples →](docs/PROMPTING-GUIDE.fr.md)

## 🔧 Configuration du client MCP

<details>
<summary><strong>Augment Code</strong></summary>

Configurez dans vos paramètres Augment :
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/vers/votre/projet"]
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Code CLI</strong></summary>

Ajoutez à votre configuration MCP :
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /chemin/vers/votre/projet
```

**Notes importantes :**
- Le flag `-y` contourne les invites npm pour une installation plus fluide
- Le séparateur `--` garantit que le chemin est transmis au script spec-workflow, pas à npx
- Remplacez `/chemin/vers/votre/projet` par le chemin réel de votre répertoire de projet

**Alternative pour Windows (si la commande ci-dessus ne fonctionne pas) :**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /chemin/vers/votre/projet"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Ajoutez à `claude_desktop_config.json` :
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/vers/votre/projet"]
    }
  }
}
```

> **Important :** Exécutez le tableau de bord séparément avec `--dashboard` avant de démarrer le serveur MCP.

</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

Ajoutez à votre configuration du serveur MCP :
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/vers/votre/projet"]
    }
  }
}
```
</details>

<details>
<summary><strong>Continue IDE Extension</strong></summary>

Ajoutez à votre configuration Continue :
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/vers/votre/projet"]
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor IDE</strong></summary>

Ajoutez à vos paramètres Cursor (`settings.json`) :
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/vers/votre/projet"]
    }
  }
}
```
</details>

<details>
<summary><strong>OpenCode</strong></summary>

Ajoutez à votre fichier de configuration `opencode.json` :
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "spec-workflow": {
      "type": "local",
      "command": ["npx", "-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/vers/votre/projet"],
      "enabled": true
    }
  }
}
```
</details>

<details>
<summary><strong>Windsurf</strong></summary>

Ajoutez à votre fichier de configuration `~/.codeium/windsurf/mcp_config.json` :
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/vers/votre/projet"]
    }
  }
}
```
</details>

<details>
<summary><strong>Codex</strong></summary>

Ajoutez à votre fichier de configuration `~/.codex/config.toml` :
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/vers/votre/projet"]
```
</details>

## 🐳 Déploiement Docker

Exécutez le tableau de bord dans un conteneur Docker pour un déploiement isolé :

```bash
# Utilisation de Docker Compose (recommandé)
cd containers
docker-compose up --build

# Ou utilisation de Docker CLI
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

Le tableau de bord sera disponible à : http://localhost:5000

[Voir le guide de configuration Docker →](containers/README.md)

## 🔒 Environnements isolés

Pour les environnements isolés (par exemple, Codex CLI avec `sandbox_mode=workspace-write`) où `$HOME` est en lecture seule, utilisez la variable d'environnement `SPEC_WORKFLOW_HOME` pour rediriger les fichiers d'état globaux vers un emplacement accessible en écriture :

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

[Voir le guide de configuration →](docs/CONFIGURATION.fr.md#environment-variables)

## 📚 Documentation

- [Guide de configuration](docs/CONFIGURATION.fr.md) - Options de ligne de commande, fichiers de configuration
- [Guide utilisateur](docs/USER-GUIDE.fr.md) - Exemples d'utilisation complets
- [Processus de flux de travail](docs/WORKFLOW.fr.md) - Flux de développement et bonnes pratiques
- [Guide des interfaces](docs/INTERFACES.fr.md) - Détails du tableau de bord et de l'extension VSCode
- [Guide de prompting](docs/PROMPTING-GUIDE.fr.md) - Exemples avancés de prompting
- [Référence des outils](docs/TOOLS-REFERENCE.fr.md) - Documentation complète des outils
- [Développement](docs/DEVELOPMENT.fr.md) - Configuration de contribution et de développement
- [Dépannage](docs/TROUBLESHOOTING.fr.md) - Problèmes courants et solutions

## 📁 Structure du projet

```
votre-projet/
  .spec-workflow/
    approvals/
    archive/
    specs/
    steering/
    templates/
    user-templates/
    config.example.toml
```

## 🛠️ Développement

```bash
# Installer les dépendances
npm install

# Compiler le projet
npm run build

# Exécuter en mode développement
npm run dev
```

[Voir le guide de développement →](docs/DEVELOPMENT.fr.md)

## 📄 Licence

GPL-3.0

## ⭐ Historique des étoiles

<a href="https://www.star-history.com/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>
