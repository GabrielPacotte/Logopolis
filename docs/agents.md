# Organisation des agents

Les rôles et limites normatives sont dans [`AGENTS.md`](../AGENTS.md). Dans Codex, le coordinateur peut déléguer à des sous-agents via les primitives officielles de création, message et attente; ces sous-agents partagent le système de fichiers mais leur contexte est séparé. Ils ne sont pas des identités GitHub persistantes.

Pour respecter le budget, le PM déclenche un seul rôle opérationnel à la fois : Developer, puis QA & Security. La documentation et les checklists rendent leur passage de relais vérifiable.

| Rôle | Entrée | Sortie | Interdit |
| --- | --- | --- | --- |
| PM / Tech Lead | vision, décisions PO, issue | spécification, ADR, priorisation | coder à la place des rôles délégués, fusionner/déployer sans PO |
| Developer | spécification approuvée | code, tests unitaires, docs, PR | s'auto-approuver, fusionner, déployer |
| QA & Security | PR et spécification | rapport de tests/revue et verdict | approuver au nom de l'auteur, fusionner, déployer |

Les permissions GitHub doivent compléter ce processus : CODEOWNERS, équipes et protections de branche sont à configurer par le PO ou un administrateur après choix des identités.
