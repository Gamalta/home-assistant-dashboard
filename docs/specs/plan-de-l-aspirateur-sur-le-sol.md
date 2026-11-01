# Plan de l'aspirateur sur le sol de la vue 3D

- Issue : à ouvrir
- Statut : Brouillon

## Problème

Le plan de nettoyage ne se voit que dans la modale de l'aspirateur, une image à part de la maison 3D. Pour savoir où passe le robot, il faut faire de tête le lien entre le plan et la scène.

## Objectif

Afficher le plan de nettoyage sur le sol de la vue 3D depuis le menu rapide, comme la carte des températures.

## Hors périmètre

- Choisir des pièces ou lancer un nettoyage depuis le sol : cela reste dans la modale.
- Un robot en 3D : il apparaît à plat, dans l'image du plan.
- Un réglage de l'alignement dans l'interface : il se fait dans la configuration de la maison.
- Plusieurs aspirateurs : le sol montre le plan du premier de la maison.

## Comportement attendu

### Scénario : poser le plan de nettoyage sur le sol de la vue 3D

- **Étant donné** la démo, son aspirateur en train de laver le séjour, et le menu rapide ouvert
- **Quand** je touche « Aspirateur »
- **Alors** le menu se referme et le sol de la maison montre le plan dessiné par l'intégration, chaque pièce du plan sur la pièce de la maison qui lui correspond, avec le chemin et le robot ;
- **et** le reste de la maison devient translucide, et seule l'étiquette de l'aspirateur reste ;
- **quand** je touche à nouveau « Aspirateur », **alors** la vue normale revient.

### Scénario : une seule carte au sol à la fois

- **Étant donné** la carte des températures affichée
- **Quand** je touche « Aspirateur »
- **Alors** le plan de nettoyage remplace la carte des températures, et « Température » n'est plus en surbrillance ;
- **et** inversement, « Température » remplace le plan.

### Scénario : maison sans aspirateur

- **Étant donné** une maison sans élément `vacuum`
- **Quand** j'ouvre le menu rapide
- **Alors** il ne propose pas « Aspirateur ».

### Scénario : aligner le plan sur la maison

- **Étant donné** un robot dont le repère n'a ni l'origine ni l'orientation de la scène
- **Quand** la configuration de l'aspirateur donne `mapAlignment` : la position dans la scène de l'origine du robot, et la rotation du plan
- **Alors** chaque point du robot tombe à sa place sur le sol de la scène.

Le premier scénario est un test E2E (`e2e/vacuum.spec.ts`). Les autres se testent en unitaire : `QuickMenu/VacuumMapAction.test.tsx`, `QuickMenu/index.test.tsx` et `utils/entity/vacuum.test.ts`.

## Critères d'acceptation

- [x] L'action bascule l'option mémorisée `vacuumMapShader`, sur le modèle de « Température » ([ADR 0041](../adr/0041-carte-des-temperatures-dans-le-menu-rapide.md)), et les deux options s'excluent.
- [x] Le sol lit l'image de `camera.<préfixe>_map` par ses points de calibration et `mapAlignment` ([ADR 0051](../adr/0051-plan-de-l-aspirateur-sur-le-sol-de-la-scene.md)).
- [x] Le plan ne se charge que lorsque l'option est active, et se recharge à chaque nouvelle carte.
- [x] Une image illisible, faute de CORS, laisse le sol neutre et le signale dans la console.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : mêmes draw calls, aucun programme en rotation, temps GPU comparable à celui de la carte des températures. Mesure `pnpm bench --compare` jointe à la PR.

## Impacts

- Configuration des maisons : `mapAlignment`, facultatif, sur l'élément `vacuum` ([guide](../guides/aspirateur-robot.md#plan-sur-le-sol-de-la-vue-3d)).
- Home Assistant : l'origine du dashboard dans `http: cors_allowed_origins` quand il est servi à part.
- Options mémorisées : `vacuumMapShader`, fausse par défaut, sans migration.
- `pnpm bench` : jeu d'options `aspirateur`.
