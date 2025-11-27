# Guide de Dépannage

Ce guide vous aide à résoudre les problèmes courants avec Spec Workflow MCP.

## Diagnostics Rapides

### Vérifier l'Installation
```bash
# Vérifier que le package npm est accessible
npx -y @pimzino/spec-workflow-mcp@latest --help

# Vérifier si on exécute dans le bon répertoire
pwd  # ou 'cd' sur Windows

# Vérifier que le répertoire .spec-workflow existe
ls -la .spec-workflow  # ou 'dir .spec-workflow' sur Windows
```

### Vérifier les Services
```bash
# Tester le serveur MCP
npx -y @pimzino/spec-workflow-mcp@latest /chemin/vers/projet

# Tester le tableau de bord
npx -y @pimzino/spec-workflow-mcp@latest /chemin/vers/projet --dashboard

# Vérifier la disponibilité du port
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## Problèmes Courants et Solutions

## Problèmes d'Installation

### Package NPM Non Trouvé

**Erreur** : `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**Solutions** :
1. Vérifier la connexion internet
2. Vider le cache npm :
   ```bash
   npm cache clean --force
   ```
3. Essayer sans tag de version :
   ```bash
   npx @pimzino/spec-workflow-mcp /chemin/vers/projet
   ```
4. Installer d'abord globalement :
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /chemin/vers/projet
   ```

### Permission Refusée

**Erreur** : `EACCES: permission denied`

**Solutions** :
1. **macOS/Linux** : Utiliser les permissions npm appropriées :
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows** : Exécuter en tant qu'Administrateur ou corriger les permissions npm :
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. Utiliser npx avec le flag -y :
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## Problèmes de Serveur MCP

### Serveur ne Démarre Pas

**Erreur** : `Failed to start MCP server`

**Solutions** :
1. Vérifier la version de Node.js :
   ```bash
   node --version  # Devrait être 18.0 ou supérieur
   ```
2. Vérifier que le chemin du projet existe :
   ```bash
   ls -la /chemin/vers/projet
   ```
3. Vérifier les processus en conflit :
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. Essayer avec un chemin absolu :
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP ne se Connecte Pas à l'Outil IA

**Erreur** : `MCP server unreachable` ou `Connection refused`

**Solutions** :

1. **Claude Desktop** : Vérifier le fichier de configuration :
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/chemin/absolu/vers/projet"]
       }
     }
   }
   ```

2. **Claude Code CLI** : Vérifier la configuration :
   ```bash
   claude mcp list  # Vérifier si spec-workflow est listé
   claude mcp remove spec-workflow  # Supprimer si existe
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /chemin/vers/projet
   ```

3. **Problèmes de Chemin** : Assurer que le chemin est absolu et existe :
   - ❌ `~/projet` ou `./projet`
   - ✅ `/Users/nom/projet` ou `C:\Users\nom\projet`

### Outils Non Disponibles

**Erreur** : `Tool 'spec-workflow' not found`

**Solutions** :
1. Redémarrer complètement votre outil IA
2. Vérifier que le serveur MCP est en cours d'exécution (chercher le processus)
3. Vérifier que la configuration est correctement sauvegardée
4. Essayer de mentionner l'outil explicitement : "Utiliser spec-workflow pour créer une spec"

## Problèmes de Tableau de Bord

### Tableau de Bord ne Charge Pas

**Erreur** : `Cannot connect to dashboard` ou page blanche

**Solutions** :
1. Vérifier que le tableau de bord est démarré :
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /chemin --dashboard
   ```
2. Vérifier l'URL dans le navigateur (noter le port) :
   ```
   http://localhost:3000  # Ou quel que soit le port affiché
   ```
3. Essayer un navigateur différent ou en mode incognito
4. Vérifier la console du navigateur pour les erreurs (F12 → Console)
5. Désactiver temporairement les extensions du navigateur

### Port Déjà Utilisé

**Erreur** : `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions** :
1. Utiliser un port différent :
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /chemin --dashboard --port 3456
   ```
2. Trouver et tuer le processus utilisant le port :
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. Utiliser un port éphémère (omettre le flag --port) :
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /chemin --dashboard
   ```

### Connexion WebSocket Échouée

**Erreur** : `WebSocket connection lost` ou mises à jour en temps réel ne fonctionnant pas

