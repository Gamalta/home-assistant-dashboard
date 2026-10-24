# 0016 — Tuiles de raccourcis dans la barre latérale

- Statut : Proposé
- Date : 2026-10-24
- Issue : #15

## Contexte

Plusieurs fonctionnalités concernent toute la maison et pas une pièce : tout éteindre, consommation électrique, crédit, liste de courses, prochains trains. Les éléments de pièce (étiquettes dans la scène 3D) ne leur conviennent pas, et le dock caché de la barre latérale est trop peu visible pour un usage quotidien. La barre latérale contient une carte vide sous les personnes.

## Décision

La carte vide accueille une grille de tuiles décrites par `sideBar.shortcuts`, une union discriminée par `type` (`ShortcutConfigType` dans `src/configs/sidebar.d.ts`).

- `SideBar/Shortcuts/index.tsx` affiche la grille et choisit le composant selon `type`, comme `RoomItem` pour les éléments de pièce.
- Chaque type de tuile est un composant `<Type>Shortcut`. Il rend un `ShortcutTile` (icône, libellé, valeur courte) et sa modale, qui partagent le même `layoutId` pour l'animation d'ouverture, comme les éléments de pièce.
- Ajouter une tuile revient à ajouter un type à l'union, un `case` dans la grille et un composant.

## Conséquences

- Une tuile ne coûte rien à la scène 3D.
- L'ordre et la présence des tuiles sont propres à chaque maison.
- La grille s'adapte à la largeur de la barre latérale (`auto-fill`). Au-delà d'une dizaine de tuiles, il faudra une autre présentation.

## Alternatives considérées

- **Boutons dans le dock** : cachés derrière un geste, donc peu adaptés à des actions quotidiennes.
- **Cartes fixes codées en dur** : chaque maison n'a pas les mêmes équipements.
- **Éléments de pièce dans la scène** : ces actions ne sont rattachées à aucune pièce.
