# Spécification — Issue #24 : confidentialité, suppression de compte et conservation

> Statut : prête pour revue humaine. Cette politique produit ne crée ni table, ni migration, ni API et n’autorise aucune implémentation métier.

## Contexte et objectif

- Issue : #24
- Problème utilisateur / hypothèse : une identité littéraire fiable suppose que chacun puisse se retirer sans que ses données ou contenus soient conservés de manière opaque ou disproportionnée.
- Objectif : fixer le cycle de vie minimal des comptes et données pour le MVP, avant leur collecte par les parcours d’authentification, de publication, d’interaction et de modération.
- Hors périmètre : avis juridique définitif, portabilité réglementaire exhaustive, comptes organisationnels, conservation d’œuvres après suppression au choix de l’auteur, et définition de schémas de données.
- Liens vision et ADR : [VISION.md](../../VISION.md), ADR 0001 ; politique éditoriale de l’issue #13.

## Comportement attendu

### Principes

Logopolis collecte et conserve uniquement les données nécessaires à une finalité définie. Toute catégorie de données possède une finalité, une base légale envisagée, une durée, un point de départ, des accès autorisés et un mécanisme d’effacement ou d’anonymisation documentés.

La **désactivation temporaire** et la **suppression définitive** sont deux actions distinctes :

- La désactivation suspend le compte pendant **30 jours**. Elle révoque les sessions, interdit toute action au nom du compte et retire immédiatement les contenus publics. L’utilisateur peut réactiver son compte pendant ce délai après vérification d’identité ; ses œuvres précédemment publiées restent dépubliées jusqu’à une republication explicite de sa part.
- La suppression définitive est une demande explicite, confirmée après ré-authentification. Elle ne comporte pas de période de grâce imposée : l’effacement des systèmes actifs intervient dans les meilleurs délais, sous réserve d’une exception légitime documentée. Elle est irréversible.
- Une désactivation non réactivée déclenche la suppression définitive au terme des 30 jours.

Aucun contenu ne demeure publiquement attribué à un compte supprimé.

### Acteurs et préconditions

- **Utilisateur authentifié** : désactive, réactive ou demande la suppression définitive de son compte.
- **Administrateur habilité** : peut seulement traiter une exception de conservation ou une demande de droits selon une procédure documentée ; il ne réactive pas un compte sans contrôle d’identité.
- **Préconditions de suppression définitive** : ré-authentification, confirmation explicite et proposition de téléchargement personnel des textes encore accessibles à l’auteur.

### Scénarios d’acceptation (Given/When/Then)

- Étant donné un utilisateur authentifié, lorsqu’il demande une désactivation, alors ses sessions sont révoquées, ses contenus sont retirés des surfaces publiques et un délai de réactivation de 30 jours lui est communiqué.
- Étant donné un compte désactivé depuis moins de 30 jours, lorsqu’un utilisateur vérifie son identité et demande la réactivation, alors son accès et ses données privées sont rétablis, sous réserve d’une restriction de modération active, mais ses œuvres précédemment publiées restent dépubliées jusqu’à une décision explicite de republication.
- Étant donné un auteur avant désactivation ou suppression, lorsqu’il demande son export personnel, alors il peut télécharger ses propres textes dans un format réutilisable. Cet export ne crée aucun droit de redistribution pour les lecteurs et ne se substitue pas au droit réglementaire éventuel à la portabilité.
- Étant donné un utilisateur qui confirme la suppression définitive, lorsqu’elle est enregistrée, alors le compte, les identifiants, brouillons, œuvres, commentaires et critiques sont retirés publiquement puis effacés des systèmes actifs dans les meilleurs délais. Les délais opérationnels d’effacement doivent être définis et approuvés avant l’implémentation.
- Étant donné une œuvre, un commentaire ou une critique rattaché à un compte supprimé, lorsqu’un lecteur, un moteur de recherche interne, une bibliothèque ou une route directe l’interroge, alors le contenu n’est pas accessible publiquement.
- Étant donné une donnée soumise à une obligation légale, à un litige identifié ou à un dossier de modération justifié, lorsqu’une suppression est exécutée, alors seule la donnée strictement nécessaire est conservée dans un archivage restreint, avec échéance et accès habilité.
- Étant donné une restauration de sauvegarde, lorsqu’elle contient un compte supprimé, désactivé ou un contenu retiré après la date de la sauvegarde, alors le mécanisme de restauration réapplique les suppressions et restrictions intervenues depuis avant toute remise en service public.

