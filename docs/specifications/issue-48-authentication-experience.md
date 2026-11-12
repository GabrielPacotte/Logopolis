# Spécification — issue #48 : expérience d’authentification, e-mails locaux et fondations UI

- **Issue :** #48
- **Statut :** proposé pour revue du Product Owner
- **Dépendance bloquante :** #17 doit être fusionnée avant toute implémentation.
- **Portée :** expérience Web et environnement de développement. Cette spécification ne modifie pas les garanties d’identité ou de sécurité de #17.

## 1. Objectif

Rendre le parcours e-mail/mot de passe utilisable, compréhensible et accessible dans un navigateur, tout en permettant de consulter localement les messages de vérification et de récupération. Poser les fondations visuelles nécessaires aux premières interfaces Logopolis sans préjuger de la direction artistique complète.

## 2. Décisions produit approuvées

- Après une vérification réussie, l’utilisateur est redirigé vers la connexion avec une confirmation explicite ; aucune session n’est ouverte automatiquement.
- L’espace personnel minimal affiche seulement l’adresse e-mail, son statut de vérification, un message d’accueil et une action de déconnexion.
- Mailpit est réservé au développement local. Son interface utilise par défaut le port `8025`, son SMTP le port `1025`. Ces deux valeurs peuvent être surchargées localement lorsque le poste les utilise déjà.
- Les erreurs de validation doivent être explicites et accessibles. Les réponses où l’existence d’un compte est sensible restent neutres.
- Les parcours sont vérifiés de bout en bout avec Playwright et Mailpit.

## 3. E-mails de développement

### Comportement attendu

En développement local, le développeur peut lancer l’application et Mailpit avec la procédure documentée. L’interface Mailpit est atteignable uniquement depuis la machine locale et permet de consulter les e-mails de vérification et de réinitialisation pour suivre leur lien dans le navigateur.

La configuration Mailpit est sélectionnée explicitement pour le développement local. Elle n’est ni une valeur par défaut de production, ni disponible dans un déploiement, ni utilisée par la CI sauf environnement de test explicitement isolé et justifié.

Les messages de l’interface ne promettent jamais qu’un e-mail a été effectivement délivré à la boîte du destinataire. Ils décrivent uniquement l’action prise, par exemple : « Si l’adresse peut recevoir ce message, les prochaines étapes vous ont été indiquées. »

### Contraintes de sécurité

- Aucune clé, aucun compte externe et aucun secret ne sont nécessaires à Mailpit local.
- Mailpit ne doit pas être exposé sur une interface réseau publique par la configuration fournie.
- Les liens à jeton restent soumis aux protections, durées et règles de non-journalisation de #17.
- La documentation distingue clairement le transport local de la stratégie de messagerie de production.

## 4. Parcours Web

### Inscription

L’inscription recueille les données prévues par #17. Les erreurs de saisie identifient le champ et la règle concernée lorsqu’il est sûr de le faire. Une inscription acceptée mène vers l’état « attente de vérification ».

### Attente de vérification

Cette page explique que l’adresse doit être vérifiée, indique les prochaines étapes et présente l’action de renvoi uniquement dans ce contexte. Le renvoi conserve les réponses neutres et limites anti-abus de #17. La page propose un retour vers la connexion, sans afficher les actions non pertinentes.

### Vérification

Un lien valide affiche une confirmation, puis redirige vers la connexion. Le message explique que la connexion est nécessaire pour poursuivre. Un lien expiré ou déjà consommé affiche une information sûre, actionnable et accessible ; il ne révèle aucune donnée additionnelle.

### Connexion

La connexion présente uniquement les actions cohérentes avec cet état : créer un compte et récupérer l’accès. Elle n’expose pas le renvoi de vérification en permanence. Les réponses de sécurité définies dans #17 demeurent neutres lorsque cela protège l’existence du compte.

### Récupération et réinitialisation

La demande de récupération et sa confirmation restent neutres quant à l’existence d’un compte. Les erreurs de forme ou de mot de passe sont néanmoins précises si elles n’exposent aucune information sensible. Après une réinitialisation réussie, la personne est guidée vers la connexion.

### Espace personnel minimal

Une session authentifiée donne accès à une page contenant :
- l’adresse e-mail de la session ;
- un statut de vérification compréhensible ;
- un message d’accueil ;
- une déconnexion accessible.

Elle n’anticipe aucun profil public, œuvre, bibliothèque, préférence ou outil auteur.

## 5. Erreurs, confirmations et accessibilité

