# Spécification — Issue #17 : authentification par e-mail et mot de passe

> Statut : approuvée pour exécution par autorisation explicite du Product Owner. Le cycle de vie du compte défini par #39 est hors périmètre.

## Contexte et objectif

- Issue : #17
- Problème utilisateur / hypothèse : auteurs et lecteurs ont besoin d’une identité individuelle fiable sans fournisseur tiers, pour protéger leurs espaces privés et préparer la publication.
- Objectif : permettre inscription, vérification d’e-mail, connexion, déconnexion et récupération de mot de passe, avec des contrôles côté serveur et des parcours accessibles.
- Hors périmètre : SSO, connexion sociale, MFA, changement d’adresse e-mail avancé, profils publics, désactivation/réactivation/suppression de compte (#39), publication et gestion d’œuvre.
- Liens vision et ADR : [VISION.md](../../VISION.md), [ADR 0001](../adr/0001-modular-hexagonal-architecture.md), politiques #13 et #24, #25, #39.

## Comportement attendu

### Acteurs et préconditions

- Un visiteur peut créer un compte avec une adresse e-mail valide et un mot de passe conforme à la politique documentée.
- Un utilisateur non vérifié peut se connecter, consulter son état et demander un renvoi de vérification, mais ne peut pas effectuer une action explicitement réservée à un e-mail vérifié ; au minimum, aucune future publication ne doit être possible.
- Un utilisateur vérifié peut ouvrir et fermer sa session.
- Une récupération de compte est demandée avec une adresse e-mail ; la réponse publique est identique, que le compte existe ou non.
- Les fonctions de désactivation, réactivation et suppression ne sont pas exposées par cette issue.

### Scénarios d’acceptation (Given/When/Then)

- Étant donné une adresse e-mail encore inutilisée et un mot de passe valide, lorsqu’un visiteur s’inscrit, alors un compte non vérifié est créé, aucun mot de passe n’est stocké en clair et un message de vérification à usage unique est préparé.
- Étant donné une inscription déjà associée à une adresse, lorsqu’un visiteur tente de s’inscrire, alors le système ne crée pas de second compte et ne divulgue aucune information sensible ; l’expérience utilisateur reste exploitable.
- Étant donné un jeton de vérification valide, non consommé et non expiré, lorsqu’il est présenté, alors l’adresse du compte est marquée vérifiée et le jeton ne peut plus être réutilisé.
- Étant donné un jeton expiré, invalide ou déjà consommé, lorsqu’il est présenté, alors aucune vérification ni modification de compte n’intervient et le parcours propose une suite sûre.
- Étant donné un utilisateur non vérifié, lorsqu’il demande un renvoi, alors les envois sont limités de façon documentée et l’ancien jeton ne permet plus une vérification concurrente.
- Étant donné des identifiants valides, lorsqu’un utilisateur vérifié ou non vérifié se connecte, alors une session sûre est créée ; le statut de vérification est appliqué côté serveur aux actions qui l’exigent.
- Étant donné des identifiants invalides, lorsqu’un visiteur se connecte, alors aucun détail ne permet de distinguer adresse inconnue et mot de passe incorrect.
- Étant donné une session valide, lorsqu’un utilisateur se déconnecte, alors elle est invalidée et ne permet plus d’accéder à une ressource protégée.
- Étant donné une demande de récupération, lorsqu’une adresse existante ou inexistante est soumise, alors la réponse publique est équivalente. Pour un compte existant, un message à jeton unique et limité dans le temps est préparé.
- Étant donné un jeton de récupération valide, lorsqu’un nouveau mot de passe conforme est confirmé, alors le mot de passe est remplacé, le jeton devient inutilisable et les sessions antérieures sont invalidées.
- Étant donné une route protégée, lorsqu’aucune session valide n’est fournie, alors l’accès est refusé sans exposer de données privées.

### États, erreurs, accessibilité et comportements mobiles

Les formulaires sont utilisables au clavier, libellent leurs champs et erreurs, ne reposent pas uniquement sur la couleur et présentent des messages compréhensibles sur petit comme grand écran. Les réponses d’authentification n’exposent ni secret, ni jeton, ni existence de compte lorsque cela crée un risque d’énumération. Les erreurs de validation peuvent être précises avant création de compte ; les erreurs de connexion et de récupération restent neutres.

## Données, sécurité et droits

### Données créées/consultées/conservées

Cette issue introduit seulement les données minimales nécessaires : identifiant interne de compte, adresse e-mail normalisée, état et date de vérification, empreinte de mot de passe, sessions, et empreintes/échéances/états de consommation des jetons de vérification et de récupération. Les jetons bruts ne sont jamais persistés ni journalisés.

Les règles de conservation, désactivation, suppression, export personnel et restauration restent celles de #24 et seront implémentées dans #39. L’implémentation de #17 doit permettre cette évolution sans ajouter de mécanisme de suppression anticipé.

### Autorisations et contrôles d’accès

- Toutes les décisions d’identité, session et vérification sont prises côté serveur.
- Les mots de passe emploient l’algorithme de hachage adapté et configuré par le framework ; aucun mot de passe en clair ou réversible n’est conservé.
- Les jetons sont aléatoires, à usage unique, limités dans le temps, stockés sous forme d’empreinte et invalidés lors de leur remplacement ou consommation.
- Les cookies de session sont configurés de manière sûre pour l’environnement ; la protection CSRF est appliquée aux routes mutantes selon le mécanisme Adonis retenu.
- Les routes sensibles (inscription, connexion, renvoi, récupération et confirmation) sont soumises à une limitation de débit ou à des quotas graduels documentés, sans bloquer durablement un utilisateur légitime.
- L’envoi d’e-mail passe par un port/adaptateur testable ; les tests n’appellent aucun fournisseur réel. La configuration de production reste hors dépôt et le développement local ne doit pas exposer de jeton dans les journaux partagés.

### Risques et mitigations

- **Énumération de comptes** : réponse publique équivalente pour connexion et récupération ; limitation de débit.
- **Vol ou rejeu de jeton** : jeton unique, expirant, stocké sous forme d’empreinte, invalidation à la consommation/remplacement.
- **Fixation ou vol de session** : session régénérée et/ou invalidée selon les garanties du mécanisme retenu ; invalidation des sessions après réinitialisation.
- **Brute force et abus d’e-mail** : limites proportionnées, erreurs neutres et journalisation de sécurité minimisée.
- **Exposition de secrets** : aucun mot de passe ou jeton brut dans la base, les erreurs, logs, tests versionnés ou documentation.

## Conception et vérification

### Modules/ports/contrats touchés

Le Developer crée le module vertical minimal justifié pour l’identité, avec domaine, application, adaptateurs et composition HTTP dans `apps/api`, sans règle métier dans contrôleurs ni ORM. Les communications de session, persistance, horloge, génération de jeton et e-mail sont injectables derrière des ports lorsque cela améliore réellement testabilité et isolation. Aucun package partagé vide n’est créé.

Les fonctions métier, de sécurité, d’autorisation, de transformation ou non triviales portent le contrat JSDoc exigé par [les conventions](../conventions.md) : `{PRÉCONDITIONS} => {POSTCONDITIONS}`, avec refus, effets et invariants pertinents.

### Décisions et ADR nécessaires

Aucun nouvel ADR n’est requis à ce stade. Le Developer documente dans la PR le mécanisme Adonis choisi pour hachage, sessions, anti-CSRF, persistance et e-mail. Un fournisseur d’e-mail de production n’est pas figé : l’adaptateur et les variables d’environnement rendent ce choix substituable.

### Tests unitaires, intégration, E2E et sécurité

Le Developer livre des tests unitaires déterministes des règles et cas d’usage, notamment : normalisation/unicité, statut non vérifié, expiration/consommation/rejeu de jeton, politiques de mot de passe et invalidation de sessions.

Les tests d’intégration vérifient les routes et la persistance avec PostgreSQL éphémère : inscription, vérification, connexion, déconnexion, récupération, réinitialisation, accès protégé, refus, réponses neutres et limitations. L’envoi d’e-mail est doublé et inspectable sans service externe.

Le QA dérive d’abord ses scénarios des critères de cette spécification et de l’issue #17. Il examine ensuite les contrats JSDoc pour compléter les propriétés et cas limites, sans leur donner préséance sur la spécification. La revue couvre OWASP pertinent, accès non autorisé, fuite de secrets, énumération, rejeu, expiration, CSRF/session, limitations, accessibilité et cohérence documentation↔code.

### Documentation à mettre à jour

Mettre à jour les instructions de démarrage local, les variables d’environnement sans valeur secrète, les commandes de test, la documentation de sécurité, et les documents de module nécessaires. Documenter les parcours et limites sans inclure de jeton réel.

### Questions nécessitant un arbitrage PO

Aucune ne bloque l’exécution. Le fournisseur d’e-mail de production et les durées/valeurs exactes de limitation demeurent configurables et seront justifiés dans la PR ; ils ne constituent pas une promesse produit ni une donnée secrète.
