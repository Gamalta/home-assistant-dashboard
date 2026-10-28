# 0041 — Carte des températures dans le menu rapide

- Statut : Proposé
- Date : 2026-10-26
- Issue : à créer

## Contexte

L'[ADR 0035](0035-carrousel-de-cartes-et-actions.md) réserve le menu rapide aux scripts Home Assistant, et écarte les scénarios codés dans le dashboard. Le propriétaire veut que « Température » affiche la carte des températures. Un script ne peut pas changer l'affichage du dashboard.

La carte existe déjà : l'option `heatmapShader`, dans la modale Système, colore le sol et ne garde que les étiquettes de thermomètre et de climatisation. Elle est mémorisée avec les options graphiques, et multiplie le temps GPU par 2,7 sur la démo.

## Décision

Le menu rapide porte une action « Température », intégrée au dashboard, en tête et avant les scripts. Elle bascule l'option `heatmapShader` existante, dont l'interrupteur quitte la modale Système : le menu rapide devient le seul accès à la carte.

- L'action est une case à cocher de menu (`menuitemcheckbox`), en surbrillance quand la carte est affichée.
- Le menu apparaît même sans scénario configuré.
- `script.temperature` quitte la démo et son mock.

## Conséquences

- Aucun nouvel état : `heatmapShader` reste mémorisée avec les options graphiques, et un choix fait avant la mise à jour est conservé.
- La carte reste affichée après un rechargement, avec son coût GPU, jusqu'à ce qu'on la coupe.
- Le menu mélange des scripts et une action du dashboard. Une autre action d'affichage suivrait le même motif.

## Alternatives considérées

- **Un mode non mémorisé**, dans `AppContext` comme l'essai de l'éclairage : un second état, et une migration pour ignorer l'option déjà mémorisée.
- **Un type d'entrée dans `sideBar.scenarios`** (`{type: 'heatmap'}`) : une union à typer et à documenter pour une action que toutes les maisons veulent.
- **Garder l'interrupteur dans la modale Système** : deux accès au même réglage, dont un caché derrière le dock, parmi les options graphiques.
