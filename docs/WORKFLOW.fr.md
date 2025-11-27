# Guide du Processus de Workflow

Ce guide explique le processus complet de développement piloté par les spécifications et les meilleures pratiques pour utiliser Spec Workflow MCP.

## Vue d'ensemble

Le workflow piloté par les spécifications suit une approche structurée :

```
Direction → Spécifications → Implémentation → Vérification
```

Chaque phase s'appuie sur la précédente, assurant un développement systématique et bien documenté.

## Phase 1 : Configuration du Projet avec les Documents de Direction

### Pourquoi des Documents de Direction ?

Les documents de direction fournissent des orientations de haut niveau qui maintiennent votre projet aligné et cohérent. Ils agissent comme une étoile polaire pour toutes les décisions de développement.

### Création des Documents de Direction

```
"Créer des documents de direction pour mon projet"
```

Cela génère trois documents clés :

#### 1. Direction Produit (`steering/product.md`)
- Vision et mission du produit
- Utilisateurs cibles et personas
- Fonctionnalités principales et priorités
- Métriques de succès et KPI
- Non-objectifs et contraintes

#### 2. Direction Technique (`steering/tech.md`)
- Décisions d'architecture
- Choix de la pile technologique
- Exigences de performance
- Considérations de sécurité
- Approche de scalabilité

#### 3. Direction Structurelle (`steering/structure.md`)
- Organisation du projet
- Conventions de fichiers et dossiers
- Normes de nommage
- Limites des modules
- Structure de la documentation

### Meilleures Pratiques pour la Direction

1. **Créer tôt** - Configurer la direction avant toute spécification
2. **Maintenir à jour** - Réviser à mesure que le projet évolue
3. **Référencer souvent** - Utiliser pour la prise de décision
4. **Partager largement** - Assurer l'alignement de l'équipe

## Phase 2 : Création de Spécifications

### Le Système à Trois Documents

Chaque spécification consiste en trois documents séquentiels :

```
Exigences → Conception → Tâches
```

### Document d'Exigences

**Objectif** : Définir QUOI doit être construit

**Contenu** :
- Vue d'ensemble de la fonctionnalité
- User stories
- Exigences fonctionnelles
- Exigences non fonctionnelles
- Critères d'acceptation
- Contraintes et hypothèses

**Exemple de Création** :
```
"Créer des exigences pour un système de notification utilisateur qui supporte :
- Notifications par email
- Notifications in-app
- Notifications push
- Préférences utilisateur
- Historique des notifications"
```

### Document de Conception

**Objectif** : Définir COMMENT ce sera construit

**Contenu** :
- Architecture technique
- Conception des composants
- Modèles de données
- Spécifications API
- Points d'intégration
- Approche d'implémentation

**Génération Automatique** : Créé après l'approbation des exigences

### Document de Tâches

**Objectif** : Définir les ÉTAPES pour le construire

**Contenu** :
- Décomposition hiérarchique des tâches
- Dépendances
- Estimations d'effort
- Ordre d'implémentation
- Exigences de test

**Exemple de Structure** :
```
1.0 Configuration de la Base de Données
  1.1 Créer les tables de notification
  1.2 Configurer les index
  1.3 Créer les scripts de migration

2.0 Implémentation Backend
  2.1 Créer le service de notification
    2.1.1 Gestionnaire d'email
    2.1.2 Gestionnaire push
  2.2 Créer les endpoints API
  2.3 Ajouter l'authentification

3.0 Implémentation Frontend
  3.1 Créer les composants de notification
  3.2 Intégrer avec l'API
  3.3 Ajouter l'interface de préférences
```

## Phase 3 : Révision et Approbation

### Workflow d'Approbation

1. **Création du Document** - L'IA génère le document
2. **Demande de Révision** - Approbation demandée automatiquement
3. **Révision Utilisateur** - Réviser dans le tableau de bord/extension
4. **Décision** - Approuver, demander des modifications ou rejeter
5. **Révision** (si nécessaire) - L'IA met à jour selon les commentaires
6. **Approbation Finale** - Document verrouillé pour l'implémentation

### Prendre des Décisions d'Approbation

