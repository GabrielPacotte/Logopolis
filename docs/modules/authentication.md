# Authentification e-mail et mot de passe

L’API expose l’inscription, la vérification d’e-mail, la connexion/déconnexion et la récupération de mot de passe décrites par la spécification de l’issue #17.

Les mots de passe sont hachés par le service de hachage Adonis (scrypt) avant persistance. Les jetons de vérification et de récupération sont aléatoires, stockés uniquement sous forme d’empreinte SHA-256, valables 60 minutes et consommables une seule fois. Un remplacement invalide le jeton précédent du même type.

Les demandes d’inscription, connexion, renvoi de vérification et récupération sont limitées à cinq tentatives par adresse et par action pendant quinze minutes. Les réponses de connexion et de récupération restent neutres pour ne pas confirmer l’existence d’un compte.

Les sessions sont persistées dans PostgreSQL, protégées par les cookies de session Adonis et invalidées après réinitialisation du mot de passe. Les routes mutantes utilisent la protection CSRF d’Adonis Shield. Un utilisateur non vérifié peut ouvrir une session, mais les futures routes réservées à une publication devront vérifier son statut côté serveur.

## Développement local

Copier `apps/api/.env.example` vers `apps/api/.env`, générer `APP_KEY`, démarrer PostgreSQL 16 puis appliquer les migrations :

```sh
npm run migration:run --workspace=api
```

En développement et dans les tests, les e-mails transactionnels sont capturés en mémoire : aucun fournisseur réel n’est appelé. En production, l’adaptateur HTTP utilise Resend. `RESEND_API_KEY` est un secret de production hors dépôt et le domaine de `MAIL_FROM_ADDRESS` doit être vérifié dans Resend avant toute mise en service ; sans cette vérification, les messages ne doivent pas être considérés comme délivrables.

L’URL publique de l’application et les secrets restent hors dépôt. Le cycle de désactivation, réactivation et suppression de compte demeure hors périmètre et relève de l’issue #39.
