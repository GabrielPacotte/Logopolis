# Spécification — Issue #25 : socle exécutable Web, API et PostgreSQL

## Contexte et objectif

- Issue : #25
- Epic : #10 — M1 : Lire et publier
- Références : `VISION.md`, [ADR 0001](../adr/0001-modular-hexagonal-architecture.md), `docs/architecture.md`, `docs/testing.md`, `docs/security.md`.
- Décisions PO approuvées :
  - monorepo npm workspaces ;
  - Node.js 24 LTS et npm 11, cohérents en local, CI et documentation ;
  - PostgreSQL 16 avec Docker Compose en développement local et base PostgreSQL éphémère en CI ;
  - aucun package partagé `contracts` ou `test-support` tant qu’un besoin concret ne le justifie ;
  - `/health/live` vérifie la disponibilité du processus API ; `/health/ready` vérifie notamment PostgreSQL.

L’objectif est de rendre le futur produit exécutable et vérifiable sans créer de fonctionnalité métier, de compte, d’œuvre, de contrat produit ou de donnée métier.

## Résultat attendu et périmètre

### Structure initiale

```text
apps/
  web/    # Next.js, adaptateur entrant Web ; aucun domaine métier
  api/    # AdonisJS, composition, HTTP technique et migrations PostgreSQL
```

- Le monorepo conserve les workspaces npm existants.
- Aucun répertoire `packages/contracts` ou `packages/test-support` vide n’est créé.
- Les futurs modules verticaux ne sont pas créés dans cette issue.
- `apps/api` est le seul point de composition API/DB ; `apps/web` ne dépend pas du code serveur.

### Web

Une application Next.js TypeScript démarre et se construit. Elle peut afficher une page technique minimale ; elle ne contient ni fonctionnalité métier, ni appel à la base, ni authentification.

### API et données

Une application AdonisJS TypeScript démarre, est construite et se connecte à PostgreSQL via une configuration validée à ses frontières.

- `GET /health/live` renvoie un succès lorsque le processus HTTP est capable de répondre. Il ne consulte pas PostgreSQL.
- `GET /health/ready` renvoie un succès seulement lorsque PostgreSQL est joignable et qu’une requête de préparation non métier réussit ; il renvoie une erreur de préparation sûre, sans détail sensible, lorsque PostgreSQL est indisponible.
- Une migration technique vérifiable est exécutée dans une base éphémère. Elle ne crée aucune table métier.
- Aucune route API métier, aucun modèle métier et aucun contrat public produit ne sont créés.

### Environnement, sécurité et exploitation locale

- La version Node.js 24 LTS et npm 11 est déclarée de manière cohérente dans les manifests, CI et documentation.
- Docker Compose fournit PostgreSQL 16 au développeur local. Aucun secret n’est commité.
- `.env.example` documente uniquement les variables nécessaires et utilise des valeurs sûres d’exemple.
- La configuration refuse ou signale clairement les variables obligatoires absentes, sans les journaliser.
- Les tests utilisent des données et une base éphémères ; aucun service de production n’est contacté.

## Hors périmètre

- Toute fonctionnalité Logopolis : identité, profil, œuvre, brouillon, import, publication, lecture, recherche, bibliothèque, interaction ou modération.
- Fournisseur d’identité, e-mail, stockage de fichiers, hébergement, production, déploiement et observabilité de production.
- Microservices, package partagé anticipé, OpenAPI/contrat produit prématuré, E2E métier Playwright.
- Migrations et données métier.

## Scénarios d’acceptation

1. **Installation cohérente**
   - Étant donné un clone propre et Node.js 24 LTS/npm 11,
   - quand les dépendances verrouillées sont installées,
   - alors les commandes qualité, build et test documentées s’exécutent sans version implicite différente dans la CI.

2. **Applications exécutables**
   - Étant donné l’environnement local documenté et PostgreSQL 16 démarré par Docker Compose,
   - quand les applications Web et API sont lancées selon la documentation,
   - alors les deux répondent sans nécessiter de secret réel ni donnée métier.

3. **Disponibilité du processus**
   - Étant donné l’API démarrée,
   - quand `GET /health/live` est appelé avec PostgreSQL indisponible,
   - alors l’endpoint réussit et ne tente pas d’exposer l’état interne de la base.

4. **Préparation de l’API**
   - Étant donné l’API démarrée avec PostgreSQL 16 disponible,
   - quand `GET /health/ready` est appelé,
   - alors il réussit après une vérification non métier de PostgreSQL.
   - Étant donné PostgreSQL indisponible,
   - quand le même endpoint est appelé,
   - alors il échoue avec un statut de préparation approprié et un message sans hôte, identifiant, requête SQL ou secret.

5. **Migration**
   - Étant donné une base éphémère vide,
   - quand les migrations sont appliquées,
   - alors elles réussissent, sont rejouables selon le mécanisme AdonisJS, et n’ajoutent aucune entité métier.

6. **Frontières**
   - Étant donné le code créé,
   - quand lint, vérification d’architecture et typecheck sont exécutés,
   - alors aucune dépendance Web → serveur, domaine → framework/DB, ni package partagé vide n’est introduit.

## Données, sécurité et droits

- Données persistées : seulement les métadonnées techniques requises par le mécanisme de migration.
- Aucune donnée personnelle, œuvre, compte, secret ou donnée de production.
- Les endpoints de santé ne divulguent pas la chaîne de connexion, le fournisseur, les traces ou la structure de la base.
- Les logs ne contiennent pas de secret ; les erreurs de préparation sont corrélables côté serveur sans exposition publique excessive.
- Les dépendances ajoutées sont verrouillées, compatibles Node 24/npm 11 et soumises à l’audit existant.

## Conception et contraintes d’architecture

- Conserver le monorepo npm workspaces approuvé.
- Utiliser Next.js et AdonisJS comme applications/adaptateurs entrants, conformément à l’ADR 0001.
- PostgreSQL et les migrations restent sous `apps/api`.
- Ne créer un module vertical ou un package partagé qu’avec un besoin explicite d’une issue ultérieure.
- Toute divergence structurante de cette spécification doit être signalée et justifiée par ADR avant implémentation.

## Vérification requise

### Developer

- Tests unitaires des utilitaires/configurations réellement introduits.
- Test d’intégration API + PostgreSQL éphémère : migration, `/health/live`, `/health/ready` avec DB disponible et indisponible.
- Build séparé des applications Web et API.
- Exécution de toutes les commandes racine existantes et nouvelles applicables.
- Documentation : démarrage local, Docker Compose, versions Node/npm, variables, migrations, tests, health checks.

### QA & Security

- Rejouer les tests d’intégration et contrôler les états disponible/indisponible de PostgreSQL.
- Vérifier l’absence de secret, la non-divulgation via les endpoints de santé et la cohérence Node/npm entre CI, manifests et documentation.
- Vérifier que le périmètre reste technique et qu’aucune fonctionnalité métier n’a été introduite.
- Contrôler la cohérence code ↔ documentation et émettre un verdict indépendant.

## Documentation à mettre à jour

- `docs/architecture.md`
- `docs/testing.md`
- `docs/security.md` si la configuration ou les endpoints le nécessitent
- procédure de démarrage/validation locale à créer ou compléter sous `docs/`
- cette spécification

## Definition of Done spécifique

La livraison ne peut être présentée au PO que si les critères ci-dessus sont satisfaits, CI verte, revue QA & Security indépendante favorable, documentation à jour, aucune vulnérabilité bloquante introduite et aucune action de fusion ou déploiement effectuée.
