# 0001 — Consigner les décisions dans des ADR

- Statut : Accepté
- Date : 2026-10-24

## Contexte

Les choix techniques du projet (rendu à la demande, ombres figées, matériaux Lambert, double backend) ne sont expliqués que dans des commentaires de code et dans des messages de commit comme « itération tablette 5 ». Un relecteur, ou un agent, qui ne connaît pas l'historique risque de défaire un compromis mesuré, ou de le payer une seconde fois.

## Décision

Toute décision structurante est consignée dans un ADR court sous `docs/adr/`, au format de [`0000-modele.md`](0000-modele.md), dans la PR qui l'introduit. Les décisions déjà prises sont consignées a posteriori (ADR 0002 à 0007).

## Conséquences

- Les revues peuvent pointer vers un ADR au lieu de réexpliquer.
- Écrire un ADR prend dix minutes de plus par PR concernée.
- Un ADR n'est jamais réécrit : il est remplacé par un nouveau, ce qui garde la trace du raisonnement.

## Alternatives considérées

- **Wiki GitHub** : il vit hors du dépôt, n'est pas relu en PR et se désynchronise.
- **Commentaires dans le code seulement** : ils disent comment, rarement pourquoi on n'a pas fait autrement.
