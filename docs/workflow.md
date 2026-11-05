# Workflow de livraison

## Chaîne obligatoire

`GitHub Issue → Specification → Development → QA & Security → Human Review → Merge`

1. Le PM crée/affine l’issue, sa priorité, ses critères d'acceptation et ses risques.
2. Une spécification issue de [ce modèle](specification-template.md) est liée à l'issue et approuvée par le PO quand elle introduit un choix produit ou une zone ambiguë.
3. Le Developer crée une branche `type/issue-<n>-slug`, implémente le périmètre et ouvre une PR avec les preuves demandées.
4. Le QA & Security Engineer, différent de l'auteur, vérifie tests, sécurité, régression et cohérence code↔docs. Les écarts sont des demandes de correction.
5. Le PO effectue la revue humaine. En cas de refus, le PM organise une nouvelle itération Developer puis QA; la PR n'est pas fusionnée.
6. Seul le PO autorise explicitement la fusion et, séparément, tout déploiement de production. L'agent concerné s'arrête après avoir préparé l'action.

## Protections GitHub à activer par le PO

- Branche `main` protégée : PR obligatoire, au moins une approbation, branches à jour et statuts requis.
- Interdire l'auto-approbation, les push directs et les force-push; limiter les personnes autorisées à fusionner.
- Exiger les checks CI (format, lint, typecheck, tests unitaires/intégration/E2E selon périmètre, scan sécurité) dès leur mise en place.
- Configurer des environnements avec approbation humaine pour tout déploiement.

GitHub ne peut pas imposer à lui seul que le reviewer soit « QA » : cette séparation doit être appliquée par les droits d'équipe, la règle de protection et la checklist de PR. **Arbitrage PO :** définir les comptes/équipes GitHub et les règles de protection exactes.
