# Gouvernance GitHub vérifiée — issue #1

## État observé

Le QA a lu le ruleset actif `prod-protection` (identifiant `26631365`) et le run Actions `42075640026` du commit `38ed984`. À la date de cette vérification, le ruleset exigeait une approbation et l'historique squash/linéaire, mais **n'exigeait pas** de statut CI, CODEOWNERS, approbation après le dernier push ni résolution des conversations. `current_user_can_bypass` était `always`. Le connecteur ne pouvait pas lire l'ancienne API de protection (`403`), mais le ruleset était lisible. Ces constats ne remplacent pas une nouvelle vérification dans GitHub après configuration.

## Checklist exclusivement PO / administrateur GitHub

1. Dans **Settings → Rules → Rulesets**, cibler `main`, exiger une PR et au moins une approbation d'une identité autre que l'auteur.
2. Exiger les statuts de la CI (`Quality and security baseline`) et que la branche soit à jour avant fusion.
3. Activer l'approbation de la dernière poussée, la résolution de toutes les conversations et la revue CODEOWNERS.
4. Désactiver ou limiter strictement les contournements, les push directs et les force-push, y compris pour administrateurs et automatisations lorsque la politique du projet le permet.
5. Limiter la fusion à une équipe de mainteneurs distincte de l'auteur; créer les équipes GitHub nécessaires. GitHub contrôle des identités, pas le rôle narratif « QA ».
6. Créer un environnement de production avec approbation humaine; ne lui donner aucun secret avant besoin explicite.
7. Initialiser le Wiki, puis créer un jeton finement limité à ce Wiki/repository et le stocker comme secret `WIKI_PUSH_TOKEN`.

## CODEOWNERS

[`.github/CODEOWNERS.example`](../.github/CODEOWNERS.example) est un modèle intentionnellement inactif : le PO doit remplacer l'équipe fictive et le copier vers `.github/CODEOWNERS`. L'activer sans équipe réelle bloquerait les PR. Il désigne des propriétaires de chemins mais ne prouve ni la compétence QA ni une séparation d'identités à lui seul.
