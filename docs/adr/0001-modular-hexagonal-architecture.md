# ADR 0001 — Architecture modulaire hexagonale pragmatique

- Statut : Proposé
- Date : 2026-11-05

## Contexte

La plateforme devra évoluer sans enfermer les règles littéraires et communautaires dans un framework ou une base de données, tout en restant proportionnée à un MVP.

## Proposition

Proposer le découpage décrit dans `docs/architecture.md` : modules métier verticaux, chacun avec domaine, application, adaptateurs et tests. Les applications Next.js/AdonisJS sont les adaptateurs entrants et points de composition; les migrations PostgreSQL restent sous `apps/api/database/migrations/<module>/`. Seuls `contracts` et `test-support` sont transverses, avec des responsabilités limitées. Éviter le microservice prématuré et les abstractions sans cas d'usage.

## Conséquences

Les tests unitaires peuvent isoler les règles; le coût est une discipline de dépendances et quelques interfaces supplémentaires. Les restrictions ESLint et le contrôle d'architecture en CI préviennent les contournements usuels mais ne remplacent pas la revue. Le PO doit encore confirmer le monorepo et les fournisseurs structurants. Toute exception doit être justifiée dans la PR ou un ADR.
