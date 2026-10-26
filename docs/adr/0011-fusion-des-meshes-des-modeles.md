# 0011 — Fusionner les meshes des modèles

- Statut : Proposé
- Date : 2026-10-24
- Issue : #8

## Contexte

Le CPU de la tablette sature vers 900 draw calls, et le budget de l'[ADR 0009](0009-budget-performance-tablette.md) est de 150. L'[état des lieux](../etat-des-lieux.md) compte environ 930 draw calls par image sur l'appartement : 909 primitives, 140 matériaux dont des doublons, aucune instance, et 4,9 Mo de géométrie non compressée. Pendant une rotation avec un CPU bridé ×4, 90 % du temps part dans la boucle de rendu de three. `optimize-model.sh` compressait les modèles sans les fusionner. La démo, fusionnée à la main en un seul mesh, ne fait que 46 draw calls.

Les effets de la scène retrouvent le modèle par ses noms :

- les matériaux, par leur rôle : `room_*` pour un sol, `wall_*`, `white` ou `yellowbrt` pour un mur ([ADR 0004](0004-scenematerials-proprietaire-unique.md)) ;
- les lumières, par le préfixe de l'entité qui les pilote ;
- la caméra, par le nom donné dans la config de la maison.

## Décision

`scripts/optimize-model.sh` fusionne les objets qui partagent un matériau : un modèle optimisé compte une primitive, donc un draw call, par matériau. Le script enchaîne gltf-transform 4.5.1 (version figée) :

1. `webp`, comme avant ;
2. le marquage du rôle de chaque matériau dans ses `extras`, avec la règle de `SceneMaterials` ;
3. `weld`, puis `simplify` avec la même tolérance qu'avant ;
4. `join`, qui fusionne d'abord les matériaux identiques (`dedup`), aplatit la hiérarchie (`flatten`), puis réunit les objets qui partagent un matériau ;
5. `meshopt`, comme avant.

- **Le marquage du rôle est indispensable.** `dedup` compare les matériaux sans leur nom : deux matériaux identiques fusionnent et gardent le nom du premier. Sur l'appartement, un meuble devenait ainsi un mur, qui s'effaçait près de la caméra. `dedup` compare aussi les `extras` : avec le rôle, seuls les matériaux de même rôle fusionnent. La CLI ne sait pas faire garder les noms à `dedup`, d'où quelques lignes de `node` dans le script.
- **La simplification passe avant la fusion.** Sa tolérance est relative à la taille de la primitive : après la fusion, elle le serait à celle de toute la maison.
- **Les noms utiles sont conservés.** Les matériaux gardent leur nom Blender. Les nœuds des lumières et de la caméra ne sont pas fusionnés, et `flatten` reporte leur position dans le nœud lui-même. Sur les deux maisons, la position, la cible et l'angle de chaque lumière sont identiques avant et après, au millimètre près, de même que la position de la caméra.
- **Un test unitaire vérifie le budget des modèles.** `src/configs/models.test.ts` lit le chunk JSON de chaque `src/configs/*/*.glb` présent : 2 Mo et 150 primitives au plus. L'appartement, absent de la CI, n'est vérifié qu'en local.
- **`Demo.glb` n'est pas regénéré.** Il est déjà fusionné. Le repasser dans le script cumule deux simplifications, qui font apparaître des facettes sombres sur le canapé, pour 9 draw calls de moins et aucun gain mesurable.

**Le fondu des murs est trié objet par objet, tous matériaux confondus.** three.js trie les meshes transparents d'arrière en avant, mais pas les triangles d'un mesh. Une fois les murs fusionnés, leurs calques de fondu se mélangeaient dans l'ordre des triangles, et un matériau après l'autre : des murs du fond passaient devant des murs du premier plan. C'est le défaut corrigé à la main lors de l'itération tablette 6. La démo, fusionnée elle aussi, l'avait déjà en partie.

`SceneMaterials` construit donc un seul calque de fondu pour tous les murs (`createWallFade`) :

- les triangles de tous les murs, copiés en coordonnées monde, avec la couleur de chaque mur dans ses sommets ;
- les objets du modèle d'origine, retrouvés par connexité (triangles reliés par des sommets de même position) : 106 sur l'appartement, pour 111 murs avant la fusion ;
- à chaque déplacement de la caméra, ces objets sont triés d'arrière en avant comme three.js le ferait (centre de la boîte englobante, le long de l'axe de la caméra). Viennent ensuite les triangles de chaque objet, pour que la face intérieure d'un mur ne passe pas devant sa face extérieure. Seuls les objets à moins de 8 m de la caméra, les seuls qui s'effacent, sont triés et dessinés.

