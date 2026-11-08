# Authentification e-mail et mot de passe

L’API expose l’inscription, la vérification d’e-mail, la connexion/déconnexion et la récupération de mot de passe décrites par la spécification de l’issue #17.

Les mots de passe sont hachés par le service de hachage Adonis (scrypt) avant persistance. Les jetons de vérification et de récupération sont aléatoires, stockés uniquement sous forme d’empreinte SHA-256, valables 60 minutes et consommables une seule fois. Un remplacement invalide le jeton précédent du même type.

Les demandes d’inscription, connexion, renvoi de vérification et récupération sont limitées à cinq tentatives par adresse et par action pendant quinze minutes. La présentation d’un lien de vérification ou de réinitialisation est également limitée, sur l’empreinte du jeton et sans jamais persister son secret. Le compteur PostgreSQL est un `INSERT … ON CONFLICT … DO UPDATE` conditionnel : il reste correct lorsque plusieurs requêtes arrivent simultanément. Les réponses de connexion et de récupération restent neutres pour ne pas confirmer l’existence d’un compte.

Les sessions sont persistées dans PostgreSQL, protégées par les cookies de session Adonis et invalidées après réinitialisation du mot de passe. Les routes mutantes utilisent la protection CSRF d’Adonis Shield. Les flux Web sous `/auth` couvrent l’inscription, la connexion, le renvoi de vérification, la récupération, la réinitialisation, l’état de session et la déconnexion. Chaque formulaire est utilisable au clavier, possède des libellés explicites, un focus visible et un retour textuel. Les pages de vérification et de réinitialisation imposent `Referrer-Policy: no-referrer`. Les mutations initialisent le cookie XSRF par `GET /auth/csrf`, puis transmettent ce jeton à l’API avec les cookies. Un utilisateur non vérifié peut ouvrir une session, mais les futures routes réservées à une publication devront vérifier son statut côté serveur.

## Frontières d’architecture

Les cas d’usage de `identity/application` ne connaissent ni Lucid, ni PostgreSQL, ni Resend, ni l’horloge système, ni les primitives cryptographiques, ni la session Adonis. Ils dépendent de ports explicites pour la persistance, la limitation, l’e-mail, le hachage, les jetons, l’horloge et la session. Les adaptateurs PostgreSQL, Resend/boîte de test, crypto/horloge et session Adonis sont composés dans `apps/api/app/services/identity_authentication_service.ts`. Les opérations de consommation de jeton et de réinitialisation de mot de passe sont transactionnelles : le `UPDATE … WHERE consumed_at IS NULL AND expires_at > now RETURNING` décide l’unique gagnant avant toute modification de compte ou de session.

L’inscription concurrente utilise `ON CONFLICT DO NOTHING` : aucune exception de doublon — qui pourrait contenir une adresse e-mail dans les journaux PostgreSQL — n’est remontée. Une connexion avec une adresse inconnue effectue tout de même un travail de hachage avant le refus neutre, afin de réduire l’écart de durée observable. C’est une mitigation et non une garantie temporelle absolue sur une requête réseau complète.

## Développement local

Copier `apps/api/.env.example` vers `apps/api/.env`, générer `APP_KEY`, démarrer PostgreSQL 16 puis appliquer les migrations :

```sh
npm run migration:run --workspace=api
```

En développement et dans les tests, les e-mails transactionnels sont capturés en mémoire : aucun fournisseur réel n’est appelé. En production, l’adaptateur HTTP utilise Resend. `RESEND_API_KEY` est un secret de production hors dépôt et le domaine de `MAIL_FROM_ADDRESS` doit être vérifié dans Resend avant toute mise en service ; sans cette vérification, les messages ne doivent pas être considérés comme délivrables.

L’URL publique de l’application et les secrets restent hors dépôt. Le cycle de désactivation, réactivation et suppression de compte demeure hors périmètre et relève de l’issue #39.
