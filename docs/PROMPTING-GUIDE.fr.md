# Guide de Prompting

Un guide complet avec des exemples et des meilleures pratiques pour interagir avec Spec Workflow MCP via les assistants IA.

## Référence Rapide

### Commandes Essentielles

```
"Créer une spec pour [fonctionnalité]"
"Lister toutes mes specs"
"Afficher le statut de [nom-spec]"
"Implémenter la tâche [numéro] de [spec]"
"Créer des documents de direction"
```

## Création de Spécifications

### Création de Spec Basique

#### Demande Simple
```
"Créer une spec pour l'authentification utilisateur"
```

L'IA créera :
- Document d'exigences
- Document de conception (après approbation)
- Décomposition des tâches (après approbation de la conception)

#### Demande Détaillée
```
"Créer une spec appelée payment-processing avec :
- Paiements par carte de crédit via Stripe
- Intégration PayPal
- Gestion des remboursements
- Traitement des webhooks pour les événements de paiement
- Considérations de conformité PCI"
```

#### À Partir de Documentation Existante
```
"Créer une spec à partir du PRD dans @product-requirements.md"
```

```
"Construire une spec basée sur le document de conception dans @figma-export.md"
```

### Création de Spec Avancée

#### Avec Contraintes Techniques
```
"Créer une spec pour les notifications en temps réel qui :
- Utilise WebSockets pour les mises à jour en direct
- Se rabat sur le polling pour les navigateurs plus anciens
- Gère jusqu'à 10 000 connexions simultanées
- Maintient l'ordre des messages
- Inclut le support de file d'attente hors ligne"
```

#### Avec Critères d'Acceptation
```
"Créer une spec pour la fonctionnalité de recherche avec ces critères d'acceptation :
- Les résultats apparaissent en moins de 200ms
- Supporte la correspondance floue
- Inclut des filtres pour date, catégorie et auteur
- Affiche le score de pertinence
- Gère les fautes de frappe et les synonymes"
```

#### Spécification de Microservice
```
"Créer une spec pour un microservice d'inventaire qui :
- Expose une API REST
- Utilise PostgreSQL pour le stockage
- Publie des événements vers Kafka
- Implémente le pattern CQRS
- Inclut des endpoints de health check"
```

## Gestion des Spécifications

### Liste et Statut

#### Obtenir une Vue d'Ensemble
```
"Lister toutes mes specs"
"Montrer toutes les specs et leur progression"
"Quelles specs attendent une approbation ?"
"Quelles specs sont actuellement en cours ?"
```

#### Statut Spécifique
```
"Afficher le statut de la spec user-auth"
"Quelle est la progression de payment-processing ?"
"Montrer ce qu'il reste à faire dans la spec notification"
"Quelles tâches sont complétées dans user-profile ?"
```

#### Filtrage
```
"Montrer les specs qui sont complétées à plus de 50%"
"Lister les specs en attente de mon approbation"
"Quelles specs n'ont aucune tâche complétée encore ?"
"Montrer les specs bloquées ou coincées"
```

### Gestion des Documents

#### Visualisation des Documents
```
"Montrer les exigences pour user-auth"
"Afficher le document de conception pour payments"
"Quelles sont les tâches pour le système de notification ?"
"Montrer tous les documents pour la spec search"
```

#### Mise à Jour des Documents
```
"Mettre à jour les exigences user-auth pour inclure 2FA"
"Réviser la conception payment pour utiliser Stripe Connect"
"Ajouter une tâche pour les tests de sécurité à user-profile"
"Mettre à jour les exigences selon les commentaires : [commentaires]"
```

## Prompts d'Implémentation

### Tâches Individuelles

#### Implémentation Basique
```
"Implémenter la tâche 1.2 de user-auth"
"Compléter la tâche 2.1.3 dans la spec payment"
"Travailler sur la prochaine tâche en attente dans notifications"
```

#### Avec Contexte
```
"Implémenter la tâche 1.2 de user-auth en utilisant TypeScript et Express"
"Compléter la tâche de migration de base de données en utilisant Prisma"
"Implémenter la tâche d'endpoint API en suivant les conventions REST"
```

