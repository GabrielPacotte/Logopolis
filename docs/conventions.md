# Conventions de code

- TypeScript strict; pas de `any`, ni de suppression globale des erreurs de lint/typecheck. Préférer `unknown` et une validation explicite aux frontières.
- Nommage : anglais pour le code et les identifiants, français possible dans la documentation et les contenus produit. `camelCase` (variables/fonctions), `PascalCase` (types/classes/composants), `kebab-case` (fichiers et routes).
- Une fonction/cas d'usage a une intention unique, des entrées validées, des sorties typées et des erreurs métier explicites. Les effets de bord se trouvent derrière un port.
- Ne pas accéder à la base, à l'environnement, au réseau ou à l'heure système directement depuis le domaine; injecter des ports/adaptateurs.
- Ne pas masquer une règle métier dans un contrôleur, un composant ou une migration. Ne pas dupliquer un contrat partagé.
- Chaque changement public met à jour sa spécification, ses tests et la documentation touchée. Les choix non triviaux deviennent un ADR.
- `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run check:docs`, `npm run check:secrets` et `npm run audit` sont non interactifs et doivent rester verts localement et dans la CI.

## Design by Contract

Toute fonction métier, de sécurité, d’autorisation, de transformation de données ou au comportement non trivial documente son contrat dans un JSDoc, avant sa revue QA. La première ligne normative suit la forme `{PRÉCONDITIONS} => {POSTCONDITIONS}`. Elle complète les types TypeScript ; elle ne les paraphrase pas.

Lorsque pertinent, le JSDoc précise les erreurs ou refus, les effets secondaires ou modifications d’état, et les invariants préservés. Le contrat doit être précis, vérifiable, cohérent avec l’issue et la spécification approuvée. Les getters, fonctions triviales et composants purement présentatifs en sont exclus.

Le QA dérive d’abord ses scénarios de l’issue et de la spécification. Il examine ensuite les contrats pour identifier les cas limites et propriétés à vérifier ; un contrat n’est jamais une source de vérité supérieure à la spécification. Un contrat ambigu, incomplet ou contradictoire constitue un écart de revue, même avant l’examen de l’implémentation.