**Solutions** :
1. Actualiser la page du navigateur
2. Vérifier si le pare-feu bloque WebSocket
3. Vérifier que le tableau de bord et le serveur MCP s'exécutent depuis le même projet
4. Vérifier la console du navigateur pour des erreurs spécifiques
5. Essayer un réseau différent (si sur réseau d'entreprise)

### Tableau de Bord ne se Met Pas à Jour

**Symptômes** : Les changements ne sont pas reflétés en temps réel

**Solutions** :
1. Actualisation forcée du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
2. Vider le cache du navigateur
3. Vérifier le statut de connexion WebSocket (devrait afficher vert)
4. Vérifier que les watchers du système de fichiers fonctionnent :
   ```bash
   # Créer un fichier test dans le projet
   touch .spec-workflow/test.md
   # Devrait déclencher une mise à jour dans le tableau de bord
   ```

## Problèmes du Système d'Approbation

### Approbations ne s'Affichent Pas

**Erreur** : Aucune notification d'approbation dans le tableau de bord

**Solutions** :
1. Assurer que le tableau de bord s'exécute avec le serveur MCP :
   ```bash
   # Soit utiliser le démarrage automatique
   npx -y @pimzino/spec-workflow-mcp@latest /chemin --AutoStartDashboard

   # Ou exécuter les deux séparément
   # Terminal 1:
   npx -y @pimzino/spec-workflow-mcp@latest /chemin
   # Terminal 2:
   npx -y @pimzino/spec-workflow-mcp@latest /chemin --dashboard
   ```
2. Vérifier que le répertoire d'approbation existe :
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. Déclencher manuellement une demande d'approbation via l'IA

### Impossible d'Approuver les Documents

**Erreur** : Les boutons d'approbation ne fonctionnent pas

**Solutions** :
1. Vérifier la console du navigateur pour les erreurs JavaScript
2. Vérifier que vous êtes sur la bonne page de spec
3. Assurer que le document a un statut d'approbation en attente
4. Essayer d'utiliser l'extension VSCode à la place (si disponible)

## Problèmes de Système de Fichiers

### Fichiers de Spec Non Créés

**Erreur** : Les documents de spec n'apparaissent pas dans le système de fichiers

**Solutions** :
1. Vérifier les permissions d'écriture :
   ```bash
   touch .spec-workflow/test.txt
   ```
2. Vérifier le bon répertoire de travail :
   ```bash
   pwd  # Devrait être la racine de votre projet
   ```
3. Chercher les fichiers cachés :
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. Vérifier si l'antivirus bloque la création de fichiers

### Permission Refusée sur les Fichiers

**Erreur** : `EACCES` ou `Permission denied` lors de la création de specs

**Solutions** :
1. Corriger les permissions du répertoire :
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. Vérifier la propriété des fichiers :
   ```bash
   ls -la .spec-workflow
   # Devrait appartenir à votre utilisateur
   ```
3. Exécuter depuis un répertoire que vous possédez (pas les répertoires système)

## Problèmes d'Extension VSCode

### Extension ne Charge Pas

**Erreur** : L'icône Spec Workflow n'apparaît pas dans la Barre d'Activité

**Solutions** :
1. Vérifier que l'extension est installée :
   - Ouvrir Extensions (Ctrl+Shift+X)
   - Rechercher "Spec Workflow MCP"
   - Vérifier si installée et activée
2. Recharger la fenêtre VSCode :
   - Ctrl+Shift+P → "Developer: Reload Window"
3. Vérifier la sortie de l'extension :
   - View → Output → Sélectionner "Spec Workflow" dans le menu déroulant
4. Assurer que le projet a le répertoire `.spec-workflow`

### Commandes de l'Extension ne Fonctionnent Pas

**Erreur** : Les commandes échouent ou affichent des erreurs

**Solutions** :
1. Ouvrir le dossier du projet qui contient `.spec-workflow`
2. Vérifier que VSCode utilise le bon espace de travail
3. Voir les logs de l'extension pour des erreurs spécifiques
4. Essayer de réinstaller l'extension :
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## Problèmes de Configuration

### Fichier de Config ne se Charge Pas

**Erreur** : Les paramètres dans config.toml ne sont pas appliqués

**Solutions** :
1. Vérifier la syntaxe TOML :
   ```bash
   # Installer le validateur TOML
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. Vérifier l'emplacement du fichier :
   - Par défaut : `.spec-workflow/config.toml`
   - Personnalisé : Utiliser le flag `--config`
3. Assurer qu'il n'y a pas d'erreurs de syntaxe :
   ```toml
   # Correct
   port = 3000
   lang = "en"

   # Incorrect
   port: 3000  # Devrait utiliser = et non :
   lang = en   # Devrait avoir des guillemets
   ```

### Arguments de Ligne de Commande ne Fonctionnent Pas

**Erreur** : Les flags comme `--port` sont ignorés

**Solutions** :
1. Vérifier l'ordre des arguments :
   ```bash
   # Correct
   npx -y @pimzino/spec-workflow-mcp@latest /chemin --dashboard --port 3000

   # Incorrect
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /chemin --port 3000
   ```
2. Assurer que les valeurs de flag sont valides :
   - Port : 1024-65535
   - Langue : en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. Utiliser `--help` pour voir toutes les options

## Problèmes de Performance

### Temps de Réponse Lents

**Symptômes** : Tableau de bord ou outils répondant lentement

**Solutions** :
1. Vérifier les ressources système :
   ```bash
   # Utilisation CPU et mémoire
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. Réduire les watchers de fichiers dans les grands projets :
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. Vider les anciens enregistrements d'approbation :
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. Utiliser des noms de spec spécifiques au lieu de tout lister

### Utilisation Élevée de Mémoire

**Solutions** :
1. Redémarrer les services périodiquement
2. Limiter le taux de rafraîchissement du tableau de bord :
   ```json
   // Paramètres VSCode
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. Archiver les specs complétées
4. Vider le cache du navigateur pour le tableau de bord

## Problèmes de Réseau

### Derrière un Proxy d'Entreprise

**Solutions** :
1. Configurer le proxy npm :
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. Utiliser l'installation locale :
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /chemin
   ```

### Pare-feu Bloquant les Connexions

**Solutions** :
1. Autoriser Node.js à travers le pare-feu
2. Utiliser localhost au lieu de 0.0.0.0
3. Configurer des règles de port spécifiques
4. Essayer différentes plages de ports

## Problèmes Spécifiques à la Plateforme

### Windows

#### Problèmes de Format de Chemin
**Erreur** : `Invalid path` ou chemin non trouvé

**Solutions** :
```bash
# Utiliser des slashes avant
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/nom/projet

# Ou des backslashes échappés
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\nom\\projet"
```

#### Politique d'Exécution PowerShell
**Erreur** : `cannot be loaded because running scripts is disabled`

**Solutions** :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Blocage Gatekeeper
**Erreur** : `cannot be opened because the developer cannot be verified`

**Solutions** :
1. Préférences Système → Sécurité et Confidentialité → Autoriser
2. Ou supprimer la quarantaine :
   ```bash
   xattr -d com.apple.quarantine /chemin/vers/node_modules
   ```

### Linux

#### Dépendances Manquantes
**Erreur** : `shared library not found`

**Solutions** :
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## Obtenir de l'Aide

### Informations de Diagnostic

Lors du signalement de problèmes, inclure :

1. **Informations Système** :
   ```bash
   node --version
   npm --version
   uname -a  # ou 'ver' sur Windows
   ```

2. **Messages d'Erreur** :
   - Texte d'erreur complet
   - Capture d'écran si problème visuel
   - Logs de la console du navigateur

3. **Configuration** :
   - Configuration du client MCP
   - Contenu de config.toml
   - Ligne de commande utilisée

4. **Étapes pour Reproduire** :
   - Commandes exactes exécutées
   - Comportement attendu
   - Comportement actuel

### Canaux de Support

1. **GitHub Issues** : [Créer une issue](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **Documentation** : Vérifier les autres guides dans `/docs`
3. **Communauté** : Discussions et Q&A

### Mode Debug

Activer le logging verbeux :

```bash
# Définir la variable d'environnement
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# Exécuter avec sortie de debug
npx -y @pimzino/spec-workflow-mcp@latest /chemin --debug
```

## Conseils de Prévention

### Meilleures Pratiques

1. **Toujours utiliser des chemins absolus** dans les configurations
2. **Maintenir Node.js à jour** (v18+ requis)
3. **Exécuter depuis la racine du projet**
4. **Utiliser --help** pour vérifier les options
5. **Tester dans un environnement propre** lorsque des problèmes surviennent
6. **Vérifier les logs** avant de supposer un échec
7. **Sauvegarder le répertoire .spec-workflow** régulièrement

### Maintenance Régulière

1. Vider les anciennes approbations mensuellement
2. Archiver les specs complétées
3. Mettre à jour les packages npm régulièrement
4. Surveiller l'espace disque pour les logs
5. Redémarrer les services après les mises à jour

## Documentation Associée

- [Guide de Configuration](CONFIGURATION.md) - Options de configuration détaillées
- [Guide Utilisateur](USER-GUIDE.md) - Instructions d'utilisation générales
- [Guide de Développement](DEVELOPMENT.md) - Pour contribuer des corrections
- [Guide des Interfaces](INTERFACES.md) - Détails du tableau de bord et de l'extension
