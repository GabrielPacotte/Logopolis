# Sécurité et confidentialité

La sécurité est une exigence produit : Logopolis héberge des comptes, créations et interactions. Aucun secret ne doit être commité ou affiché dans les journaux.

## Exigences initiales

- Authentification et autorisation côté serveur; refuser par défaut et vérifier l'accès objet par objet.
- Validation/sanitation des entrées aux frontières; protection XSS, CSRF lorsque pertinente, injection SQL via requêtes paramétrées et contrôle de téléversements.
- Mots de passe avec algorithme adapté, jetons à durée limitée/révocables, cookies sécurisés si utilisés, limitation de débit sur les routes sensibles.
- Chiffrement en transit, secrets hors dépôt, moindre privilège pour base, CI et GitHub Actions.
- Journaliser les événements de sécurité nécessaires sans mots de passe, jetons, textes privés ou données personnelles excessives.
- Dépendances verrouillées, mises à jour suivies et analyse de vulnérabilités en CI dès que les manifests existent.

## Fondation vérifiable

- `.gitignore` exclut les fichiers `.env` et réautorise uniquement `.env.example`, qui ne contient aucune valeur secrète.
- Les secrets GitHub restent dans GitHub Secrets, jamais dans le dépôt ou les logs. Les environnements de déploiement devront exiger une approbation humaine avant toute utilisation.
- Les données de test sont synthétiques; aucune œuvre, donnée personnelle ou donnée de production ne doit être committée.
- Dependabot surveille npm et les GitHub Actions; `npm audit` et `npm run check:secrets` s'exécutent dans la CI. Le scan par motifs est une défense de base, pas une garantie absolue : une revue humaine demeure obligatoire.

## Revue QA & Security

Pour chaque PR : surface d'attaque modifiée, contrôle d'accès, validation, exposition de données, dépendances, erreurs/logs, tests négatifs et impact vie privée. Une vulnérabilité critique ou élevée bloque la PR jusqu'à correction ou acceptation écrite et limitée dans le temps par le PO.

**Arbitrages PO / expertise juridique :** base légale, durées de conservation, droits RGPD, procédures de signalement/modération, droits d'auteur, politique IA et réponse aux incidents. Ce document n'est pas un avis juridique.
