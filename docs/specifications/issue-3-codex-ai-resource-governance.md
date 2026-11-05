# Spécification — Issue #3 : gouvernance Codex et efficacité IA

## Contexte et objectif

- Issue : [#3](https://github.com/GabrielPacotte/Logopolis/issues/3).
- Problème : préserver la qualité de la coordination IA avec les quotas limités de ChatGPT Plus, sans présenter une documentation locale comme une configuration exécutable de sous-agents.
- Hors périmètre : création d'agents persistants via l'API, modification de `~/.codex/config.toml`, choix d'un modèle global, modification des permissions Codex/GitHub, fonctionnalité métier et déploiement.
- Références : `AGENTS.md`, `docs/agents.md`, rapports de délégation de l'issue #1 et documentation officielle Codex.

## Comportement attendu

- Les règles communes permanentes, dont l'efficacité IA, sont accessibles depuis `AGENTS.md`.
- Les rôles, le cycle de livraison et la politique de ressources sont chacun documentés dans leur document de gouvernance dédié, sans duplication exhaustive.
- La documentation affirme explicitement qu'aucun format `.codex/config.toml` ni `.codex/agents/*.toml` n'est automatiquement chargé par l'environnement Codex actuel pour déclarer ces deux sous-agents.
- Les délégations restent séquentielles par défaut et traçables; l'indépendance QA est maintenue.

## Données, sécurité et droits

- Aucun secret, identifiant, jeton, paramètre global utilisateur ou donnée de production n'est créé ou modifié.
- Les règles de permissions restent documentaires : elles ne remplacent pas les permissions effectives de l'environnement ni les protections GitHub.

## Conception et vérification

- Documents prévus : `AGENTS.md`, `docs/README.md`, `docs/agents.md`, `docs/engineering/AI_RESOURCE_POLICY.md`, `docs/governance/AGENT_ROLES.md`, `docs/governance/WORKFLOW.md` et ce document.
- Vérifications : contrôle ciblé des liens/docs et revue QA indépendante; réutilisation des traces historiques de délégation de l'issue #1, sans les relancer.
- Limitation à consigner : les modèles, efforts de raisonnement, outils et concurrence des sous-agents sont des paramètres de session/agent quand l'interface les expose; ils ne sont pas configurables ici par un fichier TOML versionné de dépôt.
- Arbitrages PO : aucun pour la documentation; tout changement des réglages globaux Codex ou la création d'agents persistants nécessiterait une demande distincte et les autorisations associées.
