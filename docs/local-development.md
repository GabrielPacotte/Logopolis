# Démarrage local

Logopolis requiert Node.js 26 et npm 11. Docker Compose expose PostgreSQL 16 sur le port local 5433 afin d’éviter les conflits avec une instance PostgreSQL déjà présente. Démarrer la base avec `docker compose up -d`, copier `apps/api/.env.example` vers `apps/api/.env`, puis exécuter `npm ci`, `npm run migration:run --workspace=api`, `npm run dev --workspace=api` et `npm run dev --workspace=web` dans deux terminaux.

`GET /health/live` vérifie uniquement le processus API. `GET /health/ready` vérifie PostgreSQL sans divulguer la configuration. Vérifier le socle avec `npm run build`, `npm test` et `npm run test:integration`.