#### Quand Approuver
- Les exigences sont complètes et claires
- La conception résout le problème énoncé
- Les tâches sont logiques et complètes
- Aucune préoccupation ou lacune majeure

#### Quand Demander des Modifications
- Détails importants manquants
- Spécifications peu claires
- Meilleure approche disponible
- Nécessite un alignement avec les normes

#### Quand Rejeter
- Incompréhension fondamentale
- Approche entièrement incorrecte
- Nécessite une refonte complète

### Fournir des Commentaires Efficaces

Bons commentaires :
```
"Le flux d'authentification devrait utiliser des tokens JWT au lieu de sessions.
Ajouter une limitation de débit aux endpoints API.
Inclure la gestion des erreurs pour les échecs réseau."
```

Mauvais commentaires :
```
"Cela n'a pas l'air correct. Corrigez-le."
```

## Phase 4 : Implémentation

### Stratégie d'Exécution des Tâches

#### Implémentation Séquentielle
Meilleur pour les tâches dépendantes :
```
"Implémenter la tâche 1.1 de la spec user-auth"
"Maintenant implémenter la tâche 1.2"
"Continuer avec la tâche 1.3"
```

#### Implémentation Parallèle
Pour les tâches indépendantes :
```
"Implémenter toutes les tâches UI de la spec dashboard pendant que je travaille sur le backend"
```

#### Implémentation par Section
Pour les groupements logiques :
```
"Implémenter toutes les tâches de base de données de la spec payment"
```

### Suivi de la Progression

Surveiller l'implémentation via :
- Vue des tâches du tableau de bord
- Barres de progression
- Indicateurs de statut
- Pourcentages de complétion

### Gérer les Blocages

Lorsque bloqué :
1. Documenter le blocage
2. Créer une sous-tâche pour la résolution
3. Passer à des tâches parallèles si possible
4. Mettre à jour le statut de la tâche à "bloqué"

## Phase 5 : Vérification

### Stratégie de Test

Après l'implémentation :

1. **Tests Unitaires**
   ```
   "Créer des tests unitaires pour le service de notification"
   ```

2. **Tests d'Intégration**
   ```
   "Créer des tests d'intégration pour les endpoints API"
   ```

3. **Tests End-to-End**
   ```
   "Créer des tests E2E pour le flux complet de notification"
   ```

### Mises à Jour de la Documentation

Maintenir la documentation à jour :
```
"Mettre à jour la documentation API pour les nouveaux endpoints"
"Ajouter des exemples d'utilisation au README"
```

## Structure des Fichiers et Organisation

### Structure de Projet Standard

```
votre-projet/
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
│       └── [fichiers de suivi d'approbation]
├── src/
│   └── [votre implémentation]
└── tests/
    └── [vos tests]
```

### Conventions de Nommage

**Noms de Spec** :
- Utiliser kebab-case : `user-authentication`
- Être descriptif : `payment-processing` et non `payments`
- Éviter les versions : `user-profile` et non `user-profile-v2`

**Noms de Document** :
- Toujours : `requirements.md`, `design.md`, `tasks.md`
- Cohérent à travers toutes les specs

## Workflows Avancés

### Itérations de Fonctionnalités

Pour les fonctionnalités évolutives :

1. Créer la spec initiale
2. Implémenter le MVP
3. Créer la spec d'amélioration
4. Référencer la spec originale
5. Construire sur le travail existant

Exemple :
```
"Créer une spec d'amélioration pour user-auth qui ajoute :
- Connexion sociale (Google, Facebook)
- Authentification biométrique
- Améliorations de la gestion de session"
```

### Workflow de Refactorisation

1. **Documenter l'État Actuel**
   ```
   "Créer une spec documentant le système d'authentification actuel"
   ```

2. **Concevoir les Améliorations**
   ```
   "Concevoir une refactorisation pour améliorer les performances d'authentification"
   ```

3. **Planifier la Migration**
   ```
   "Créer des tâches de migration pour la refactorisation"
   ```

4. **Implémenter Graduellement**
   ```
   "Implémenter les tâches de refactorisation avec rétrocompatibilité"
   ```