### Implémentation par Lot

#### Par Section
```
"Implémenter toutes les tâches de base de données de user-auth"
"Compléter toutes les tâches frontend dans la spec dashboard"
"Travailler sur toutes les tâches API pour payments"
```

#### Par Priorité
```
"Implémenter d'abord toutes les tâches critiques"
"Compléter les tâches MVP de user-profile"
"Se concentrer sur les tâches nécessaires pour la démo"
```

#### Séquentiel
```
"Implémenter les tâches 1.1 à 1.5 de user-auth"
"Compléter toutes les sous-tâches sous la section 2"
"Travailler sur les tâches de configuration dans l'ordre"
```

### Stratégies d'Implémentation

#### Test-Driven
```
"Pour la tâche 1.2, écrire d'abord les tests puis implémenter"
"Implémenter la tâche 2.1 avec couverture de tests complète"
"Créer des tests unitaires en implémentant la tâche de service"
```

#### Avec Documentation
```
"Implémenter la tâche 1.3 et documenter l'API"
"Compléter la tâche d'authentification avec des commentaires inline"
"Implémenter et créer des exemples d'utilisation pour la tâche 2.2"
```

## Documents de Direction

### Création de Direction

#### Ensemble Complet
```
"Créer des documents de direction pour mon projet e-commerce"
"Configurer la direction pour une application SaaS"
"Créer des orientations de projet pour une application mobile"
```

#### Documents Individuels
```
"Créer un document de direction produit axé sur l'expérience utilisateur"
"Créer une direction technique pour une architecture microservices"
"Créer une direction structurelle pour une configuration monorepo"
```

#### À Partir du Contexte
```
"Créer des documents de direction basés sur @project-brief.md"
"Générer la direction à partir de nos décisions techniques dans @architecture.md"
```

### Mise à Jour de la Direction

```
"Mettre à jour la direction produit pour inclure les fonctionnalités B2B"
"Réviser la direction technique pour utiliser GraphQL au lieu de REST"
"Mettre à jour la direction structurelle pour le nouveau système de modules"
```

## Workflows d'Approbation

### Demande de Feedback

#### Avec Préoccupations Spécifiques
```
"Demander l'approbation pour les exigences user-auth - vérifier particulièrement la section sécurité"
"Demander une révision de la conception payment - se concentrer sur la gestion des erreurs"
"Demander un feedback sur la décomposition des tâches - est-ce trop granulaire ?"
```

#### Demandes de Révision
```
"Les exigences nécessitent plus de détails sur :
- Scénarios de gestion d'erreurs
- Exigences de performance
- Considérations de sécurité
Veuillez réviser et resoumettre"
```

### Décisions d'Approbation

#### Approbation
```
"Approuver les exigences user-auth"
"La conception semble bonne, l'approuver"
"Accepter la décomposition des tâches telle quelle"
```

#### Demande de Modifications
```
"Demander des modifications aux exigences :
- Ajouter le support multi-tenant
- Inclure la limitation de débit
- Spécifier la politique de rétention des données"
```

#### Rejet
```
"Rejeter la conception actuelle - nous devons utiliser une architecture événementielle à la place"
"Recommencer avec les exigences - la portée est trop large"
```

## Workflow de Bug

### Signalement de Bugs

#### Rapport Détaillé
```
"Créer un rapport de bug :
Titre : La connexion échoue avec des caractères spéciaux
Étapes : 1) Entrer un email avec '+' 2) Soumettre le formulaire 3) Voir l'erreur
Attendu : Connexion réussie
Actuel : Erreur 500
Priorité : Haute
Environnement : Production"
```

#### À Partir des Logs d'Erreur
```
"Créer un rapport de bug à partir de cette erreur : [coller la stack trace]"
"Documenter ce bug à partir de l'alerte Sentry : [lien]"
```

### Résolution de Bug

#### Investigation
```
"Investiguer la cause racine du bug #45"
"Analyser pourquoi le webhook de paiement échoue"
"Déboguer le problème de performance dans l'endpoint de recherche"
```

