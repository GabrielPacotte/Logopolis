# Spécification — Issue #13 : politique éditoriale, droits et usages d’IA

> Statut : prête pour revue humaine. Cette spécification fixe les règles produit transverses ; elle n’autorise aucune implémentation métier par elle-même.

## Contexte et objectif

- Issue : #13
- Problème utilisateur / hypothèse : Logopolis publie des œuvres et doit rendre explicites les engagements de l’auteur, l’information des lecteurs et les limites d’action de la plateforme.
- Objectif : définir une politique MVP applicable avant et après publication, réutilisable par les parcours d’import, publication, lecture, EPUB et modération.
- Hors périmètre : tables, migrations, API, détection automatique d’IA, décision automatisée de modération, concours, impression, DRM, licences commerciales et avis juridique définitif.
- Liens vision et ADR : [VISION.md](../../VISION.md), ADR 0001 ; issues #17, #20, #22, #29, #32 et #35.

## Comportement attendu

### Principes éditoriaux

Une œuvre publiée sur Logopolis doit résulter d’une contribution créative humaine principale. L’auteur conserve ses droits d’auteur et atteste disposer des droits nécessaires. Il accorde à Logopolis une autorisation non exclusive, limitée à la diffusion technique de l’œuvre selon les réglages choisis.

Les usages d’IA générative sont déclarés par l’auteur selon trois niveaux :

1. **Aucune IA générative** : aucun outil génératif n’a contribué au texte littéraire.
2. **Assistance non substantielle** : une IA générative a été utilisée de façon accessoire, sans générer ni réécrire de partie déterminante de l’œuvre.
3. **Assistance substantielle déclarée** : une IA a généré, réécrit de manière significative ou structuré une partie déterminante de l’œuvre ; l’auteur demeure néanmoins le contributeur créatif principal.

Une correction purement corrective (orthographe, grammaire, ponctuation ou cohérence locale) n’est pas une génération littéraire si elle ne produit ni ne réécrit de manière créative ou déterminante le texte. À l’inverse, une reformulation créative, la rédaction de passages, ou une structuration narrative peut relever d’une assistance générative, y compris si l’outil est présenté comme un correcteur.

Est interdit ce que l’auteur ne peut pas honnêtement présenter comme principalement créé par un humain : notamment une œuvre entièrement ou majoritairement générée par IA sans contribution créative humaine principale. Logopolis ne prétend pas mesurer automatiquement cette frontière ; elle repose sur la déclaration, les règles publiques et une appréciation humaine en cas de signalement.

L’assistance substantielle n’est donc pas interdite par principe, mais elle doit être déclarée. Le niveau « assistance substantielle déclarée » est affiché immédiatement et visiblement sur la page publique de l’œuvre. Les niveaux « aucune » et « non substantielle » ne créent pas de label public distinct dans le MVP.

Aucune règle sur l’éligibilité d’œuvres assistées par IA à de futurs concours n’est définie ici : elle sera décidée lors de la conception des concours.

### Acteurs et préconditions

- **Auteur** : authentifié, propriétaire de l’œuvre ; il renseigne les déclarations et consentements applicables.
- **Lecteur** : consulte l’information publique disponible sur une œuvre publiée.
- **Modérateur autorisé** : traite les signalements et recours conformément à #32 ; il ne délègue pas la décision définitive à un automatisme.
- **Précondition de publication** : e-mail vérifié selon #17, œuvre prévisualisée selon #21, déclaration IA explicite et attestation de droits renseignées selon #22.

### Scénarios d’acceptation (Given/When/Then)

- Étant donné un auteur prêt à publier, lorsqu’il confirme la publication, alors il doit choisir explicitement un niveau de déclaration IA et attester ses droits de diffusion avant que l’œuvre devienne publique.
- Étant donné une œuvre publiée avec assistance substantielle, lorsqu’un lecteur consulte sa page publique, alors le label correspondant est visible immédiatement.
- Étant donné une œuvre publiée, lorsqu’un auteur modifie sa déclaration IA, alors la nouvelle information publique est appliquée immédiatement et le changement est traçable.
- Étant donné une déclaration manifestement abusive ou incohérente signalée, lorsqu’un modérateur la traite, alors la décision est humaine, proportionnée, traçable et susceptible d’un recours humain.
- Étant donné une œuvre publiée, lorsqu’un auteur demande sa dépublication, alors elle disparaît des surfaces publiques, de la recherche, des recommandations et des futurs exports EPUB ; ses commentaires et critiques associés sont masqués automatiquement. Les copies EPUB déjà téléchargées ne peuvent pas être rappelées.
- Étant donné une œuvre publiée, lorsqu’un auteur n’a pas donné de consentement EPUB distinct, alors aucun export EPUB n’est proposé.
- Étant donné le téléchargement autorisé d’un EPUB, lorsqu’un lecteur le télécharge, alors l’information associée indique que le téléchargement n’autorise ni redistribution ni republication.

### États, erreurs, accessibilité et comportements mobiles

Les déclarations, attestations, consentements, labels, motifs de signalement, décisions et voies de recours doivent être compréhensibles, accessibles au clavier et aux technologies d’assistance, et utilisables sur mobile. Les messages ne doivent pas affirmer qu’un outil détermine de manière certaine l’origine humaine ou IA d’un texte.

