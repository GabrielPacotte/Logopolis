# Architecture cible

## Proposition : monorepo npm à modules métier verticaux

Cette fondation propose un monorepo npm, TypeScript strict, sans application ni règle métier. Cette proposition reste soumise à l'arbitrage du PO : elle est documentée dans l'ADR 0001 avec le statut **Proposé**.

```text
apps/
  web/                              # futur Next.js : interface et adaptateurs entrants web
  api/                              # futur AdonisJS : HTTP, composition et migrations
    database/migrations/<module>/   # migrations PostgreSQL, rattachées à un module
packages/
  <module>/
    domain/                         # entités, invariants, ports; ni framework ni I/O
    application/                    # cas d'usage, commandes/requêtes, ports sortants
    adapters/                       # persistance, services externes, mappings
    test/                           # fabriques et tests du module
  contracts/                        # seuls contrats API stables, validés aux frontières
  test-support/                     # doubles et fabriques partagés non métier
docs/
```

Un module (`works`, `profiles`, `library`, `interactions` à terme) possède ses couches. Il n'existe pas de packages globaux `domain` ou `application` : cela évite de disperser le modèle métier entre une organisation horizontale et une organisation verticale. `contracts` n'accueille ni entité ni règle métier; il ne contient que les contrats publics nécessaires à plusieurs consommateurs.

## Règles de dépendance et d'import

- `domain` ne dépend ni d'AdonisJS, Next.js, HTTP, ORM, PostgreSQL, environnement, horloge ou réseau.
- `application` dépend du domaine du même module et de ports/contrats, jamais d'un adaptateur ou d'une application.
- `adapters` implémente les ports de l'application; les interfaces HTTP d'AdonisJS et les composants Next.js restent dans `apps/`.
- `apps/api` compose les modules, expose HTTP et porte les migrations sous `apps/api/database/migrations/<module>/`. Il ne contient pas de règle métier.
- `apps/web` utilise des contrats publics et n'importe pas le domaine ni les adaptateurs serveur.
- Un module ne dépend d'un autre module que via son contrat public ou un port explicitement documenté; pas d'import profond dans ses dossiers internes.

`eslint.config.mjs` interdit les imports évidents vers l'extérieur depuis `domain` et `application`; `scripts/check-architecture.mjs` vérifie les mêmes frontières dans la CI. Ces garde-fous ne remplacent pas la revue : chaque nouveau module doit ajouter des tests et, si nécessaire, renforcer ces règles.

## Principes pratiques

- Toute écriture passe par un cas d'usage transactionnel; les lectures peuvent employer des projections dédiées sans exposer le modèle de persistance.
- Les contrats API sont versionnés et validés aux frontières. Les erreurs publiques sont stables et sans information sensible.
- L'accessibilité, la sobriété de l'interface de lecture et les droits des auteurs sont des contraintes d'architecture, pas des ajouts tardifs.
- Ne pas créer de microservice, de package partagé ou d'abstraction sans un besoin démontré.

## Arbitrages PO requis

1. Confirmer le monorepo npm proposé ou décider de dépôts séparés avant l'initialisation des frameworks.
2. Fournisseur d'identité, hébergement, stockage de fichiers et service d'e-mail.
3. Politique détaillée des œuvres assistées par IA, licences, modération, retrait et conservation des données.
4. Licence du code et politique d'ouverture du projet.
