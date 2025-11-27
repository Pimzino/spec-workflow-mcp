# Guide des interfaces

Ce guide couvre les deux interfaces principales de Spec Workflow MCP : le tableau de bord web et l'extension VSCode.

## Vue d'ensemble

Spec Workflow MCP propose deux interfaces :

1. **Tableau de bord web** - Interface basée sur navigateur pour les utilisateurs CLI
2. **Extension VSCode** - Expérience IDE intégrée pour les utilisateurs VSCode

Les deux interfaces offrent les mêmes fonctionnalités de base avec des optimisations spécifiques à la plateforme.

## Tableau de bord web

### Vue d'ensemble

Le tableau de bord web est une application web en temps réel qui fournit un accès visuel à vos spécifications, tâches et flux d'approbation.

### Démarrage du tableau de bord

#### Tableau de bord autonome
```bash
# Utilise un port éphémère
npx -y @pimzino/spec-workflow-mcp@latest /chemin/vers/projet --dashboard

# Port personnalisé
npx -y @pimzino/spec-workflow-mcp@latest /chemin/vers/projet --dashboard --port 3000
```

#### Avec serveur MCP
```bash
# Démarrage automatique avec MCP
npx -y @pimzino/spec-workflow-mcp@latest /chemin/vers/projet --AutoStartDashboard
```

### Fonctionnalités du tableau de bord

#### Vue principale

Le tableau de bord affiche :

- **Aperçu du projet**
  - Nombre de spécifications actives
  - Total des tâches
  - Pourcentage d'achèvement
  - Activité récente

- **Cartes de spécification**
  - Nom et statut de la spécification
  - Barre de progression
  - Indicateurs de documents
  - Actions rapides

#### Vue des détails de la spécification

Cliquer sur une spécification affiche :

- **Onglets de documents**
  - Exigences
  - Conception
  - Tâches

- **Contenu du document**
  - Markdown rendu
  - Coloration syntaxique
  - Table des matières

- **Actions d'approbation**
  - Bouton d'approbation
  - Demander des modifications
  - Option de rejet
  - Champ de commentaire

#### Gestion des tâches

La vue des tâches fournit :

- **Liste hiérarchique des tâches**
  - Tâches numérotées (1.0, 1.1, 1.1.1)
  - Indicateurs de statut
  - Suivi de la progression

- **Actions sur les tâches**
  - Bouton de copie du prompt
  - Marquer comme terminé
  - Ajouter des notes
  - Voir les dépendances

- **Visualisation de la progression**
  - Barre de progression globale
  - Progression par section
  - Estimations de temps

#### Documents de pilotage

Accéder aux guides du projet :

- **Pilotage produit**
  - Vision et objectifs
  - Personas utilisateur
  - Métriques de succès

- **Pilotage technique**
  - Décisions d'architecture
  - Choix technologiques
  - Objectifs de performance

- **Pilotage de structure**
  - Organisation des fichiers
  - Conventions de nommage
  - Limites des modules

### Navigation du tableau de bord

#### Raccourcis clavier

| Raccourci | Action |
|----------|--------|
| `Alt + S` | Focus sur la liste des spécifications |
| `Alt + T` | Voir les tâches |
| `Alt + R` | Voir les exigences |
| `Alt + D` | Voir la conception |
| `Alt + A` | Ouvrir le dialogue d'approbation |
| `Esc` | Fermer le dialogue |

#### Structure des URL

Liens directs vers des vues spécifiques :
- `/` - Tableau de bord principal
- `/spec/{nom}` - Spécification spécifique
- `/spec/{nom}/requirements` - Document d'exigences
- `/spec/{nom}/design` - Document de conception
- `/spec/{nom}/tasks` - Liste des tâches
- `/steering/{type}` - Documents de pilotage

### Mises à jour en temps réel

Le tableau de bord utilise WebSockets pour les mises à jour en direct :

- **Rafraîchissement automatique**
  - Les nouvelles spécifications apparaissent instantanément
  - Mises à jour du statut des tâches
  - Changements de progression
  - Notifications d'approbation

- **Statut de connexion**
  - Vert : Connecté
  - Jaune : Reconnexion
  - Rouge : Déconnecté

- **Système de notification**
  - Demandes d'approbation
  - Achèvement des tâches
  - Alertes d'erreur
  - Messages de succès

### Personnalisation du tableau de bord

#### Paramètres de thème

Basculer entre les modes clair et sombre :
- Cliquer sur l'icône de thème dans l'en-tête
- Persiste entre les sessions
- Respecte la préférence système

#### Sélection de langue

Changer la langue de l'interface :
1. Cliquer sur l'icône des paramètres
2. Sélectionner la langue dans le menu déroulant
3. L'interface se met à jour immédiatement

Langues prises en charge :
- English (en)
- Japanese (ja)
- Chinese (zh)
- Spanish (es)
- Portuguese (pt)
- German (de)
- French (fr)
- Russian (ru)
- Italian (it)
- Korean (ko)
- Arabic (ar)