## Données, sécurité et droits

### Données créées/consultées/conservées

Les dépendances d’implémentation devront prévoir, sans préjuger du schéma, les informations nécessaires pour : déclaration IA courante ; horodatage et historique immuable des modifications ; attestation de droits ; consentement EPUB séparé et révocable ; état et date de dépublication ; signalement, décision, recours et journal minimal de modération.

La conception des modèles et la politique de conservation détaillée appartiennent aux issues dépendantes. Les données internes conservées après dépublication, notamment pour obligations légales, sécurité, résolution de litige ou journal de modération, devront respecter la politique de conservation à définir et être minimisées.

### Autorisations et contrôles d’accès

Seul l’auteur autorisé peut fournir ou modifier ses déclarations, attestations et consentements. Les informations de modération et les données de signalement suivent le principe du moindre privilège. Un signalement ou un détecteur éventuel ne constitue jamais, à lui seul, une décision définitive de retrait, de suppression ou de sanction.

Les protections anti-abus MVP sont proportionnées : vérification d’e-mail, limitations de débit et quotas graduels pour les parcours sensibles, catégories de signalement explicites (spam, automatisation, plagiat, IA non déclarée, contenu illicite, harcèlement) et décision humaine traçable. Les valeurs exactes de limitation seront spécifiées avec les parcours concernés ; aucune surveillance ou automatisation disproportionnée n’est introduite.

### Risques et mitigations

- **Droits d’auteur et diffusion** : attestation explicite, autorisation non exclusive limitée et information claire sur la dépublication.
- **IA non déclarée ou déclaration abusive** : règles publiques, signalement, examen humain, journal minimal et recours ; aucune prétention de détection infaillible.
- **Vie privée et représailles** : identité du signalant non exposée inutilement, accès restreint et données minimisées.
- **Copies distribuées** : export EPUB opt-in, retrait des exports futurs à la dépublication ou au retrait du consentement, impossibilité explicitée de rappeler les copies déjà téléchargées.

Les éléments suivants exigent une validation juridique avant mise en production : portée de l’autorisation de diffusion et de l’attestation de droits ; règles de retrait et leurs effets ; fondement, durée et accès aux données de compte, signalement, recours et audit ; procédure de modération, information des parties et traitement des contenus illicites. Cette spécification n’est pas un avis juridique.

## Conception et vérification

### Modules/ports/contrats touchés

Aucun module, port, contrat, table, migration ou API n’est créé par cette issue. Les futurs contrats et modules seront conçus par les issues d’exécution, conformément à l’architecture hexagonale, seulement lorsqu’un besoin concret l’exige.

### Répercussion obligatoire dans les issues dépendantes

- **#17 — Authentification** : exiger une adresse e-mail vérifiée pour la publication et protéger inscription, connexion, vérification et récupération contre les abus de façon accessible et proportionnée.
- **#20 — Import** : ne pas inférer ni décider automatiquement une déclaration IA depuis un fichier importé ; préserver la sécurité de l’import sans imposer de verdict sur l’origine du texte.
- **#22 — Cycle de vie / publication** : recueillir déclaration IA, attestation de droits et consentement EPUB séparé ; appliquer le label public ; tracer les modifications de déclaration ; dépublier toutes les surfaces publiques et masquer automatiquement commentaires et critiques associés.
- **#29 — EPUB** : réserver l’export aux œuvres publiées avec consentement distinct activé par défaut à « non » ; bloquer les exports futurs après retrait du consentement ou dépublication ; informer de l’interdiction de redistribution/republication.
- **#32 — Modération des œuvres** : intégrer les catégories de signalement et le traitement humain, proportionné, traçable, avec recours humain des déclarations abusives et des décisions de modération.
- **#35 — Modération des interactions** : garantir que les commentaires et critiques d’une œuvre dépubliée sont automatiquement masqués, sans choix de conservation publique par l’auteur, et que leur conservation interne respecte la politique de données.

### Décisions et ADR nécessaires

Aucun nouvel ADR n’est requis : la présente politique est une décision produit. Un ADR deviendra nécessaire seulement si une future implémentation impose un choix technique structurant et durable.

### Tests unitaires, intégration, E2E et sécurité

Chaque issue dépendante devra fournir des critères testables couvrant au minimum : autorisation auteur/refus tiers ; déclaration requise avant publication ; affichage et mise à jour immédiate du label ; audit de modification ; consentement EPUB absent, accordé, retiré ; dépublication et masquage des interactions ; signalement, accès administrateur, décision humaine et recours ; tests négatifs d’accès et d’abus. QA devra vérifier la cohérence exacte entre cette politique, les écrans, les API, la documentation et le comportement public.

### Documentation à mettre à jour

Les règles publiques, les textes d’attestation et de consentement, la politique de données, les parcours de recours et les guides opérationnels devront être versionnés lors des issues d’implémentation pertinentes et validés juridiquement avant mise en production.

### Questions nécessitant un arbitrage PO

Aucune question ne bloque la spécification. Restent volontairement à arbitrer avant production, avec conseil juridique : formulation contractuelle de l’autorisation de diffusion, politique de conservation, procédure détaillée de notification/recours et règles applicables à de futurs concours.
