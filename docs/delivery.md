# Procédure de livraison propre

Une archive de partage ne doit jamais être un copier-coller du dossier de travail : elle ne doit contenir ni `.git/`, ni dépendances installées, ni fichier `.env`, ni rapport local, ni métadonnée macOS `__MACOSX/` ou `.DS_Store`.

Depuis une révision validée, produire une archive reproductible avec Git :

```sh
git archive --format=tar.gz --prefix=logopolis-<version>/ -o logopolis-<version>.tar.gz <commit-ou-tag>
```

Vérifier le contenu avant partage :

```sh
tar -tzf logopolis-<version>.tar.gz
```

L'archive Git n'inclut pas `.git/` ni les fichiers ignorés. Exécuter `npm run check:secrets` avant l'archive, puis confirmer visuellement l'absence de secrets ou données non autorisées. Ne pas distribuer `node_modules/`, les résultats Playwright, bases locales ni œuvres privées.

## Licence

Le dépôt public ne comporte pas encore de licence. En l'absence de licence explicite, le code reste sous le régime par défaut de droits réservés : la consultation publique n'accorde pas automatiquement des droits de réutilisation. Le PO doit choisir et ajouter une licence avant d'inviter des contributions ou de publier du code réutilisable.
