# Politique d'efficacité des ressources IA

## Objet et priorité

Cette politique s'applique au PM, au Developer et au QA & Security pour toute nouvelle session et délégation. Elle vise à limiter les ressources IA inutiles avec un abonnement ChatGPT Plus, sans réduire la fiabilité, la sécurité, les tests, l'accessibilité ou la documentation. En cas de conflit, la qualité prévaut.

## Lecture progressive du dépôt

1. Identifier les fichiers et symboles concernés.
2. Employer d'abord `rg --files`, `rg -n`, `git diff --stat` et `git diff -- <path>`.
3. Lire les sections ou plages de lignes nécessaires.
4. Élargir l'analyse seulement si les preuves l'exigent.

Une lecture exhaustive reste légitime pour une revue d'architecture, de sécurité ou de cohérence globale. Éviter les lectures complètes et répétées qui n'apportent pas de nouvelle preuve.

## Commandes et résultats

- Préférer les sorties concises et les modes silencieux adaptés; ne pas utiliser `--verbose` ou `--debug` sans besoin.
- Conserver les logs détaillés lorsqu'ils sont utiles, mais présenter d'abord le résumé, les erreurs pertinentes, la durée si disponible et le code de sortie.
- Rediriger les sorties volumineuses vers un fichier temporaire lorsque cela permet une inspection progressive.
- Ne jamais masquer une erreur, ignorer un code de sortie ni déclarer un contrôle vert sans résultat observé.
- Exécuter les tests nécessaires au risque; l'économie de tokens ne justifie pas une baisse de couverture.

## Délégation séquentielle et indépendante

Avant une délégation, le PM définit l'objectif, le périmètre, les références minimales, les responsabilités, les interdits et les critères de réussite. Les délégations sont séquentielles par défaut : Developer puis QA & Security. Le parallélisme n'est utilisé que lorsqu'il apporte un bénéfice concret sans conflits d'écriture.

Le QA relit les fichiers, la spécification et les changements lui-même; il ne valide jamais sur la seule affirmation du Developer. Ne pas créer de sous-agent supplémentaire sans nécessité démontrée.

## Mémoire durable et reprise

GitHub Issues portent l'état des tâches; les spécifications portent les exigences; les ADR portent les décisions; les PR portent les preuves de changement; `docs/` porte l'état technique durable. Ne pas reconstituer systématiquement l'historique depuis les conversations.

Lorsqu'une session devient longue, produire une synthèse concise et versionnée dans l'artefact approprié. Ni `AGENTS.md`, ni l'absence ou la présence d'un dossier `.codex/` ne garantissent à eux seuls la reprise automatique d'une exécution interrompue.

## Rapports

Chaque sous-agent retourne : mission, résultat ou verdict, vérifications, anomalies ou risques, références utiles et actions restantes. Les rapports restent concis; les longues sorties sont référencées plutôt que recopiées, tout en conservant les preuves nécessaires à l'audit.

## Limites de configuration Codex

Dans l'environnement observé, les sous-agents sont créés à la demande par les primitives de délégation et sont éphémères. La documentation officielle consultée documente une configuration utilisateur `~/.codex/config.toml` et des paramètres de session/agent; elle ne documente pas un format TOML de dépôt qui déclarerait durablement les rôles Logopolis. Aucun `.codex/config.toml` ni `.codex/agents/*.toml` n'est donc créé.

Les choix de modèle, d'effort de raisonnement, d'outils et de concurrence sont effectués par session lorsqu'ils sont exposés par l'interface. Conserver les valeurs par défaut quand elles sont suffisantes; augmenter le raisonnement seulement pour une architecture, une sécurité ou un arbitrage complexe. Ne pas modifier les réglages globaux du PO.

Aucune optimisation ne doit masquer une erreur, réduire une revue QA indépendante, affaiblir les contrôles de sécurité, supprimer une documentation requise ou transformer artificiellement un échec en succès.
