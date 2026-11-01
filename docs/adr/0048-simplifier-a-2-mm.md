# 0048 — Simplifier les modèles avec un écart d'au moins 2 mm

- Statut : Proposé
- Date : 2026-10-30
- Issue : à créer

## Contexte

- L'appartement affiche 92 900 triangles, la démo 44 000. Les draw calls tiennent le budget depuis l'[ADR 0011](0011-fusion-des-meshes-des-modeles.md), mais chaque triangle est traité par la passe principale et par chaque carte d'ombre, sur un Adreno 610.
- Ces triangles partent dans de petits objets très détaillés : les touches d'un clavier (216 triangles pour 2 cm, 17 000 en tout), les boutons des placards de cuisine (384 chacun), les poignées d'une commode (720 chacune). `optimize-model.sh` simplifiait avec un écart de 0,05 % de la taille de chaque objet : 0,01 mm sur une touche, donc rien.
- Les objets sans texture gardaient leurs UV. Leurs coutures empêchent `weld` de souder les sommets, et le simplificateur ne réduit pas une couture.
- Les quatre chaises de la salle à manger (10 800 triangles) sont faites de bandes de faces ouvertes. Aucun écart ne les simplifie, même 1 cm. La démo, qui a les mêmes, les a remplacées à la main par des chaises simples de 72 triangles (itération tablette 6).
- À la distance de la caméra, un pixel couvre 4 à 8 mm dans la vue d'une pièce (11,4 m, champ de 30°) et environ 2 cm dans la vue d'ensemble.

## Décision

`scripts/optimize-model.sh` simplifie chaque objet avec un écart de 0,05 % de sa taille, et d'au moins 2 mm. Il retire d'abord les attributs que rien ne lit (`prune --keep-attributes false`), dont les UV des objets sans texture.

- La CLI ne règle qu'un écart relatif, le même pour tous les objets. Quelques lignes de `node` appellent donc `simplifyPrimitive` objet par objet, avec l'écart `max(0,0005, 0,002 / taille)`. `taille` est celle que meshoptimizer utilise pour un écart relatif (`getScale`). Les modules viennent de la CLI gltf-transform, comme dans `bake-lighting.sh` : aucune dépendance de plus.
- La simplification reste avant la fusion, sur l'export Blender d'origine.
- Un objet que la simplification ne réduit pas se remplace dans Blender par une forme simple. Pour l'appartement, les quatre chaises ont été remplacées sur l'export avant `optimize-model`, par les mêmes chaises que la démo, aux mêmes position, orientation et dimensions.

## Conséquences

- Sur l'appartement, de 85 300 à 32 300 triangles dans le fichier, et de 92 900 à 37 700 affichés avec le calque de fondu des murs. Le fichier passe de 1,33 Mo à 674 Ko. Les 94 primitives, les 19 lumières, la caméra et les matériaux sont identiques.
- Sans le remplacement des chaises, le script seul donne 41 400 triangles et 920 Ko.
- **Mesuré** avec `pnpm bench` sur le build de production, Chrome sur Mac M4, 1280 × 800 à DPR 2 : 95 draw calls avant comme après. Le temps GPU par image varie d'un lancement à l'autre entre 3,4 et 4,6 ms, avant comme après : ce GPU n'est pas limité par les sommets. Le gain vise la tablette, qui traite chaque sommet une fois par passe et par carte d'ombre, et le chargement. La tablette n'est pas mesurée.
- **L'appartement tient désormais le budget avec ses cartes de lumière** ([ADR 0046](0046-eclairage-precalcule-dans-blender.md)) : 947 Ko pour le modèle précalculé, 1,96 Mo avec les cartes. L'ancien modèle précalculé pesait à lui seul 1,78 Mo.
- `prune` laisse sans UV les objets sans texture. Pour eux, `bake-lighting.py` créait un premier jeu d'UV que Blender initialise face par face, ce qui découpait tous les sommets : 69 000 au lieu de 50 300 sur l'appartement, et 1,15 Mo au lieu de 947 Ko. Ces UV sont désormais nulles.
- Les dessus de murs de l'appartement gardent des traînées grises dans les cartes, avec l'ancien modèle comme avec le nouveau : ce sont les faces superposées que l'ADR 0046 signale déjà.
- Avec l'ancien écart et sans `prune`, la simplification objet par objet redonne le modèle d'avant à l'octet près : elle équivaut à la CLI.
- À la distance de l'application, les captures ne montrent aucune différence. Au pincement, de très près, les touches du clavier s'arrondissent.
- Les chaises remplacées ne vivent que dans le modèle optimisé : un nouvel export Blender les ramène. Pour que ce soit durable, il faut les remplacer dans le modèle source.
- `Demo.glb` n'est pas regénéré, pour la même raison que dans l'ADR 0011.

## Alternatives considérées

- **Un écart relatif plus grand pour tous** : 0,5 % ferait 2,5 cm sur un mur de 5 m.
- **Simplifier après la fusion**, ce que fait `optimize-model` relancé sur un modèle déjà optimisé : l'écart devient relatif à toute la maison, environ 8 mm partout, pour 52 000 triangles.
- **3 mm** : 36 100 triangles au lieu de 41 400 sans les chaises, mais les touches du clavier ondulent dès qu'on zoome.
- **Le drapeau `Permissive` de meshoptimizer**, qui réduit à travers les coutures : 5 000 triangles de moins, au risque de normales et d'UV faussées sur les arêtes vives, et les chaises ne bougent presque pas.
- **Le drapeau `ErrorAbsolute`** : le même résultat, au prix d'un simplificateur à envelopper.
