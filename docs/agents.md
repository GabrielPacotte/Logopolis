# Organisation des agents

Les rôles et limites normatives sont dans [`AGENTS.md`](../AGENTS.md). Dans Codex, le coordinateur peut déléguer à des sous-agents via les primitives officielles de création, message et attente; ces sous-agents partagent le système de fichiers mais leur contexte est séparé. Ils ne sont pas des identités GitHub persistantes.

Les responsabilités détaillées sont dans [`governance/AGENT_ROLES.md`](governance/AGENT_ROLES.md), le cycle de travail dans [`governance/WORKFLOW.md`](governance/WORKFLOW.md) et les règles d'efficacité dans [`engineering/AI_RESOURCE_POLICY.md`](engineering/AI_RESOURCE_POLICY.md). Ces documents complètent `AGENTS.md` sans en recopier toutes les règles.

| Élément                  | Ce qu'il prouve                                         | Ce qu'il ne prouve pas                       |
| ------------------------ | ------------------------------------------------------- | -------------------------------------------- |
| `AGENTS.md`              | Instructions persistantes du dépôt                      | Création ou exécution d'un agent             |
| Rôle documenté           | Répartition attendue des responsabilités                | Identité GitHub ou permission                |
| Sous-agent Codex         | Délégation réelle, limitée à une tâche et à une session | Rôle persistant dans une future session      |
| Équipe/CODEOWNERS GitHub | Identités autorisées à relire                           | Que le reviewer est effectivement l'agent QA |

Ce dépôt ne contient pas de `.codex/` : aucun format local de dépôt officiellement documenté et vérifié dans cet environnement ne charge des TOML d'agents ni ne crée des sous-agents persistants. La configuration utilisateur `~/.codex/config.toml` et les paramètres de session/agent sont hors dépôt; ils ne sont ni modifiés ni versionnés ici. Ne pas créer de pseudo-configuration. Les traces du test réel de délégation mené pour l'issue #1 sont conservées dans [le rapport dédié](agent-runs/issue-1-readonly-delegation.md) et sont réutilisées sans le relancer.

Pour respecter le budget, le PM déclenche un seul rôle opérationnel à la fois : Developer, puis QA & Security. La documentation et les checklists rendent leur passage de relais vérifiable.

| Rôle           | Entrée                      | Sortie                            | Interdit                                                        |
| -------------- | --------------------------- | --------------------------------- | --------------------------------------------------------------- |
| PM / Tech Lead | vision, décisions PO, issue | spécification, ADR, priorisation  | coder à la place des rôles délégués, fusionner/déployer sans PO |
| Developer      | spécification approuvée     | code, tests unitaires, docs, PR   | s'auto-approuver, fusionner, déployer                           |
| QA & Security  | PR et spécification         | rapport de tests/revue et verdict | approuver au nom de l'auteur, fusionner, déployer               |

Les permissions GitHub doivent compléter ce processus : CODEOWNERS, équipes et protections de branche sont à configurer par le PO ou un administrateur après choix des identités.
