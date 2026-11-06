# Démarrage local

Logopolis requiert Node.js 26 et npm 11. Vérifier d'abord le binaire effectivement employé avec `command -v node`, `node --version` et `npm --version` : le premier doit afficher une version 26 et le second une version 11. Docker Compose expose PostgreSQL 16 sur le port local 5433 afin d’éviter les conflits avec une instance PostgreSQL déjà présente. Démarrer la base avec `docker compose up -d`, copier `apps/api/.env.example` vers `apps/api/.env`, puis exécuter `node ace generate:key` depuis `apps/api` afin de renseigner localement `APP_KEY` sans commiter cette valeur. Enfin exécuter `npm ci`, `npm run migration:run --workspace=api`, `npm run dev --workspace=api` et `npm run dev --workspace=web` dans deux terminaux.

`GET /health/live` vérifie uniquement le processus API. `GET /health/ready` vérifie PostgreSQL sans divulguer la configuration. `npm run test:integration` vise par défaut le PostgreSQL Compose local sur 5433 ; la CI fournit explicitement le port de son service éphémère (5432). Vérifier le socle avec `npm run build`, `npm test` et `npm run test:integration`.

`npm run audit` bloque les vulnérabilités high/critical. Les vulnérabilités low/moderate transitives éventuellement signalées restent à examiner dans la revue QA ; elles ne doivent pas être masquées ni faire baisser le seuil de la CI.
