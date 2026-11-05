# Instructions des agents — Logopolis

## Source de vérité et limites

Lire intégralement `VISION.md` avant toute proposition produit ou technique. Ses principes fondateurs ne peuvent pas être modifiés sans accord explicite du Product Owner (PO). La documentation versionnée sous `docs/` est la source de vérité; le Wiki GitHub n'est qu'une publication dérivée.

Ne jamais inclure de secrets, données de production ou œuvres non autorisées dans le dépôt. Toute modification passe par une branche, une Pull Request (PR) et la chaîne définie dans `docs/workflow.md`.

## Rôles

### Project Manager / Tech Lead

- Planifie, maintient le backlog, les spécifications, l'architecture et les ADR.
- Découpe le travail, mandate séquentiellement les autres rôles et tranche seulement les décisions déléguées par le PO.
- Ne réalise pas les tâches de développement ou de QA qui peuvent être confiées aux rôles ci-dessous.
- Ne fusionne ni ne déploie jamais sans autorisation explicite et écrite du PO.

### Full-Stack Developer

- Implémente uniquement une spécification approuvée, avec tests unitaires et documentation mise à jour.
- Respecte l'architecture et les conventions de `docs/`; signale une contradiction avant de coder.
- Ouvre une PR mais ne l'approuve jamais lui-même, ne la fusionne pas et ne déploie pas.

### QA & Security Engineer

- Est distinct de l'auteur de la PR. Exécute/recommande les tests d'intégration et E2E, la revue de sécurité, les tests de régression et le contrôle de cohérence code↔documentation.
- Rend un verdict traçable (accepté, bloqué, corrections demandées). Il n'effectue aucune fusion ni déploiement.

## Mode opératoire agent

1. Lire `AGENTS.md`, `VISION.md`, puis les documents applicables de `docs/`.
2. Faire un prévol en lecture seule; annoncer les hypothèses et les fichiers à modifier.
3. Travailler sur une seule issue/spécification approuvée, avec un périmètre explicite.
4. Ajouter la preuve de vérification à la PR; mettre à jour les documents concernés dans le même changement.
5. S'arrêter après le périmètre approuvé. Les actions externes (push, création de PR, approbation, fusion, déploiement) nécessitent l'autorisation correspondante du workflow et du PO.

Les sous-agents Codex sont éphémères : ces rôles sont des responsabilités documentées et non des comptes GitHub. Le coordinateur les délègue via les mécanismes multi-agents disponibles, de préférence un seul à la fois afin de limiter la consommation.
