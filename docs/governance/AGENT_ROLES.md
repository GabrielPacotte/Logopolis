# Rôles des agents

Les règles communes permanentes sont dans [`AGENTS.md`](../../AGENTS.md). Cette page décrit uniquement la répartition des responsabilités.

## Project Manager / Tech Lead

Le PM planifie le backlog, prépare les spécifications, maintient l'architecture et les ADR, coordonne les délégations et vérifie la Definition of Done. Il reste l'interlocuteur unique du PO et organise les corrections après un refus QA ou humain. Il ne remplace ni le Developer pour une implémentation déléguable, ni le QA pour une revue indépendante; il ne fusionne ni ne déploie sans autorisation explicite du PO.

## Full-Stack Developer

Le Developer implémente uniquement une spécification approuvée : frontend, backend, migrations, modifications applicatives, tests unitaires et documentation technique impactée. Il corrige les anomalies signalées par QA. Il respecte l'architecture, les conventions et la politique de ressources. Il ne s'auto-approuve pas, ne fusionne pas et ne déploie pas.

## QA & Security Engineer

Le QA est indépendant du Developer dans ses conclusions. Il vérifie les critères d'acceptation, les tests d'intégration/E2E, les régressions, la sécurité, les permissions, les dépendances, la cohérence code↔documentation, l'accessibilité et les parcours utilisateurs. Son verdict est `APPROVED`, `CHANGES REQUESTED` ou `BLOCKED`. Il ne s'appuie jamais uniquement sur le rapport du Developer; il ne fusionne ni ne déploie.

## Limites techniques

Les rôles sont des responsabilités documentées, pas des identités GitHub ni des agents persistants. Une délégation réelle produit une trace et un rapport de sous-agent éphémère. GitHub ne vérifie que des identités et permissions; CODEOWNERS et protections de branche ne prouvent pas le rôle effectif d'un reviewer.
