# Stratégie de tests

## Pyramide

| Niveau | Responsable principal | Cible |
| --- | --- | --- |
| Unitaires | Developer | domaine et cas d'usage, rapides, déterministes |
| Intégration | QA & Security + Developer | adaptateurs HTTP/DB, migrations, autorisations |
| E2E Playwright | QA & Security | parcours critiques depuis le navigateur |
| Régression/sécurité | QA & Security | scénarios corrigés, contrôles négatifs et abus connus |

Le Developer livre les tests unitaires avec le code. Le QA choisit et rejoue les scénarios d'intégration/E2E proportionnés au risque. Une anomalie corrigée devient un test de non-régression si elle est reproductible.

## Règles de qualité

- Tests indépendants, données éphémères, pas de service de production ni de secrets réels.
- Tester le comportement et les règles, pas les détails d'implémentation.
- Pour les permissions, inclure systématiquement un cas autorisé et un refusé.
- Les E2E couvrent à terme navigation clavier, lecteur sur petits/grands écrans et erreurs utilisateur compréhensibles.
- Toute exclusion de test est justifiée dans la PR avec risque, propriétaire et date de réexamen.

Les seuils de couverture chiffrés seront décidés après le premier module : un pourcentage seul ne remplace pas la couverture des règles et risques.