### Workflow de Résolution de Bugs

1. **Rapport de Bug**
   ```
   "Créer un rapport de bug pour le problème de timeout de connexion"
   ```

2. **Investigation**
   ```
   "Investiguer la cause racine du bug #45"
   ```

3. **Conception de Solution**
   ```
   "Concevoir un correctif pour le problème de timeout"
   ```

4. **Implémentation**
   ```
   "Implémenter le correctif de bug"
   ```

5. **Vérification**
   ```
   "Créer des tests de régression pour le bug #45"
   ```

## Meilleures Pratiques

### 1. Maintenir la Granularité des Specs

**Bon** : Une spec par fonctionnalité
- `user-authentication`
- `payment-processing`
- `notification-system`

**Mauvais** : Specs trop larges
- `backend-system`
- `all-features`

### 2. Création Séquentielle de Documents

Toujours suivre l'ordre :
1. Exigences (quoi)
2. Conception (comment)
3. Tâches (étapes)

Ne jamais sauter d'étapes.

### 3. Approbation Complète Avant Implémentation

- ✅ Approuver exigences → Créer conception
- ✅ Approuver conception → Créer tâches
- ✅ Réviser tâches → Commencer implémentation
- ❌ Sauter approbation → Problèmes d'implémentation

### 4. Maintenir les Specs à Jour

Lorsque les exigences changent :
```
"Mettre à jour les exigences pour user-auth pour inclure le support SSO"
```

### 5. Utiliser une Terminologie Cohérente

Maintenir la cohérence à travers :
- Noms de spec
- Noms de composant
- Terminologie API
- Nommage de base de données

### 6. Archiver les Specs Complétées

Garder l'espace de travail propre :
```
"Archiver la spec user-auth complétée"
```

## Patterns Courants

### MVP vers Fonctionnalité Complète

1. Commencer avec une spec MVP
2. Implémenter les fonctionnalités de base
3. Créer des specs d'amélioration
4. Construire progressivement
5. Maintenir la rétrocompatibilité

### Développement de Microservices

1. Créer un document de direction de service
2. Définir les limites de service
3. Créer une spec par service
4. Définir les points d'intégration
5. Implémenter les services indépendamment

### Développement API-First

1. Créer d'abord la spec API
2. Concevoir les contrats
3. Générer la documentation
4. Implémenter les endpoints
5. Créer les SDK clients

## Résolution de Problèmes de Workflow

### Specs Devenant Trop Grandes

**Solution** : Diviser en specs plus petites
```
"Diviser la spec e-commerce en :
- product-catalog
- shopping-cart
- checkout-process
- order-management"
```

### Exigences Peu Claires

**Solution** : Demander des clarifications
```
"Les exigences nécessitent plus de détails sur :
- Rôles et permissions utilisateur
- Scénarios de gestion d'erreurs
- Exigences de performance"
```

### Conception ne Correspondant pas aux Exigences

**Solution** : Demander une révision
```
"La conception ne traite pas l'exigence de multi-tenancy.
Veuillez réviser pour inclure l'isolation des tenants."
```

## Intégration avec le Processus de Développement

### Workflow Git

1. Créer une branche de fonctionnalité par spec
2. Commiter après chaque complétion de tâche
3. Référencer la spec dans les messages de commit
4. PR quand la spec est complète

### Intégration CI/CD

- Exécuter les tests pour les tâches complétées
- Valider par rapport aux exigences
- Déployer les fonctionnalités complétées
- Surveiller par rapport aux métriques de succès

### Collaboration d'Équipe

- Partager l'URL du tableau de bord
- Assigner les specs aux membres de l'équipe
- Réviser les specs des autres
- Coordonner via les approbations

## Documentation Associée

- [Guide Utilisateur](USER-GUIDE.md) - Instructions d'utilisation générales
- [Guide de Prompting](PROMPTING-GUIDE.md) - Exemples de prompts et patterns
- [Référence des Outils](TOOLS-REFERENCE.md) - Documentation complète des outils
- [Guide des Interfaces](INTERFACES.md) - Détails du tableau de bord et de l'extension