#### Implémentation du Correctif
```
"Créer un correctif pour le bug #45 dans l'authentification utilisateur"
"Implémenter une solution pour le problème de timeout de paiement"
"Corriger la fuite mémoire dans le service de notification"
```

## Modifications en Cours d'Implémentation

### Quand les Specs Changent Pendant le Développement

Les exigences et conceptions évoluent souvent pendant l'implémentation. Lorsque cela se produit, vous devez maintenir tasks.md aligné avec la spec actuelle tout en préservant le travail complété.

### Utilisation de la Fonctionnalité de Rafraîchissement des Tâches

L'IA a accès à des instructions complètes de rafraîchissement des tâches via le prompt refresh-tasks. Informez simplement l'IA de vos changements :

#### Rafraîchissement de Tâches Basique
```
"Les exigences ont été mises à jour. Veuillez rafraîchir tasks.md pour s'aligner avec les requirements.md et design.md actuels."
```

#### Rafraîchissement de Tâches Détaillé avec Contexte
```
"J'ai mis à jour la spec avec les changements suivants :
- Supprimé le module de reporting
- Changé la base de données de MongoDB à PostgreSQL
- Ajouté la fonctionnalité de connexion sociale

Veuillez rafraîchir tasks.md en suivant le processus de rafraîchissement des tâches :
1. Préserver toutes les tâches complétées et en cours
2. Ajouter des tâches de migration pour le changement de base de données
3. Supprimer les tâches en attente pour le module de reporting
4. Ajouter de nouvelles tâches pour la connexion sociale"
```

#### Changement d'Architecture Nécessitant une Migration
```
"Nous passons de l'API REST à GraphQL. Plusieurs endpoints REST sont déjà implémentés. Veuillez mettre à jour tasks.md avec :
1. Tout le travail REST complété préservé
2. Tâches de migration pour encapsuler la logique REST dans les resolvers GraphQL
3. Nouvelles tâches d'implémentation GraphQL
4. Tâches de nettoyage pour supprimer REST après vérification de GraphQL"
```

### Comportement Attendu de l'IA

Lorsque vous demandez un rafraîchissement des tâches, l'IA va :

1. **Analyser l'État Actuel**
   - Lire requirements.md et design.md pour la spec actuelle
   - Identifier les tâches complétées, en cours et en attente
   - Déterminer quelles fonctionnalités ont été ajoutées, supprimées ou modifiées

2. **Préserver le Travail Complété**
   - Garder toutes les tâches [x] complétées inchangées
   - Garder toutes les tâches [-] en cours inchangées
   - Ajouter des notes quand le travail complété concerne des fonctionnalités supprimées

3. **Gérer les Changements d'Architecture**
   - Ajouter des tâches de migration après le travail complété nécessitant une mise à jour
   - Créer des tâches de transition pour une migration progressive
   - Inclure des tâches de vérification avant de supprimer l'ancienne implémentation

4. **Mettre à Jour les Tâches en Attente**
   - Supprimer les tâches en attente pour les fonctionnalités supprimées
   - Mettre à jour les tâches en attente pour les exigences modifiées
   - Ajouter de nouvelles tâches pour les nouvelles fonctionnalités

5. **Maintenir la Structure des Tâches**
   - Garder la numérotation séquentielle
   - Préserver le format des tâches
   - Inclure les références aux exigences
   - Maintenir l'ordre des dépendances

### Exemples de Scénarios

#### Suppression de Fonctionnalité
```
"Nous avons décidé de supprimer le module de reporting de la spec. Mettre à jour tasks.md en conséquence."
```

Comportement attendu de l'IA :
- Garder toutes les tâches de reporting complétées avec leur statut [x]
- Garder toutes les tâches de reporting en cours avec leur statut [-]
- Supprimer uniquement les tâches de reporting en attente [ ]
- Ajouter une note : "_Note : Fonctionnalité de reporting supprimée de la spec mais travail complété préservé_"

#### Changement d'Architecture avec Travail Complété
```
"Nous passons de MongoDB à PostgreSQL. Mettre à jour les tâches de base de données en attente. Notez que nous avons déjà implémenté les schémas MongoDB et la logique de connexion."
```

