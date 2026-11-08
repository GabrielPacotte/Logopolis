# Stratégie de tests

## Pyramide

| Niveau              | Responsable principal     | Cible                                                 |
| ------------------- | ------------------------- | ----------------------------------------------------- |
| Unitaires           | Developer                 | domaine et cas d'usage, rapides, déterministes        |
| Intégration         | QA & Security + Developer | adaptateurs HTTP/DB, migrations, autorisations        |
| E2E Playwright      | QA & Security             | parcours critiques depuis le navigateur               |
| Régression/sécurité | QA & Security             | scénarios corrigés, contrôles négatifs et abus connus |

Le Developer livre les tests unitaires avec le code. Le QA choisit et rejoue les scénarios d'intégration/E2E proportionnés au risque. Une anomalie corrigée devient un test de non-régression si elle est reproductible.

## Règles de qualité

- Tests indépendants, données éphémères, pas de service de production ni de secrets réels.
- Tester le comportement et les règles, pas les détails d'implémentation.
- Pour les permissions, inclure systématiquement un cas autorisé et un refusé.
- Les E2E couvrent à terme navigation clavier, lecteur sur petits/grands écrans et erreurs utilisateur compréhensibles.
- Toute exclusion de test est justifiée dans la PR avec risque, propriétaire et date de réexamen.

Les seuils de couverture chiffrés seront décidés après le premier module : un pourcentage seul ne remplace pas la couverture des règles et risques.

## Base exécutable et authentification

La CI exécute formatage, lint et frontières d'architecture, TypeScript strict, les tests unitaires Vitest de fondation, puis les tests unitaires API Japa (`npm run test:unit --workspace=api`) comme étapes distinctes. Elle applique ensuite les migrations PostgreSQL 16 et exécute les tests fonctionnels API, dont les parcours d'authentification et les refus de sécurité. Les liens Markdown, la gouvernance des agents, le scan de secrets et l'audit npm complètent le contrôle.

Pour l'issue #17, les tests fonctionnels couvrent notamment CSRF, réponses neutres, expiration/rejeu/concurrence de jetons, invalidation de session après réinitialisation et quotas PostgreSQL atomiques. Les contrôles E2E navigateur Playwright seront mis en place avec l'infrastructure E2E de l'issue dédiée ; en attendant, le build Next.js vérifie les routes et l'accessibilité est revue explicitement par QA à partir des formulaires livrés.