#### Options d'affichage

Personnaliser les préférences de vue :
- Cartes de spécification compactes/étendues
- Afficher/masquer les tâches terminées
- Taille de police des documents
- Thème de syntaxe du code

## Extension VSCode

### Installation

Installer depuis le marketplace VSCode :

1. Ouvrir les extensions VSCode (Ctrl+Shift+X)
2. Rechercher "Spec Workflow MCP"
3. Cliquer sur Installer
4. Recharger VSCode

Ou via la ligne de commande :
```bash
code --install-extension Pimzino.spec-workflow-mcp
```

### Fonctionnalités de l'extension

#### Panneau latéral

Accès via l'icône de la barre d'activité :

- **Explorateur de spécifications**
  - Vue arborescente de toutes les spécifications
  - Développer pour voir les documents
  - Indicateurs de statut
  - Actions du menu contextuel

- **Liste des tâches**
  - Vue des tâches filtrable
  - Suivi de la progression
  - Actions rapides
  - Fonctionnalité de recherche

- **Vue des archives**
  - Spécifications terminées
  - Données historiques
  - Option de restauration
  - Opérations en masse

#### Visualiseur de documents

Ouvrir les documents dans l'éditeur :

- **Coloration syntaxique**
  - Rendu Markdown
  - Blocs de code
  - Cases à cocher des tâches
  - Liens et références

- **Actions sur les documents**
  - Modifier sur place
  - Mode aperçu
  - Vue fractionnée
  - Options d'export

#### Approbations intégrées

Dialogues natifs VSCode pour :

- **Demandes d'approbation**
  - Notifications pop-up
  - Commentaires en ligne
  - Approbation/rejet rapide
  - Retour détaillé

- **Flux de révision**
  - Suivi des modifications
  - Fils de commentaires
  - Comparaison de versions
  - Historique d'approbation

#### Actions du menu contextuel

Actions du clic droit dans l'éditeur :

- **Sur les fichiers de spécification**
  - Approuver le document
  - Demander des modifications
  - Voir dans le tableau de bord
  - Copier le chemin de la spécification

- **Sur les éléments de tâche**
  - Marquer comme terminé
  - Copier le prompt
  - Ajouter une sous-tâche
  - Voir les détails

### Paramètres de l'extension

Configurer dans les paramètres VSCode :

```json
{
  "specWorkflow.language": "fr",
  "specWorkflow.notifications.enabled": true,
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.5,
  "specWorkflow.archive.showInExplorer": true,
  "specWorkflow.tasks.autoRefresh": true,
  "specWorkflow.tasks.refreshInterval": 5000,
  "specWorkflow.theme.followVSCode": true
}
```

#### Descriptions des paramètres

| Paramètre | Description | Défaut |
|---------|-------------|---------|
| `language` | Langue de l'interface | "en" |
| `notifications.enabled` | Afficher les notifications | true |
| `notifications.sound` | Jouer les alertes sonores | true |
| `notifications.volume` | Volume sonore (0-1) | 0.5 |
| `archive.showInExplorer` | Afficher les spécifications archivées | true |
| `tasks.autoRefresh` | Rafraîchissement automatique des tâches | true |
| `tasks.refreshInterval` | Intervalle de rafraîchissement (ms) | 5000 |
| `theme.followVSCode` | Correspondre au thème VSCode | true |

### Commandes de l'extension

Disponibles dans la palette de commandes (Ctrl+Shift+P) :

| Commande | Description |
|---------|-------------|
| `Spec Workflow: Create Spec` | Démarrer une nouvelle spécification |
| `Spec Workflow: List Specs` | Afficher toutes les spécifications |
| `Spec Workflow: View Dashboard` | Ouvrir le tableau de bord web |
| `Spec Workflow: Archive Spec` | Déplacer vers les archives |
| `Spec Workflow: Restore Spec` | Restaurer depuis les archives |
| `Spec Workflow: Refresh` | Recharger les données des spécifications |
| `Spec Workflow: Show Steering` | Voir les documents de pilotage |
| `Spec Workflow: Export Spec` | Exporter en markdown |

### Notifications sonores

L'extension inclut des alertes audio pour :

- **Demandes d'approbation** - Carillon doux
- **Achèvement de tâche** - Son de succès
- **Erreurs** - Tonalité d'alerte
- **Mises à jour** - Notification douce

Configurer dans les paramètres :
```json
{
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.3
}
```

## Comparaison des fonctionnalités

| Fonctionnalité | Tableau de bord web | Extension VSCode |
|---------|--------------|------------------|
| Voir les spécifications | ✅ | ✅ |
| Gérer les tâches | ✅ | ✅ |
| Approbations | ✅ | ✅ |
| Mises à jour en temps réel | ✅ | ✅ |
| Système d'archives | ❌ | ✅ |
| Notifications sonores | ❌ | ✅ |
| Intégration éditeur | ❌ | ✅ |
| Menus contextuels | ❌ | ✅ |
| Raccourcis clavier | Limité | Complet |
| Multi-projet | Manuel | Automatique |
| Accès hors ligne | ❌ | ✅ |
| Options d'export | Basique | Avancé |

