# 0052 — Un ruban LED en quatre spots

- Statut : Proposé
- Date : 2026-11-01
- Issue : à créer

## Contexte

- Les rubans LED de l'appartement sont chacun un spot du modèle. Sur le mur ou le meuble qu'il éclaire, un spot dessine une tache ronde : « cela ne ressemble pas à un ruban ». Le propriétaire demande une vraie source linéaire, ou à défaut quatre sources par ruban.
- three.js a une source rectangulaire, `RectAreaLight`, mais ne l'applique qu'aux matériaux Standard et Physical, en WebGL comme en WebGPU. La scène n'a que des matériaux Lambert ([ADR 0046](0046-eclairage-precalcule-dans-blender.md)). Elle ne projette pas d'ombre, et glTF ne décrit que des lumières ponctuelles (`KHR_lights_punctual`).
- Chaque entité pilote la première lumière du modèle dont le nom commence par son identifiant ([ADR 0049](0049-groupes-de-lumieres.md)). `pnpm optimize-model` aplatit la hiérarchie du modèle (`gltf-transform join`) : un nœud parent qui réunirait les spots d'un ruban disparaît.
- GLTFLoader retire le point des noms (`Strip.001` devient `Strip001`), mais garde le nom d'origine dans `userData.name`.

## Décision

Un ruban LED est fait de quatre spots : le spot nommé d'après l'entité et trois copies Blender (`.001`, `.002`, `.003`). L'entité pilote la première lumière dont le nom commence par son identifiant et toutes les lumières qui portent le même nom d'origine, au suffixe `.NNN` près.

- La règle vit dans `findModelLights`. `RoomLight3d` ne change pas : il anime les spots d'un ruban comme ceux d'un groupe, avec un seul `compileAsync`.
- Les spots d'un ruban se placent au centre de quatre tronçons égaux. Ceux d'un Ambilight se placent derrière la TV, un par côté, tournés vers le mur.
- Chaque spot garde l'intensité d'une lumière. Au quart de l'intensité, le mur de la tête de lit montrait quatre points distincts ; à pleine intensité, une bande continue.
- Les rubans de l'appartement suivent leur meuble : bar et étagère sur 2,4 m, tête de lit sur 1,6 m, cuisine en L, et l'Ambilight autour de la TV. La démo reçoit un ruban fictif le long du haut de sa TV, `light.living_room_led_strip`, pour les E2E.

## Conséquences

- Un ruban allumé compte quatre spots dans les shaders au lieu d'un. Mesuré sur la démo (build de production, Chrome sur Mac M4, 1280 × 800 à DPR 2, médiane de 5 lancements entrelacés de 240 images) : 3,6 ms de GPU par image dans l'état du mock, 4,2 ms en allumant en plus le plafonnier du séjour (un spot) comme le ruban (quatre). L'écart reste dans le bruit du M4. La tablette n'est pas mesurée.
- Au repos, `pnpm bench --compare` ne change rien : les spots d'un ruban éteint sont invisibles, comme ceux d'une lampe éteinte.
- Un ruban éclaire quatre fois plus qu'une ampoule : les surfaces proches saturent sur toute sa longueur, comme elles saturaient déjà autour du spot unique.
- Le mur derrière une TV est souvent du côté de la caméra : vu de dos, il ne reçoit pas la lumière de la pièce, et il s'efface à moins de 8 m de la caméra. Le halo de l'Ambilight ne se voit donc qu'en tournant la vue vers la TV, d'assez loin.
- Les spots d'un ruban viennent après les autres lumières du modèle. Sur un GPU à 16 unités de texture (Adreno 610, M4), ils restent hors du budget de 15 ombres, comme avant.
- Toutes les lumières de l'appartement allumées ensemble feraient 43 spots dans un shader, soit environ 172 des 224 vecteurs d'uniforms que garantit WebGL 2. La marge se surveille si d'autres rubans s'ajoutent.
- Les spots ajoutés au chunk JSON des modèles optimisés disparaîtraient avec un nouvel export Blender, comme les lumières d'appoint : ils se recréent dans Blender par Maj+D.
- Une lumière `kitchen_light.001` suit désormais `light.kitchen_light`. Aucune entité ne pouvait la piloter seule : un identifiant Home Assistant ne contient pas de point.

## Alternatives considérées

- **`RectAreaLight`** : la vraie source linéaire, mais il faudrait porter son calcul (LTC) dans les shaders Lambert des deux moteurs, et stocker la longueur du ruban hors de glTF. Elle ne projette pas d'ombre.
- **Les spots d'un ruban sous un nœud parent** : `gltf-transform join` aplatit la hiérarchie.
- **Piloter toutes les lumières qui commencent par l'identifiant** : déjà écarté par l'ADR 0049, `light.corridor_light` allumerait `corridor_light_2`.
- **Répartir les spots dans le code**, à partir d'une longueur notée dans les `extras` du spot : un seul spot à placer, mais une propriété de plus à maintenir et des lumières qui n'existent pas dans le modèle.
- **Partager l'intensité entre les quatre spots** : la lumière totale d'une ampoule, mais quatre points distincts sur un mur proche, et un diviseur par lumière dans `RoomLight3d`.
- **L'Ambilight devant l'écran, tourné vers la pièce** : visible dans la vue habituelle, mais un Ambilight éclaire le mur derrière la TV, pas la pièce.
