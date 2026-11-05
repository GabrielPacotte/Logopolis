# Workflow des agents

Le workflow obligatoire est défini dans [`../workflow.md`](../workflow.md). Cette page précise uniquement le passage entre les rôles.

1. Le PM crée ou affine l'issue, la spécification, les risques et les critères d'acceptation.
2. Le PM mandate le Developer avec un périmètre ciblé et les références indispensables.
3. Le Developer produit le changement, les tests unitaires et la documentation, puis apporte des preuves dans la PR.
4. Le PM mandate ensuite un QA distinct. Le QA vérifie directement le code, la spécification, les documents et les résultats de tests; il rend `APPROVED`, `CHANGES REQUESTED` ou `BLOCKED`.
5. Après un refus, le PM organise une correction Developer suivie d'une nouvelle revue QA.
6. Le PO effectue la revue humaine et autorise explicitement, séparément, toute fusion et tout déploiement.

Les délégations sont séquentielles par défaut pour limiter les ressources et éviter les conflits. Les traces historiques de l'issue #1 sont dans [`../agent-runs/issue-1-readonly-delegation.md`](../agent-runs/issue-1-readonly-delegation.md); elles démontrent des délégations réelles antérieures mais ne créent pas de rôles persistants.

Les droits GitHub effectifs, les règles de branche et les secrets restent administrés dans GitHub conformément à [`../github-governance.md`](../github-governance.md). Une instruction documentaire n'est pas une restriction technique de permission.