### États, erreurs, accessibilité et comportements mobiles

Les actions « désactiver », « réactiver » et « supprimer définitivement » sont distinctes dans l’interface et explicables avant confirmation. La réactivation indique explicitement que les œuvres antérieurement publiées ne sont pas republiées automatiquement. La suppression définitive indique son caractère irréversible, les exceptions éventuelles et les limites techniques sur les sauvegardes. Les parcours sont utilisables au clavier, avec technologies d’assistance et sur mobile. Les échecs n’exposent pas d’informations sur d’autres comptes.

## Données, sécurité et droits

### Registre de conservation produit — hypothèses à valider

| Catégorie                                                 | Finalité / base légale envisagée                                                                                | Durée et point de départ                                                                        | Accès                                                     | Effacement / anonymisation                                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Compte, e-mail, authentification, sessions et jetons      | Fourniture et sécurité du compte ; exécution du service / intérêt légitime à confirmer                          | Actif jusqu’à suppression définitive ; sessions et jetons révoqués dès désactivation            | Utilisateur, services autorisés ; secrets jamais lisibles | Effacement des données actives lors de la suppression ; invalidation immédiate des secrets                      |
| Brouillons, fichiers importés et document canonique       | Fourniture de l’outil éditorial ; exécution du service                                                          | Jusqu’à suppression définitive                                                                  | Auteur, services autorisés                                | Effacement dans les systèmes actifs ; aucune conservation éditoriale par défaut                                 |
| Œuvres, métadonnées publiques et consentements            | Publication demandée par l’auteur ; exécution du service / consentement selon le champ à confirmer              | Jusqu’au retrait ou à la suppression ; conservation privée pendant la désactivation de 30 jours | Auteur et lecteurs selon visibilité                       | Retrait public immédiat ; réactivation sans republication automatique ; effacement actif lors de la suppression |
| Commentaires, critiques, suivi et bibliothèque            | Fonctionnalités communautaires/personnelles ; exécution du service                                              | Jusqu’à suppression définitive ou retrait par l’utilisateur                                     | Auteur concerné et lecteurs selon visibilité              | Masquage immédiat puis effacement actif ; agrégats seulement s’ils sont anonymisés irréversiblement             |
| Signalements, décisions, recours et journal de modération | Prévention des abus, traitement des signalements et défense de droits ; intérêt légitime/obligation à confirmer | **Hypothèse : 12 mois après clôture** ; durée à justifier par finalité et risque                | Seuls rôles de modération habilités                       | Effacement ou anonymisation à échéance ; conservation exceptionnelle documentée                                 |
| Logs techniques courants                                  | Exploitation, diagnostic et fiabilité ; intérêt légitime à confirmer                                            | Durée courte, déterminée par nécessité opérationnelle lors de l’implémentation                  | Exploitation habilitée                                    | Rotation / effacement automatisé ; minimisation des identifiants et absence de contenu littéraire               |
| Journaux de sécurité                                      | Détection, enquête et réponse aux incidents ; intérêt légitime/obligation à confirmer                           | Durée distincte, proportionnée au risque et documentée avant production                         | Sécurité habilitée                                        | Archivage restreint puis effacement/anonymisation ; aucune durée uniforme prédéfinie                            |
| Sauvegardes                                               | Résilience et reprise ; intérêt légitime à confirmer                                                            | **Objectif technique : 35 jours maximum** après l’effacement actif                              | Opérations de restauration strictement habilitées         | Expiration par rotation ; toute restauration réapplique les suppressions et restrictions postérieures           |

Les bases légales et les durées définitives relèvent de la validation juridique et du registre formel de traitement avant production. Aucun journal ne conserve mot de passe, jeton d’accès ni contenu littéraire complet sans nécessité précisément justifiée.

### Autorisations et contrôles d’accès

La suppression définitive exige ré-authentification et confirmation, afin d’éviter une suppression accidentelle ou frauduleuse. Le compte désactivé ne peut plus ouvrir de session ni déclencher d’action. Les données conservées au titre d’une exception sont séparées des données actives, soumises au moindre privilège, journalisées de manière minimisée et ne sont jamais réemployées à des fins éditoriales, marketing ou de profilage.

L’export personnel est limité à l’auteur et à ses textes ; il doit être sécurisé, temporaire et sans partage public par défaut. Il est distinct de l’export EPUB pour les lecteurs et ne préjuge pas des modalités à définir pour la portabilité réglementaire.

### Risques et mitigations