Comportement attendu de l'IA :
- Préserver toutes les tâches MongoDB complétées exactement telles qu'écrites
- Préserver toutes les tâches MongoDB en cours exactement telles qu'écrites
- Ajouter de nouvelles tâches de migration immédiatement après le travail MongoDB complété :
  - Migrer les schémas MongoDB vers les tables PostgreSQL
  - Remplacer la logique de connexion MongoDB par le client PostgreSQL
  - Mettre à jour les requêtes de base de données de MongoDB vers la syntaxe PostgreSQL
  - Migrer les données MongoDB existantes vers PostgreSQL
  - Mettre à jour la configuration d'environnement pour PostgreSQL
  - Supprimer les dépendances MongoDB après vérification de la migration
- Mettre à jour les tâches de base de données restantes en attente pour utiliser PostgreSQL
- Maintenir la séquence de numérotation des tâches

#### Ajout de Fonctionnalité
```
"Ajouter la connexion sociale à la spec d'authentification. Les exigences et la conception ont été mises à jour."
```

Comportement attendu de l'IA :
- Analyser la structure de tâches actuelle pour le point d'insertion logique
- Ajouter de nouvelles tâches de connexion sociale avec une numérotation appropriée
- Référencer les exigences spécifiques pour la connexion sociale
- Assurer que les nouvelles tâches maintiennent l'ordre des dépendances
- Si l'authentification de base est déjà implémentée, ajouter des tâches d'intégration

### Gestion des Migrations d'Architecture

Quand les changements d'architecture affectent du code déjà implémenté :

#### Migration REST vers GraphQL
```
"Nous passons de REST à GraphQL. Plusieurs endpoints REST sont déjà implémentés."
```

Ajouts de tâches attendus :
- Préserver les tâches d'endpoints REST complétées
- Ajouter des tâches de définition de schéma GraphQL
- Ajouter des tâches d'implémentation de resolver
- Ajouter des tâches de migration pour encapsuler la logique REST existante dans les resolvers GraphQL
- Ajouter des tâches pour mettre à jour le code client pour utiliser GraphQL
- Ajouter des tâches de nettoyage pour supprimer les endpoints REST après vérification de GraphQL

#### Division Monolithe vers Microservices
```
"Nous divisons le service utilisateur monolithique en services auth et profile séparés."
```

Ajouts de tâches attendus :
- Préserver les tâches de service monolithique complétées
- Ajouter des tâches de séparation de service
- Ajouter des tâches de communication inter-services
- Ajouter des tâches de migration de données si les bases de données sont divisées
- Ajouter des tâches de configuration de déploiement pour les nouveaux services
- Ajouter des tâches de nettoyage pour supprimer le code monolithique après vérification des services

### Format de Tâche pour les Migrations

Les tâches de migration doivent clairement indiquer leur objectif :

```
"Après rafraîchissement des tâches, je vois que vous avez ajouté :
- [ ] 2.4 Migrer les schémas MongoDB vers les tables PostgreSQL
  - Fichier : src/database/migrations/mongo-to-postgres.ts
  - Convertir les schémas de documents en tables relationnelles
  - Mapper les documents imbriqués vers des relations de clés étrangères
  - Préserver toutes les relations de données existantes
  - Objectif : Transition de la couche de base de données vers la nouvelle architecture
  - _Levier : Schémas MongoDB complétés dans les tâches 2.1-2.3_
  - _Exigences : Section de conception 3.2_"
```

### Communiquer les Changements à l'IA

Lorsque vous informez l'IA des changements de spec :

#### Être Spécifique sur les Changements et l'Impact
```
"Les exigences de traitement des paiements ont changé. Stripe est maintenant requis au lieu de PayPal. Nous avons déjà implémenté les gestionnaires de webhook PayPal. Veuillez mettre à jour tasks.md pour refléter ce changement, incluant les tâches de migration."
```

