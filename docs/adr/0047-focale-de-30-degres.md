# 0047 — Filmer la maison avec une focale de 30°

- Statut : Proposé
- Date : 2026-10-29
- Issue : à créer

## Contexte

- La caméra a un champ vertical fixe de 75°. Elle se place à la position de la caméra du modèle, mais ignore son champ (22,9° sur la démo), et vise l'origine.
- À 75° de près, la perspective déforme la maison : les murs du premier plan sont immenses et doivent s'effacer, ce qui laisse des pans translucides devant la vue.
- Les rendus d'architecte que vise le propriétaire sont vus de haut avec une focale longue, autour de 25 à 30°. Sur une planche de captures, il a choisi 30°, en gardant le cadrage de la maison entière.
- L'effacement des murs dépend de la distance à la caméra en mètres : un mur s'efface à moins de 8 m ([ADR 0011](0011-fusion-des-meshes-des-modeles.md)).
- Le vol vers une pièce place la caméra à 4 unités de la pièce, réglage fait pour 75° ([ADR 0039](0039-vol-de-camera-vers-une-piece.md)).

## Décision

Le champ vertical passe à 30°. Pour garder le cadrage, chaque caméra recule de tan(37,5°) / tan(15°), soit 2,86 fois (`FRAMING` dans `src/utils/camera.ts`) :

- `useModelCamera` multiplie la position de la caméra du modèle depuis l'origine, la cible d'`OrbitControls` ;
- le vol vers une pièce se place à 4 × 2,86 unités de la pièce au lieu de 4. La pièce remonte au-dessus du carrousel par un décalage de la projection, compté en pixels : il ne dépend pas du champ.

Les réglages de l'effacement des murs ne changent pas.

## Conséquences

- La vue d'ouverture montre la même maison, sans déformation : les murs restent droits et parallèles, comme sur une maquette.
- À la distance d'ouverture (environ 30 m sur la démo), aucun mur n'est à moins de 8 m : les murs du premier plan restent pleins et cachent une bande de la pièce derrière eux, comme sur les rendus de référence. Ils s'effacent de nouveau quand on zoome.
- Mesurée avec l'éclairage précalculé de l'ADR 0046, la scène coûte 5,0 ms de GPU par image au lieu de 7,5 ms sur M4. Les deux changements sont mesurés ensemble, et le fondu des murs, vide à l'ouverture, y contribue.
- Le zoom et la rotation d'`OrbitControls` sont inchangés : le zoom est proportionnel à la distance.
- Les étiquettes des pièces gardent leur taille à l'écran : elles ne dépendent pas de la distance.
- Une caméra de modèle placée pour 75° reste juste. Une nouvelle maison se cadre comme avant, en imaginant un champ de 75°.
- Zoomer de près montre les limites de l'éclairage précalculé : la résolution de ses cartes se voit dès qu'une pièce remplit l'écran ([ADR 0046](0046-eclairage-precalcule-dans-blender.md)).

## Alternatives considérées

- **Lire le champ de la caméra du modèle** : 22,9° sur la démo, depuis une position pensée pour 75°, la vue ne montrerait qu'une partie de la maison. Il faudrait replacer la caméra de chaque modèle.
- **Caméra orthographique** : vraie vue isométrique, mais `OrbitControls` zoome alors par l'échelle et non par la distance, l'effacement des murs par la distance ne marche plus, et le vol vers une pièce est à refaire.
- **30° en reculant moins (×2)** : la pièce de vie remplit mieux l'écran, mais les pièces du bord sortent du cadre d'ouverture.
- **Garder 75°** : c'est la déformation qui éloigne le plus le rendu des références.