## Choisir la bonne interface

### Utiliser le tableau de bord web quand :

- Utilisation d'outils IA en ligne de commande
- Travail sur plusieurs IDE
- Besoin d'accès basé sur navigateur
- Partage avec des membres de l'équipe
- Aperçu rapide du projet nécessaire

### Utiliser l'extension VSCode quand :

- L'IDE principal est VSCode
- Besoin d'expérience intégrée
- Besoin de fonctionnalités d'éditeur
- Préférence pour les dialogues natifs
- Besoin de notifications sonores

## Synchronisation des interfaces

Les deux interfaces partagent les mêmes données :

- **Synchronisation en temps réel**
  - Les modifications dans l'une se reflètent dans l'autre
  - État d'approbation partagé
  - Statut de tâche cohérent
  - Suivi de progression unifié

- **Stockage des données**
  - Source unique de vérité
  - Stockage basé sur fichiers
  - Aucune synchronisation nécessaire
  - Mises à jour instantanées

## Accès mobile et tablette

### Tableau de bord web sur mobile

Le tableau de bord est responsive :

- **Vue téléphone**
  - Cartes de spécification empilées
  - Navigation repliable
  - Boutons optimisés pour le tactile
  - Gestes de balayage

- **Vue tablette**
  - Disposition côte à côte
  - Interactions tactiles
  - Espacement optimisé
  - Support paysage

### Limitations sur mobile

- Pas d'extension VSCode
- Raccourcis clavier limités
- Multi-tâche réduit
- Interactions simplifiées

## Fonctionnalités d'accessibilité

### Tableau de bord web

- **Navigation au clavier**
  - Tabulation entre les éléments
  - Entrée pour activer
  - Échap pour annuler
  - Touches fléchées pour les listes

- **Support du lecteur d'écran**
  - Étiquettes ARIA
  - Attributs de rôle
  - Annonces de statut
  - Gestion du focus

- **Accessibilité visuelle**
  - Mode contraste élevé
  - Taille de police ajustable
  - Adapté aux daltoniens
  - Indicateurs de focus

### Extension VSCode

Hérite de l'accessibilité VSCode :
- Support du lecteur d'écran
- Navigation au clavier
- Thèmes à contraste élevé
- Fonctionnalité de zoom

## Optimisation des performances

### Performance du tableau de bord

- **Chargement paresseux**
  - Les documents se chargent à la demande
  - Pagination pour les longues listes
  - Rendu progressif
  - Optimisation des images

- **Stratégie de cache**
  - Mise en cache du navigateur
  - Service worker
  - Support hors ligne (limité)
  - Navigation rapide

### Performance de l'extension

- **Gestion des ressources**
  - Utilisation minimale de la mémoire
  - Surveillance efficace des fichiers
  - Mises à jour avec debouncing
  - Traitement en arrière-plan

## Dépannage des problèmes d'interface

### Problèmes du tableau de bord

| Problème | Solution |
|-------|----------|
| Ne se charge pas | Vérifier que le serveur est en cours d'exécution, vérifier l'URL |
| Pas de mises à jour | Vérifier la connexion WebSocket, rafraîchir la page |
| L'approbation ne fonctionne pas | S'assurer que le tableau de bord et MCP sont connectés |
| Style cassé | Vider le cache du navigateur, vérifier la console |

### Problèmes de l'extension

| Problème | Solution |
|-------|----------|
| N'affiche pas les spécifications | Vérifier que le projet a un répertoire .spec-workflow |
| Les commandes ne fonctionnent pas | Recharger la fenêtre VSCode |
| Pas de notifications | Vérifier les paramètres de l'extension |
| Archive non visible | Activer dans les paramètres |

## Utilisation avancée

### URL personnalisée du tableau de bord

Configurer dans plusieurs terminaux :
```bash
# Terminal 1 : Serveur MCP
npx -y @pimzino/spec-workflow-mcp@latest /projet

# Terminal 2 : Tableau de bord
npx -y @pimzino/spec-workflow-mcp@latest /projet --dashboard --port 3000
```

### Espaces de travail multi-racines de l'extension

L'extension prend en charge les espaces de travail multi-racines VSCode :

1. Ajouter plusieurs dossiers de projet
2. Chacun affiche des spécifications séparées
3. Basculer entre les projets
4. Configurations indépendantes

## Documentation associée

- [Guide de configuration](CONFIGURATION.fr.md) - Configuration et paramétrage
- [Guide utilisateur](USER-GUIDE.fr.md) - Utilisation des interfaces
- [Processus de flux de travail](WORKFLOW.fr.md) - Flux de développement
- [Dépannage](TROUBLESHOOTING.fr.md) - Problèmes courants