- **Retrait incomplet** : retrait public immédiat, tests des routes directes, index interne, bibliothèques, caches applicatifs prévus et exports futurs.
- **Suppression abusive ou accidentelle** : ré-authentification, confirmation claire et désactivation réversible distincte.
- **Conservation excessive** : registre par catégorie, échéances, automatisation d’effacement et revue des exceptions.
- **Réapparition après restauration** : réapplication des suppressions/restrictions postérieures à la sauvegarde.
- **Investigation ou contentieux** : conservation limitée au strict nécessaire, isolée, avec justification et échéance.

La CNIL rappelle qu’une demande de suppression n’entraîne pas nécessairement l’effacement de toutes les données lorsqu’une obligation légale ou la défense de droits le justifie ; les durées de conservation doivent rester déterminées et proportionnées. Voir [CNIL — droit à l’effacement](https://www.cnil.fr/fr/comprendre-mes-droits/le-droit-leffacement-supprimer-vos-donnees-en-ligne) et [CNIL — durées de conservation](https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees).

## Conception et vérification

### Modules/ports/contrats touchés

Cette issue ne crée aucun module, port, contrat, table, migration ni API. Les modèles nécessaires seront introduits seulement dans les issues d’exécution concernées.

### Répercussion obligatoire dans les issues dépendantes

- **#17 — Authentification** : fournir les primitives d’identité, de session et de ré-authentification nécessaires ; le cycle de vie complet du compte est traité par #39.
- **#39 — Cycle de vie du compte** : mettre en œuvre désactivation, réactivation sans republication automatique, suppression définitive, export personnel, délais opérationnels d’effacement définis avant implémentation, et réapplication des retraits avant remise en service après restauration.
- **#20 — Import** : rendre exportables puis effaçables les fichiers et brouillons de l’auteur ; ne pas conserver les sources au-delà de la finalité.
- **#22 — Cycle de vie des œuvres** : retirer immédiatement les œuvres de toutes les surfaces publiques à la désactivation/suppression et effacer les œuvres actives lors de la suppression.
- **#23 — Lecture publique** et **#26 — Recherche** : ne jamais exposer une œuvre ou attribution retirée, y compris par route directe, index ou cache applicatif.
- **#28 — Bibliothèque** et **#30 — Suivi** : effacer les relations personnelles liées à un compte supprimé et empêcher toute restitution résiduelle.
- **#29 — EPUB** : bloquer les exports futurs dès désactivation ou suppression, sans prétendre rappeler les fichiers déjà téléchargés.
- **#31 — Interactions** et **#35 — Modération des interactions** : masquer immédiatement puis effacer commentaires et critiques liés au compte, sous réserve des exceptions de conservation.
- **#32 — Modération des œuvres** : gérer séparément les exceptions de conservation, les dossiers clos, les recours et les accès minimaux aux journaux de modération.

### Décisions et ADR nécessaires

Aucun nouvel ADR n’est requis : il s’agit d’une politique produit transverse. Un ADR pourra être requis si la future conception de sauvegarde ou d’archivage introduit un choix technique durable.

### Tests unitaires, intégration, E2E et sécurité

Les issues d’implémentation devront vérifier : révocation des sessions ; distinction désactivation/suppression/réactivation ; réactivation des seules données privées sans republication automatique ; retrait de toutes les surfaces publiques ; export personnel autorisé uniquement à l’auteur ; délais opérationnels d’effacement définis et testés ; accès restreint aux exceptions ; expirations documentées ; réapplication des suppressions et restrictions avant remise en service après restauration ; erreurs et parcours accessibles. QA vérifiera la conformité de l’implémentation et de la documentation avec ce registre.

### Documentation à mettre à jour

Avant production : politique de confidentialité, registre formel des traitements et de conservation, texte utilisateur de désactivation/suppression, procédure de demandes de droits, procédure de restauration et guide opérationnel de modération.

### Décisions provisoires nécessitant une validation juridique avant production

- bases légales précises par catégorie et formulation de l’information aux personnes ;
- durée de **12 mois après clôture** pour les dossiers de modération ;
- durées distinctes des logs techniques et journaux de sécurité ;
- critères, procédure et durée des exceptions de conservation (obligation légale, contentieux, sécurité) ;
- délais opérationnels d’effacement à faire approuver avant implémentation ;
- modalités complètes de droit d’accès, d’effacement, d’opposition, de limitation et de portabilité ;
- qualification, champ et garanties de l’export personnel.
