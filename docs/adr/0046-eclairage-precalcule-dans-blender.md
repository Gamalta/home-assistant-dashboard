# 0046 — Précalculer l'éclairage dans Blender

- Statut : Proposé
- Date : 2026-10-29
- Issue : à créer

## Contexte

- Le propriétaire trouve la maison terne, de jour comme de nuit. Il vise les rendus d'architecte qu'on trouve en ligne : ombres douces, coins assombris, taches de soleil. Ces images sont calculées hors ligne, par des rayons qui rebondissent.
- Depuis l'[ADR 0030](0030-eclairage-ciel-soleil-sans-reflets.md), la maison est éclairée par une lumière hémisphérique et un soleil sans ombre. Ni l'une ni l'autre ne savent qu'un mur ou un meuble est proche. Cet ADR citait déjà l'occlusion précalculée comme « le meilleur gain de réalisme restant ».
- Trois ambiances réglées à la main ont été essayées : Clair doux, Maquette (occlusion simulée par une carte vue de dessus) et Plein soleil (ombre du soleil en temps réel). « Clair doux est le moins pire, mais reste loin des jolis rendus d'internet. »
- Contraintes : le GPU de la tablette (Adreno 610) est le facteur limitant ; la journée ne doit recompiler aucun shader (ADR 0030) ; `SceneMaterials` est le seul à modifier les matériaux ([ADR 0004](0004-scenematerials-proprietaire-unique.md)) ; un modèle pèse 2 Mo au plus ([ADR 0009](0009-budget-performance-tablette.md)).

## Décision

L'éclairage du ciel et du soleil est calculé une fois, dans Blender, et lu dans deux cartes de lumière.

**Le calcul** : `pnpm bake-lighting <modèle.glb>`, sur un modèle déjà optimisé.

- Le modèle est décompressé (Blender ne lit pas Meshopt), puis Blender 5 le déplie sur un second jeu d'UV (`TEXCOORD_1`) : projection intelligente, même échelle pour toutes les faces, 3 texels de marge.
- Cycles calcule la lumière diffuse reçue, directe et indirecte (4 rebonds, 512 échantillons), sans la couleur des matériaux, dans deux cartes de 2048 px : le ciel blanc seul, et le soleil seul (élévation 40°, azimut 220°). Un sol gris sous la maison renvoie la lumière. Lampes et émissions sont éteintes.
- Les cartes stockent la lumière divisée par 1,5, en sRGB sur 8 bits, puis sont converties en WebP (qualité 90) à côté du modèle : `Demo-sky.webp`, `Demo-sun.webp`. Le modèle repasse en Meshopt.
- Les outils viennent de la CLI gltf-transform déjà utilisée par `optimize-model.sh` (décodeur Meshopt, sharp) : aucune dépendance de plus dans le projet.

**L'affichage**, en WebGL :

- La config de la maison donne les cartes (`lightMaps`). `useLightMaps` les charge, sans mipmaps : une lumière douce n'en a pas besoin.
- `SceneMaterials` les applique par `backend.applyBakedLight` : la carte du ciel devient la `lightMap` du matériau Lambert, et le shader remplace l'irradiance de la lightMap par 1,5 π × (ciel × couleur du ciel + soleil × couleur du soleil).
- Ces deux couleurs sont des uniforms partagés par tous les matériaux. `Daylight` les fait suivre l'heure, comme avant les lumières : la journée ne recompile rien.
- Avec les cartes, il n'y a plus de lumière directionnelle. La lumière hémisphérique garde la moitié du ciel, en appoint : le calcul voit la maison fermée, et laisse sombres des faces que l'effacement des murs dévoile.
- Le fond derrière la maison suit le thème de l'app, et non l'heure : un dégradé un cran plus sombre que l'interface, gris clair en thème clair et presque noir en thème sombre, d'où la maison blanche se détache. Le propriétaire l'a choisi parmi quatre variantes.

**Sans cartes** (maison non calculée, ou moteur WebGPU), la scène est éclairée en temps réel avec l'ambiance Clair doux : ciel bleuté, soleil chaud, nuit bleue.

