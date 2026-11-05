# ADR 0002 — Documentation versionnée, Wiki dérivé

- Statut : Proposé
- Date : 2026-11-05

## Contexte

La documentation doit être révisable avec le code et aussi lisible dans un Wiki GitHub.

## Décision

Conserver la source exclusivement sous `docs/`. Une action GitHub publiera son contenu dans le sous-espace `Logopolis/` du Wiki après fusion dans `main`, uniquement si le Wiki est initialisé et le secret requis configuré.

## Conséquences

Les modifications directes dans `Logopolis/` seront écrasées à la publication suivante; les autres pages du Wiki restent intactes. La première activation demande une initialisation et une configuration par le PO/admin.
