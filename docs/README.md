# Documentation d’ingénierie

`docs/` est la source de vérité versionnée pour Logopolis. Le Wiki GitHub est publié automatiquement depuis ce répertoire quand sa configuration est disponible; il ne doit pas être édité directement.

| Document                                                          | Objet                                               |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| [Architecture](architecture.md)                                   | Structure modulaire et hexagonale proposée          |
| [Conventions](conventions.md)                                     | Règles TypeScript, qualité et nommage               |
| [Workflow](workflow.md)                                           | Chaîne Issue → spécification → livraison            |
| [Tests](testing.md)                                               | Pyramide de tests et preuves attendues              |
| [Sécurité](security.md)                                           | Exigences de sécurité et revue                      |
| [Agents](agents.md)                                               | Collaboration et séparation des responsabilités     |
| [Traces de délégation](agent-runs/issue-1-readonly-delegation.md) | Tests réels Developer puis QA de l'issue #1         |
| [Definition of Done](definition-of-done.md)                       | Critères de fermeture d'une livraison               |
| [Backlog MVP](backlog-mvp.md)                                     | Proposition priorisée, sans engagement de livraison |
| [Périmètre fonctionnel](functional-scope.md)                      | Hypothèses MVP à spécifier domaine par domaine      |
| [Spécification](specification-template.md)                        | Modèle obligatoire par issue fonctionnelle          |
| [ADR](adr/README.md)                                              | Décisions d'architecture                            |
| [Gouvernance GitHub](github-governance.md)                        | État vérifié, checklist PO et CODEOWNERS            |
| [Livraison propre](delivery.md)                                   | Archive partageable sans métadonnées ni secrets     |
| [Politique de ressources IA](engineering/AI_RESOURCE_POLICY.md)   | Efficacité durable sans compromis de qualité        |
| [Rôles des agents](governance/AGENT_ROLES.md)                     | Responsabilités et limites d'autorité               |
| [Workflow agents](governance/WORKFLOW.md)                         | Cycle issue, délégation, revue et PR                |

Les questions marquées **Arbitrage PO** ne doivent pas être transformées en implémentation avant décision explicite.