## Conséquences

- Sur l'appartement, 909 primitives deviennent 94, le fichier passe de 4,9 à 1,3 Mo, et une image coûte 94 draw calls au lieu de 929. Le CPU du rendu est divisé par cinq, et la rotation avec un CPU bridé ×4 tient les 60 images par seconde. Les mesures avant/après sont dans la PR.
- **Le découpage par objet est perdu.** Un objet du modèle n'est plus un mesh three.js : on ne peut plus cacher, colorer ou viser un meuble par son nom. Un objet qui devra bouger (porte, volet) devra être exclu de la fusion.
- **Un seul calque de fondu, trié.** Il coûte un draw call pour tous les murs, au lieu d'un par mur avant la fusion. Le tri ajoute environ 7 points de CPU occupé pendant une rotation avec un CPU bridé ×4 sur l'appartement, et rien de mesurable sur la démo. La copie des murs occupe environ 1 Mo de mémoire.
- **Dans la zone de fondu, les murs partagent le matériau du premier mur, à leur couleur près.** Sans les reflets (matériaux Lambert), le rendu est le même. Avec les reflets, la rugosité et la réflexion spéculaire sont celles du premier mur. Une texture de mur n'y est pas affichée : les murs des deux maisons sont des couleurs unies.
- Le tri reproduit l'ordre de three.js avant la fusion, sans être exact au pixel près. Quelques différences demeurent dans la zone de fondu, dans le sens d'un premier plan plus net. Avec la carte des températures, toute la maison devient translucide : les meubles fusionnés ne sont pas triés et peuvent se mélanger dans le désordre. Les captures n'en montrent pas d'effet visible.
- **Le frustum culling ne sert plus.** Chaque primitive s'étend sur toute la maison, donc tout est dessiné à chaque image. C'est sans effet quand la maison entière est à l'écran, ce qui est le cas courant.
- Le script se lance sur l'export Blender d'origine : sur un modèle déjà optimisé, les simplifications se cumulent.
- Une nouvelle règle de rôle dans `SceneMaterials` doit être reportée dans le script. Sinon, deux matériaux de rôles différents peuvent fusionner sans erreur.
- Une montée de version de gltf-transform se vérifie en comparant les modèles produits : primitives, triangles par rôle, lumières.

## Alternatives considérées

- **Instanciation (`EXT_mesh_gpu_instancing`)** : l'appartement ne réutilise aucun mesh, il n'y a rien à instancier.
- **Simplifier après la fusion**, comme dans l'essai de l'état des lieux : le fichier tombe à 1,18 Mo, avec 40 % de triangles en moins. Les captures diffèrent à peine, mais l'écart toléré atteint plusieurs millimètres sur les petits objets.
- **`dedup` qui garde les noms** (`keepUniqueNames`) : les doublons de l'appartement ont tous des noms différents, il resterait donc 140 primitives, à la limite du budget.
- **Un script Node avec l'API de gltf-transform** : un `dedup` sur mesure, au prix de cinq dépendances de développement (`core`, `functions`, `extensions`, `meshoptimizer`, `sharp`) pour un script lancé rarement.
- **Atlas de matériaux (`palette`)** : encore moins de draw calls, mais les matériaux perdent leur nom, et `SceneMaterials` ne reconnaît plus ni les sols ni les murs.
- **Fusion au chargement (`mergeGeometries`)** : le fichier resterait à 4,9 Mo, et la fusion prendrait du temps CPU à chaque démarrage de la tablette.
- **Pré-passe de profondeur sur le fondu**, qui ne mélange que le mur fondu le plus proche de chaque pixel : un mur proche, presque transparent, masque alors les murs plus loin qui commencent à réapparaître, et l'on voit le fond noir à travers la maison. Écrire la profondeur seulement au-delà d'un seuil d'opacité laisse ressortir des murs du fond, et marque une courbe sur le seuil.
- **Trier les triangles d'un mesh par leur centre** : les grands triangles d'un mur long passent derrière un petit montant situé en arrière. De plus, l'ordre entre deux matériaux reste faux : les deux faces d'un mur ont souvent deux matériaux différents.
- **Garder les murs séparés** : plus de 220 draw calls (un mur et son calque par objet).
- **Transparence indépendante de l'ordre (weighted blended OIT)** : deux cibles de rendu et une passe de composition, trop lourd pour la tablette et pour ce seul effet.