#### Fournir le Contexte pour la Préservation et la Migration
```
"Bien que nous passions de MongoDB à PostgreSQL, garder toutes les tâches MongoDB complétées car ce travail est déjà fait. Ajouter des tâches de migration pour transitionner le code MongoDB implémenté vers PostgreSQL."
```

#### Demander une Validation
```
"Après mise à jour de tasks.md, confirmer que toutes les exigences dans requirements.md ont des tâches correspondantes, que des chemins de migration existent pour les changements d'architecture, et qu'aucune tâche en attente n'existe pour les fonctionnalités supprimées."
```

### Stratégie de Migration Progressive

Pour les changements d'architecture majeurs, l'IA devrait créer des tâches qui supportent une migration progressive :

1. Implémenter la nouvelle architecture à côté de l'existante
2. Ajouter des tâches de couche de compatibilité
3. Migrer les fonctionnalités progressivement
4. Vérifier chaque étape de migration
5. Supprimer l'ancienne implémentation seulement après vérification complète

Cela assure que l'application reste fonctionnelle tout au long de la transition.

### Utilisation du Prompt Refresh Tasks

Vous pouvez également invoquer explicitement le prompt refresh tasks :

```
"Utiliser le prompt refresh-tasks pour la spec user-auth. Les changements sont : passage de JWT à OAuth2 pour l'authentification."
```

L'IA suivra alors les instructions complètes de rafraîchissement pour mettre à jour vos tâches tout en préservant tout le travail complété.

## Patterns Avancés

### Workflows Multi-Spec

#### Specs Reliées
```
"Créer une spec pour admin-dashboard qui s'intègre avec :
- spec user-management
- spec analytics
- spec reporting"
```

#### Dépendances de Spec
```
"Créer une spec pour notifications qui dépend de :
- user-auth étant complète
- message-queue étant implémentée
- email-service étant disponible"
```

### Développement Incrémental

#### MVP en Premier
```
"Créer une spec MVP pour user-profiles avec juste :
- Création de profil de base
- Nom d'affichage et avatar
- Vue de profil public
(Nous ajouterons les fonctionnalités sociales plus tard)"
```

#### Specs d'Amélioration
```
"Créer une spec d'amélioration pour user-auth ajoutant :
- Connexion sociale (Google, GitHub)
- Authentification biométrique
- Gestion améliorée de session
- Liaison de compte"
```

### Scénarios Complexes

#### Specs de Migration
```
"Créer une spec pour migrer de MongoDB à PostgreSQL :
- Documenter le schéma actuel
- Concevoir la nouvelle structure relationnelle
- Planifier une migration sans temps d'arrêt
- Inclure les procédures de rollback"
```

#### Specs de Refactorisation
```
"Créer une spec de refactorisation pour :
- Diviser le monolithe en services
- Extraire les composants partagés
- Améliorer la couverture de tests à 80%
- Maintenir la rétrocompatibilité"
```

#### Specs de Performance
```
"Créer une spec d'optimisation de performance :
- Profiler les goulots d'étranglement actuels
- Concevoir une stratégie de mise en cache
- Planifier l'indexation de base de données
- Implémenter le monitoring"
```

## Combinaisons de Workflow

### Flux de Fonctionnalité Complet
```
1. "Créer des documents de direction pour le projet"
2. "Créer une spec pour l'authentification utilisateur"
3. "Réviser et approuver les exigences"
4. "Réviser et approuver la conception"
5. "Implémenter la tâche 1.1 - schéma de base de données"
6. "Implémenter la tâche 1.2 - service d'authentification"
7. "Créer des tests pour le flux d'authentification"
8. "Marquer toutes les tâches comme complètes"
```

### Développement Parallèle
```
"Pendant que je révise les exigences, commencer à rédiger la conception API"
"Créer des specs pour le frontend et le backend en parallèle"
"Travailler sur les tâches UI pendant que l'équipe backend fait les tâches API"
```

### Raffinement Itératif
```
1. "Créer la spec initiale pour search"
2. "Implémenter la recherche de base (tâches 1-3)"
3. "Créer une spec d'amélioration pour la recherche avancée"
4. "Ajouter les fonctionnalités de filtrage et tri"
5. "Créer une spec d'optimisation pour la performance de recherche"
```

