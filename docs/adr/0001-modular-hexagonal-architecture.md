# ADR 0001 — Architecture modulaire hexagonale pragmatique

- Statut : Proposé
- Date : 2026-11-05

## Contexte

La plateforme devra évoluer sans enfermer les règles littéraires et communautaires dans un framework ou une base de données, tout en restant proportionnée à un MVP.

## Décision

Adopter le découpage décrit dans `docs/architecture.md` : domaine et application indépendants, ports explicites, adaptateurs Next.js/AdonisJS/PostgreSQL, modules métier cohésifs. Éviter le microservice prématuré et les abstractions sans cas d'usage.

## Conséquences

Les tests unitaires peuvent isoler les règles; le coût est une discipline de dépendances et quelques interfaces supplémentaires. Toute exception doit être justifiée dans la PR ou un ADR.
