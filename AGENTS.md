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

## AI Resource Efficiency

Appliquer la politique détaillée dans [`docs/engineering/AI_RESOURCE_POLICY.md`](docs/engineering/AI_RESOURCE_POLICY.md). En bref : commencer par une recherche ciblée (`rg --files`, `rg -n`, `git diff --stat`, `git diff -- <path>`), lire seulement les sections utiles puis élargir si nécessaire; conserver des sorties concises sans masquer les codes de sortie ni les erreurs; déléguer avec un objectif, un périmètre et des critères de réussite explicites; préférer une délégation séquentielle lorsque le parallélisme n'apporte pas de bénéfice; consigner l'état durable dans GitHub et `docs/` plutôt que de reconstruire l'historique conversationnel.

Chaque rapport de sous-agent indique mission, résultat ou verdict, vérifications, risques, références et actions restantes. L'économie de ressources ne justifie jamais une réduction de tests, de revue QA, de sécurité ou de documentation.

## Limites des mécanismes d'agents

`AGENTS.md` est une instruction persistante lue par Codex dans ce dépôt : il ne crée aucun agent, aucun compte et aucune permission. Les trois rôles ci-dessus sont donc des responsabilités documentées. Lorsqu'un environnement Codex expose les primitives de délégation (`spawn_agent`, message et attente), le PM peut créer un sous-agent **éphémère** et lui confier un rôle pour une tâche donnée. La preuve est alors une trace de délégation et un rapport, pas ce fichier.

Aucune configuration `.codex/` n'est ajoutée : la documentation officielle consultée documente une configuration utilisateur `~/.codex/config.toml` pour Codex et la création de sous-agents au niveau de session/agent; elle ne documente pas, pour cet environnement, un format `.codex/config.toml` ou `.codex/agents/*.toml` de dépôt qui déclarerait ou invoquerait durablement ces deux sous-agents. Une telle configuration ne serait ni chargée ni une preuve de délégation. Les identités, équipes, CODEOWNERS et permissions GitHub sont des mécanismes distincts, à administrer dans GitHub; ils ne prouvent pas qu'un reviewer humain est le QA désigné.

Les modèles, l'effort de raisonnement, les outils et la concurrence sont des paramètres de session/agent lorsqu'une interface les expose. Ne pas les simuler dans ce dépôt et ne jamais modifier les réglages globaux du PO sans autorisation explicite.
