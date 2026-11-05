# Architecture cible

## Décision

Le futur monorepo sera organisé par déploiement et par modules métier : Next.js/TypeScript côté web, AdonisJS/TypeScript côté API, PostgreSQL comme stockage relationnel, Playwright pour les parcours E2E. Cette fondation ne crée volontairement ni application, ni schéma, ni dépendance.

```text
apps/
  web/                 # Next.js : présentation, accessibilité, BFF seulement si justifié
  api/                 # AdonisJS : API HTTP, auth, jobs et adaptateurs entrants
packages/
  domain/              # entités, règles métier, ports; sans framework ni I/O
  application/         # cas d'usage, commandes/requêtes, ports sortants
  contracts/           # DTO, schémas partagés, erreurs publiques stables
  test-support/        # fabriques et doubles réutilisables
infrastructure/
  database/            # migrations PostgreSQL et implémentations de repositories
docs/
```

Un module (p. ex. `works`, `profiles`, `library`, `interactions`) suit le même découpage : `domain` → `application` → `infrastructure`/`interfaces`. Les dépendances pointent vers l'intérieur; le domaine ne connaît ni HTTP, ni ORM, ni Next.js, ni AdonisJS. Les contrôleurs et composants appellent des cas d'usage via des ports explicites. PostgreSQL est atteint uniquement par des adaptateurs.

## Principes pratiques

- Préférer des modules cohésifs aux couches globales gigantesques; ne créer un package partagé qu'après un besoin réel dans au moins deux applications.
- Toute écriture passe par un cas d'usage transactionnel; les lectures peuvent employer des projections dédiées sans exposer le modèle de persistance.
- Les contrats API sont versionnés et validés au bord du système. Les erreurs publiques sont stables et sans information sensible.
- L'accessibilité, la sobriété de l'interface de lecture et les droits des auteurs sont des contraintes d'architecture, pas des ajouts tardifs.

## Arbitrages PO requis

1. Monorepo unique ou dépôts séparés avant l'initialisation des frameworks.
2. Fournisseur d'identité, hébergement, stockage de fichiers et service d'e-mail.
3. Politique détaillée des œuvres assistées par IA, licences, modération, retrait et conservation des données.
4. Licence du code et politique d'ouverture du projet.