## Prompts Contextuels

### Utilisation du Contexte du Projet
```
"Créer une spec qui suit nos patterns existants"
"Implémenter cette tâche de manière cohérente avec notre codebase"
"Concevoir cette fonctionnalité pour s'intégrer avec notre architecture actuelle"
```

### Référencement d'Autres Specs
```
"Créer une spec similaire à user-auth mais pour l'authentification admin"
"Utiliser les mêmes patterns de conception que dans la spec payment"
"Suivre la structure des tâches de notre spec notification"
```

### Construire sur le Travail Précédent
```
"Étendre la spec user-auth pour inclure la gestion d'équipe"
"Ajouter le support GraphQL à la spec API REST existante"
"Améliorer la spec search avec des fonctionnalités de machine learning"
```

## Conseils pour un Prompting Efficace

### Être Spécifique
❌ **Vague** : "Créer une spec de connexion"
✅ **Spécifique** : "Créer une spec pour connexion email/mot de passe avec 2FA, se souvenir de moi, et réinitialisation de mot de passe"

### Fournir du Contexte
❌ **Sans contexte** : "Implémenter la tâche"
✅ **Avec contexte** : "Implémenter la tâche 1.2 en utilisant notre middleware Express existant et la base de données PostgreSQL"

### Définir des Attentes Claires
❌ **Peu clair** : "L'améliorer"
✅ **Clair** : "Améliorer la conception pour gérer 10x le trafic actuel avec des temps de réponse sous 200ms"

### Utiliser des Demandes Incrémentales
❌ **Trop** : "Créer 5 specs et tout implémenter"
✅ **Incrémental** : "Créer d'abord la spec user-auth, puis nous réviserons avant de passer à la suivante"

### Référencer le Travail Existant
❌ **Recommencer** : "Créer un nouveau système de paiement"
✅ **Construire sur** : "Améliorer notre spec payment pour ajouter la facturation d'abonnement"

## Bibliothèque de Patterns Courants

### Opérations CRUD
```
"Créer une spec pour les opérations CRUD sur les produits incluant :
- Création avec validation
- Lecture avec pagination et filtrage
- Mise à jour avec verrouillage optimiste
- Suppression douce avec option de récupération"
```

### Authentification & Autorisation
```
"Créer une spec d'auth avec :
- Authentification basée JWT
- Contrôle d'accès basé sur les rôles
- Gestion de clés API
- Gestion de session
- Rotation de token de rafraîchissement"
```

### Fonctionnalités Temps Réel
```
"Créer une spec pour chat en temps réel :
- Connexions WebSocket
- Persistence des messages
- Indicateurs de frappe
- Accusés de lecture
- File d'attente de messages hors ligne"
```

### Gestion de Fichiers
```
"Créer une spec de téléchargement de fichiers :
- Téléchargements par morceaux pour gros fichiers
- Suivi de progression
- Capacité de reprise
- Scan antivirus
- Intégration CDN"
```

### Analytique & Reporting
```
"Créer une spec d'analytique :
- Suivi d'événements
- Dimensions personnalisées
- Tableaux de bord en temps réel
- Rapports planifiés
- Options d'export de données"
```

## Prompts de Dépannage

### Quand les Choses Tournent Mal
```
"Pourquoi cette spec n'apparaît pas ?"
"Déboguer pourquoi la tâche ne se complète pas"
"Qu'est-ce qui bloque l'approbation ?"
"M'aider à comprendre cette erreur"
```

### Se Débloquer
```
"Que devrais-je faire ensuite ?"
"Montrer ce qui bloque la progression"
"Sur quelles tâches puis-je travailler en attendant ?"
"Comment résoudre cette dépendance ?"
```

## Documentation Associée

- [Guide Utilisateur](USER-GUIDE.md) - Instructions d'utilisation générales
- [Processus de Workflow](WORKFLOW.md) - Comprendre le workflow
- [Référence des Outils](TOOLS-REFERENCE.md) - Documentation complète des outils
- [Dépannage](TROUBLESHOOTING.md) - Résoudre les problèmes courants