## Conséquences

- **Mesuré** sur le build de production, maison démo, Chrome sur Mac M4, 1440 × 900 à DPR 2. Les mesures sont faites au repos, avec la focale de 30° de l'[ADR 0047](0047-focale-de-30-degres.md) : les deux changements sont mesurés ensemble. On retient la médiane de 3 lancements entrelacés, chacun dans un navigateur neuf.

  | Moment | GPU par image, avant → après | Draw calls | Programmes | Compilés en rotation |
  | ------ | ---------------------------: | ---------: | ---------: | -------------------: |
  | Midi   |             7,5 → **5,0** ms |    44 → 44 |      5 → 5 |                    0 |
  | 22 h   |             7,3 → **4,9** ms |    44 → 44 |      5 → 5 |                    0 |

  Dans le prototype, à 75°, l'éclairage précalculé coûtait autant que Clair doux (7,3 contre 7,6 ms à 22 h). Le gain vient donc surtout de la focale : à la distance d'ouverture, le fondu des murs ne dessine plus rien. La tablette n'est pas mesurée.

- **Poids** : le modèle démo passe de 530 à 709 Ko (le second jeu d'UV), et ses cartes pèsent 454 et 430 Ko, soit 1,59 Mo en tout. Le test du budget compte désormais les cartes avec le modèle.
- **Mémoire GPU** : deux textures de 2048 × 2048 en RGBA, sans mipmaps, soit 32 Mo.
- **Calcul** : environ 5 minutes sur un Mac M4. Il demande Blender 5 et se relance après chaque `pnpm optimize-model` : les cartes ne valent que pour leur modèle. Il ne tourne pas en CI.
- **Résolution** : environ 2,8 cm par texel sur la démo. C'est net à la distance d'ouverture, mais flou dès qu'une pièce remplit l'écran.
- **Défauts** : deux faces dans le même plan qui se chevauchent sortent noires (sur la démo, le dessus de l'armoire et de la vitrine du séjour). Quelques petits objets gardent des taches : il n'y a pas de débruitage.
- Le soleil reste fixe, comme avant. Les lampes, leurs ombres et la carte des températures ne changent pas.
- Le rendu WebGPU n'a pas l'équivalent : il garde Clair doux.
- Le modèle de l'appartement se calcule dans le sous-module privé, avec le même script. D'ici là, il s'affiche en Clair doux.
- Remplace l'ambiance et le soleil de l'[ADR 0030](0030-eclairage-ciel-soleil-sans-reflets.md). Le reste tient : pas de reflets, matériaux Lambert, tone mapping Neutral, et une journée qui ne change que des uniforms.

## Alternatives considérées

- **Ambiances réglées à la main** (Clair doux, Maquette, Plein soleil) : essayées dans l'application, jugées trop loin des références. Clair doux reste le repli.
- **Occlusion simulée en temps réel** (carte du sol vue de dessus, pied des murs assombri) et **ombre du soleil en temps réel** : essayées dans le prototype. Elles imitent mal les rebonds, et l'ombre coûte une carte d'ombre de plus.
- **Occlusion en post-traitement (SSAO, N8AO)** : trop lourde pour l'Adreno 610 (ADR 0030).
- **Une seule carte**, ciel et soleil fusionnés : le jour et la nuit ne pourraient plus doser le ciel et le soleil séparément.
- **Cartes dans le `.glb`** : GLTFLoader ne charge pas une texture qu'aucun matériau n'utilise, il faudrait la lire à la main.
- **KTX2 (Basis)** : quatre à huit fois moins de mémoire GPU, mais un transcodeur WASM à servir. À reconsidérer si la mémoire de la tablette manque.
- **Cartes de 4096 px** : quatre fois la mémoire (128 Mo) pour un gain visible seulement de près.
- **Dépliage par gltf-transform (`unwrap`, xatlas)** : sa CLI ne règle pas la marge entre les îlots. Le dépliage de Blender, lui, a été validé à l'œil.
- **Ombre douce de la maison sur le fond**, rendue une fois au démarrage : essayée, écartée pour 160 lignes au service d'un détail.
