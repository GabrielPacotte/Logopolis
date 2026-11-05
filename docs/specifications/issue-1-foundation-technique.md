# Spécification — Issue #1 : fondation technique opérationnelle

## Contexte et objectif

- Issue : [#1](https://github.com/GabrielPacotte/Logopolis/issues/1).
- Problème utilisateur / hypothèse : une documentation seule ne démontre ni la qualité exécutable, ni les contrôles de sécurité, ni la délégation réelle nécessaires avant le premier module métier.
- Hors périmètre : Next.js, AdonisJS, PostgreSQL, authentification, schéma de données et toute fonctionnalité produit.
- Liens vision et ADR : `VISION.md`, ADR 0001 et ADR 0002 restent des propositions lorsque leur statut l'indique.

## Comportement attendu

- Un contributeur peut exécuter les commandes npm non interactives de qualité depuis un clone propre.
- Toute PR déclenche la CI de qualité et sécurité.
- La publication Wiki réussit explicitement sans secret et ne synchronise destructivement que `wiki/Logopolis/` lorsqu'elle est configurée.
- Les agents et règles GitHub ne sont décrits qu'avec les preuves et limites observables.

## Données, sécurité et droits

- Données créées/consultées/conservées : uniquement métadonnées de développement et dépendances verrouillées; aucune donnée utilisateur ni œuvre.
- Autorisations et contrôles d'accès : token Wiki dans GitHub Secrets, permissions Actions `contents: read`; règles de branche à compléter par le PO.
- Risques et mitigations : fuite de secret (ignore, exemple vide, scan), dépendance vulnérable (audit, Dependabot), contournement d'architecture (lint/script/revue), suppression Wiki (limitation au sous-dossier dérivé).

## Conception et vérification

- Modules/ports/contrats touchés : aucun module métier; structure verticale proposée et contrôlée.
- Décisions et ADR nécessaires : ADR 0001 précisé, toujours Proposé; licence, fournisseurs, droits, IA, RGPD et monorepo restent à arbitrer.
- Tests : formatage, lint, typecheck, Vitest, docs, scan secrets et audit npm exécutés dans la CI; tests E2E non applicables sans application.
- Documentation à mettre à jour : architecture, agents, sécurité, tests, workflow, DoD, gouvernance GitHub et livraison propre.
- Questions nécessitant un arbitrage PO : protections GitHub, équipes/CODEOWNERS, licence, Wiki/token et choix de monorepo.
