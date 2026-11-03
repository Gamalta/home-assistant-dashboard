# 0053 — Unir les murs avant le précalcul de l'éclairage

- Statut : Proposé
- Date : 2026-11-02
- Issue : à créer

## Contexte

- Le propriétaire trouve de « vilaines ombres bien moches » sur l'appartement : des taches sombres en marches d'escalier sur le dessus des murs, aux jonctions. Sans les cartes de lumière de l'[ADR 0046](0046-eclairage-precalcule-dans-blender.md), elles disparaissent.
- Les murs des modèles sont des blocs qui s'interpénètrent à leurs jonctions : le dessus de l'un recouvre celui de l'autre, dans le même plan. On compte 877 paires de triangles de murs coplanaires qui se chevauchent sur l'appartement, dont 366 sur le dessus des murs, et 383 sur la démo.
- Dans Cycles, un rayon qui part d'une face rencontre aussitôt sa jumelle : chacune s'assombrit plus ou moins, selon les rayons. À l'affichage, les deux faces se disputent le tampon de profondeur avec des cartes différentes, et la tache suit la grille des texels, d'où les marches. L'ADR 0046 citait ce défaut pour les meubles, l'[ADR 0048](0048-simplifier-a-2-mm.md) pour les « traînées grises » sur les murs.

## Décision

`scripts/bake-lighting.py` unit les murs avant de déplier le modèle : le modèle réécrit par `pnpm bake-lighting` n'a plus qu'une face là où deux se recouvraient.

- Les faces des murs (même règle de nom que `SceneMaterials`) sont séparées dans un objet à part, unies avec le solveur exact de Blender (`intersect_boolean`, union de l'objet avec lui-même), refondues là où l'union a découpé un même plan (`dissolve_limited` à 1°) et débarrassées des arêtes de moins d'un demi-millimètre qu'elle a créées (`dissolve_degenerate`), puis rattachées à leur objet.
- `bake-lighting.sh` retire le second jeu d'UV du modèle qu'il reçoit : un modèle déjà précalculé se recalcule sans repasser par `optimize-model`, dont le remplacement des chaises est manuel.
- La démo et l'appartement sont recalculés.
- `src/configs/models.test.ts` vérifie que, dans un modèle précalculé, aucun triangle du plan horizontal le plus haut, celui du dessus des murs, n'en recouvre un autre.

## Conséquences

- **Taches** : sur l'appartement, le dessus des murs se recouvrait sur 1,2 m², 5 % de sa surface ; il reste 140 cm², dont 136 sous un meuble qui monte jusqu'au plafond et entre dans un mur. Sur la démo, de 0,19 m² à rien. Les jonctions de la vue signalée s'éclairent comme le reste du mur, de jour comme de nuit.
- **Géométrie** : l'union seule doublait les triangles des murs. Refondre les faces, retirer les arêtes de moins de 2 mm sur des triangles, puis refondre à nouveau, les ramène de 5 400 à 5 000 sur l'appartement, et de 7 900 à 8 600 sur la démo.
- **Poids** : l'appartement passe de 954 à 975 Ko, la démo de 710 à 742 Ko. Les cartes sont désormais encodées avec l'effort 6 de WebP, à qualité égale : 5 % plus légères. Avec elles, l'appartement passe de 1,97 à 1,94 Mo, la démo reste à 1,59 Mo.
- **Mesuré** avec `pnpm bench` sur le build de production, Chrome sur Mac M4, 1280 × 800 à DPR 2, deux fois : mêmes draw calls (44 et 95), mêmes programmes, aucun compilé pendant une rotation ; les temps CPU et GPU varient autant d'un lancement à l'autre qu'entre avant et après. La tablette n'est pas mesurée.
- L'union prend quelques secondes de plus au précalcul.
- Les meubles qui se chevauchent dans un même plan restent noirs, comme l'armoire et la vitrine du séjour de la démo.
- La règle qui reconnaît un mur vit maintenant à trois endroits : `SceneMaterials`, `optimize-model.sh` et `bake-lighting.py`. La démo, optimisée avant qu'`optimize-model.sh` n'écrive le rôle des matériaux, empêche de lire ce rôle.
- Le test borne le recouvrement à 0,2 % du plan le plus haut. Il porte sur les modèles présents : la démo en CI, l'appartement en local.

## Alternatives considérées

- **Unir les murs sans les séparer** : Blender redécoupe toutes les faces de l'objet, meubles compris. La démo, faite d'un seul objet, passait de 36 200 à 63 400 triangles.
- **Refondre les faces sans passer par des triangles** : le retrait des petites arêtes replie certaines faces sur elles-mêmes, et 870 cm² de dessus de murs se recouvrent encore sur l'appartement.
- **Unir aussi les meubles** : le solveur exact suppose des volumes fermés, ce que ne sont pas les meubles faits de bandes ouvertes.
- **Découper les faces les unes par les autres, puis supprimer les doublons** : autant de code, et les bouts de murs enfouis dans un autre resteraient, noirs, à occuper la carte.
- **Décaler les faces pendant le calcul** : celle du dessous resterait noire, et les deux se disputeraient toujours le tampon de profondeur.
- **Cartes de 4096 px, ou débruitage** : les marches s'affinent, mais une face masquée reste sombre.
- **Corriger les murs dans Blender, maison par maison** : à refaire à chaque export.
