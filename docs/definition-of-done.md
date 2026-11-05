# Definition of Done

Une issue ne peut être proposée à la fusion que si :

- la spécification et les critères d'acceptation sont liés et satisfaits;
- le périmètre est limité et l'absence de régression est démontrée;
- le code respecte l'architecture/conventions et les tests unitaires pertinents sont verts;
- les tests intégration/E2E et contrôles sécurité requis par le risque ont été exécutés ou une exception est explicitement acceptée par le PO;
- la revue QA & Security confirme la cohérence code↔documentation;
- docs, ADR et changelog éventuel sont à jour;
- aucun secret, donnée personnelle ou vulnérabilité bloquante n'est introduit;
- CI, revue humaine et règles de branche requises sont satisfaites.
- Pour la fondation technique : toutes les commandes de `package.json` et les contrôles GitHub applicables sont documentés avec leur résultat; toute limite d'autorisation est explicitement signalée.

« Done » ne signifie jamais « fusionné » ni « déployé » : chacune de ces actions requiert l'autorisation explicite du PO.
