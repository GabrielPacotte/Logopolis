# Organisation des agents

Les rôles et limites normatives sont dans [`AGENTS.md`](../AGENTS.md). Dans Codex, le coordinateur peut déléguer à des sous-agents via les primitives officielles de création, message et attente; ces sous-agents partagent le système de fichiers mais leur contexte est séparé. Ils ne sont pas des identités GitHub persistantes.

| Élément                  | Ce qu'il prouve                                         | Ce qu'il ne prouve pas                       |
| ------------------------ | ------------------------------------------------------- | -------------------------------------------- |
| `AGENTS.md`              | Instructions persistantes du dépôt                      | Création ou exécution d'un agent             |
| Rôle documenté           | Répartition attendue des responsabilités                | Identité GitHub ou permission                |
| Sous-agent Codex         | Délégation réelle, limitée à une tâche et à une session | Rôle persistant dans une future session      |
| Équipe/CODEOWNERS GitHub | Identités autorisées à relire                           | Que le reviewer est effectivement l'agent QA |

Ce dépôt ne contient pas de `.codex/` : aucun format local officiellement supporté et utile n'est disponible ici pour définir des sous-agents persistants. Ne pas créer de pseudo-configuration. Les traces du test réel de délégation mené pour l'issue #1 sont conservées dans [le rapport dédié](agent-runs/issue-1-readonly-delegation.md).

Pour respecter le budget, le PM déclenche un seul rôle opérationnel à la fois : Developer, puis QA & Security. La documentation et les checklists rendent leur passage de relais vérifiable.

| Rôle           | Entrée                      | Sortie                            | Interdit                                                        |
| -------------- | --------------------------- | --------------------------------- | --------------------------------------------------------------- |
| PM / Tech Lead | vision, décisions PO, issue | spécification, ADR, priorisation  | coder à la place des rôles délégués, fusionner/déployer sans PO |
| Developer      | spécification approuvée     | code, tests unitaires, docs, PR   | s'auto-approuver, fusionner, déployer                           |
| QA & Security  | PR et spécification         | rapport de tests/revue et verdict | approuver au nom de l'auteur, fusionner, déployer               |

Les permissions GitHub doivent compléter ce processus : CODEOWNERS, équipes et protections de branche sont à configurer par le PO ou un administrateur après choix des identités.