Les champs ont un label visible, une aide si nécessaire, un état invalide sémantique et une association programmatique avec leur message. Les erreurs au niveau du formulaire sont annoncées sans déplacer le focus de manière désorientante ; la soumission dirige de façon prévisible vers le premier problème lorsque pertinent.

Les informations de réussite, d’erreur et de chargement utilisent une sémantique annoncée aux technologies d’assistance. Tous les parcours sont utilisables au clavier, présentent un indicateur de focus visible et gardent des contrastes conformes au niveau AA de WCAG 2.2.

Les messages explicites sont autorisés pour :
- format e-mail invalide ;
- mot de passe ne respectant pas la politique ;
- confirmation de mot de passe différente ;
- jeton expiré ou déjà utilisé ;
- erreur technique temporaire sans détail interne.

Ils restent neutres pour toute réponse qui identifierait ou confirmerait un compte, notamment récupération, renvoi de vérification et refus de connexion selon les règles de #17. Ils ne contiennent jamais mot de passe, jeton, secret ou donnée personnelle superflue.

## 6. Fondations du design system

### Direction retenue

Logopolis adopte une identité **éditoriale classique**, inspirée de la proposition A :
- fond ivoire évoquant le papier ;
- encre sombre pour le contenu principal ;
- accents terre cuite limités aux repères et actions importantes ;
- ornements fins et discrets, jamais nécessaires à la compréhension.

Elle emprunte à la proposition B une **structure ouverte** : catalogues, lecture, bibliothèque et futurs profils ne sont pas contraints par une carte centrale encadrée. Les cartes peuvent servir aux tâches focalisées, dont l’authentification, mais ne constituent pas le gabarit global.

### Fondations à définir

- Une famille serif éditoriale pour titres, repères ou citations et une sans-serif fonctionnelle pour corps de texte, formulaires, navigation et données.
- Des échelles documentées pour texte, titres, espaces, rayons, bordures et élévations, limitées au besoin actuel.
- Des rôles de couleur sémantiques (surface, texte, action, succès, erreur, information, focus) avec contrastes vérifiés ; aucune couleur seule ne véhicule une erreur ou un statut.
- Des composants de base : champ, groupe de champ, bouton primaire/secondaire, lien, message système et conteneur de tâche focalisée.
- Des conventions de contenu : intitulés d’action clairs, message bref avant détail optionnel, et aucun ornement concurrent du texte.

Cette fondation n’est ni une bibliothèque de composants exhaustive, ni la direction artistique finale, ni un système de design destiné à être publié séparément.

## 7. Critères d’acceptation

- [ ] Le lancement local documenté rend Mailpit disponible sur `8025` et SMTP sur `1025` par défaut ; les deux ports sont configurables localement.
- [ ] Un navigateur peut parcourir inscription, consultation du message dans Mailpit, vérification, connexion et espace personnel minimal.
- [ ] Un navigateur peut parcourir demande de récupération, consultation du message dans Mailpit, réinitialisation et connexion avec le nouveau mot de passe.
- [ ] La vérification redirige vers la connexion avec confirmation et sans session automatique.
- [ ] Le renvoi de vérification n’est disponible que dans le parcours d’attente approprié et conserve des réponses neutres et limitées.
- [ ] Les erreurs accessibles sont spécifiques lorsqu’elles le peuvent sans affaiblir l’anti-énumération.
- [ ] L’espace personnel ne dépasse pas la portée minimale définie.
- [ ] Les fondations visuelles et les règles d’accessibilité sont documentées et appliquées aux écrans livrés.
- [ ] La configuration de production et de CI ne livre pas de messages vers Mailpit local.
- [ ] Aucun secret, jeton ou donnée sensible n’est exposé dans l’interface, les messages ou les journaux.

## 8. Vérification attendue

Le Developer fournit :
- des tests unitaires et de composants pour erreurs, messages, états et visibilité contextuelle des actions ;
- des tests fonctionnels préservant les protections de #17 ;
- des E2E Playwright pour les deux parcours complets avec Mailpit contrôlé ;
- une vérification automatisée d’accessibilité ciblée et une procédure de navigation clavier manuelle documentée.

Le QA & Security Engineer dérive ses scénarios de cette spécification et de #17, vérifie les protections anti-énumération, l’isolation de Mailpit, l’accessibilité, la cohérence code↔documentation et publie son verdict dans la PR.

## 9. Hors périmètre

SSO, MFA, changement d’adresse e-mail, cycle de vie du compte (#39), profil public, œuvres, bibliothèque, expédition d’e-mails réels depuis le développement, design marketing complet et système de composants généraliste.
