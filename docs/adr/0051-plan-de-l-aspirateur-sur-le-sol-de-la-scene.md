# 0051 — Plan de l'aspirateur projeté sur le sol de la scène

- Statut : Proposé
- Date : 2026-11-01
- Issue : à ouvrir

## Contexte

- La modale de l'aspirateur affiche le plan dessiné par l'intégration (`camera.<préfixe>_map`), et ses points de calibration relient les millimètres du robot aux pixels de l'image ([ADR 0050](0050-plan-de-l-aspirateur-dessine-par-l-integration.md)).
- La carte des températures pose déjà une information sur le sol : `SceneMaterials` remplace le matériau du sol et rend le reste de la maison translucide, depuis une action du menu rapide ([ADR 0041](0041-carte-des-temperatures-dans-le-menu-rapide.md)). Elle multiplie le temps GPU par deux à trois sur la démo.
- Le repère du robot a sa propre origine et sa propre orientation ; la scène compte en mètres.
- Le dashboard est servi à part de Home Assistant. Une image d'une autre origine s'affiche dans une balise `<img>`, mais WebGL refuse de l'envoyer au GPU sans en-têtes CORS.
- Pendant un nettoyage, l'intégration redessine le plan toutes les quelques secondes.

## Décision

Une option mémorisée, `vacuumMapShader`, basculée par une action « Aspirateur » du menu rapide, remplace le matériau du sol par un shader qui lit l'image du plan. La fonction pure `floorToMapUv` calcule la transformation affine du sol (x, z) aux coordonnées de l'image : du sol aux millimètres du robot par `mapAlignment` (origine, rotation, 1000 mm par mètre), puis des millimètres aux pixels par les points de calibration.

- Comme pour la carte des températures, la maison devient translucide et seule l'étiquette de l'aspirateur reste. Les deux options s'excluent.
- L'image se charge à la main (`TextureLoader`), seulement quand l'option est active, et se recharge à chaque nouvelle carte ; la précédente est libérée.
- Le matériau naît avec une image vide : le shader se compile une fois, à l'activation, et l'arrivée d'un plan ne change que ses uniforms.
- Hors de l'image, et là où elle est transparente, le sol prend un gris neutre.
- Sans `mapAlignment`, l'origine du robot est au centre de la scène, sans rotation : c'est l'alignement de la démo.

## Conséquences

- Le plan, le chemin et le robot se lisent dans la maison sans rien redessiner, et les réglages de l'intégration (couleurs, objets cachés) s'appliquent aussi au sol.
- Il faut ajouter l'origine du dashboard à `http: cors_allowed_origins` dans Home Assistant. Sans cela, le sol reste gris et la console le signale.
- L'alignement se règle à la main, par essais : il est juste quand les murs du plan tombent sous ceux de la maison. Un modèle qui n'est pas à l'échelle du mètre ne peut pas s'aligner.
- Le coût est celui de la carte des températures, dû à la maison translucide : sur la démo, 44 draw calls et aucun programme en rotation, comme au repos. S'y ajoute l'envoi d'une image au GPU à chaque nouvelle carte, que `pnpm bench` ne mesure pas (la démo n'a qu'une image) : à surveiller sur la tablette pendant un nettoyage.

## Alternatives considérées

- **Colorer le sol de chaque pièce selon son état** (en cours, terminée, prévue), sans image : ni CORS ni alignement d'image, mais le modèle n'a pas un sol par pièce, et ni le chemin ni le robot ne s'afficheraient.
- **Un marqueur 3D à la position du robot** (`vacuum_position`) : il demande le même alignement et ne montre ni les pièces ni le chemin. Il pourra compléter cette option.
- **Déduire l'alignement des noms des pièces**, en associant celles du robot à celles de la maison : rien à configurer, mais les noms doivent correspondre, et la position d'une pièce dans la config est celle de son étiquette, pas son centre.
- **Charger le plan avec `useLoader`** : il suspendrait la scène à chaque nouvelle carte et garderait toutes les images en cache.
