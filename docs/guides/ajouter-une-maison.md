# Ajouter une maison

Une maison regroupe un modèle 3D et la description de ses pièces et entités ([ADR 0007](../adr/0007-une-config-par-maison.md)).

## 1. Préparer le modèle dans Blender

- Exporter en glTF binaire (`.glb`), avec les lumières (`KHR_lights_punctual`) et une caméra.
- Nommer les matériaux selon le rôle qu'ils jouent dans les effets ([ADR 0004](../adr/0004-scenematerials-proprietaire-unique.md)) :
  - `room_*` pour les sols, colorés par la carte des températures ;
  - `wall_*`, `white` ou `yellowbrt` pour les murs, qui s'effacent près de la caméra.
- Nommer chaque lumière en commençant par l'identifiant de son entité sans le domaine : `kitchen_light` pour `light.kitchen_light`. L'entité pilote la première lumière dont le nom commence ainsi.

## 2. Optimiser le modèle

```sh
pnpm optimize-model mon-modele.glb src/configs/<id>/<Nom>.glb
```

Le script compresse les textures et la géométrie, et fusionne les objets qui partagent un matériau : le modèle optimisé compte un draw call par matériau ([ADR 0011](../adr/0011-fusion-des-meshes-des-modeles.md)). Les noms des matériaux, des lumières et de la caméra sont conservés, mais pas ceux des objets.

- Lancer le script sur l'export Blender, jamais sur un modèle déjà optimisé : les simplifications se cumuleraient.
- Pour réduire le nombre de draw calls, réutiliser les matériaux dans Blender plutôt que d'en créer un par objet.

Le modèle doit respecter le [budget de performance](../adr/0009-budget-performance-tablette.md) : 2 Mo au plus, et 150 draw calls au plus une fois chargé. `pnpm test` vérifie le poids et le nombre de primitives de chaque modèle présent dans `src/configs/`.

## 3. Décrire la maison

Créer `src/configs/<id>/House.ts` sur le modèle de `src/configs/demo/House.ts`. Il exporte :

- `ConfigName` : le nom affiché dans le menu « Configuration » ;
- `HouseConfig` : le modèle, la caméra, et les pièces avec leur position 3D et leurs éléments (`light`, `climate`, `temperature`, `shutter`, `desktop`) ;
- `SideBarConfig` : la météo, les personnes, les animaux et la modale Système.

Les identifiants d'entités sont typés : une faute de frappe sur le domaine est signalée par `pnpm typecheck`.

## 4. Activer la maison

Ajouter `<id>` à `VITE_HOUSE_CONFIGS` dans `.env`, par exemple `["demo", "<id>"]`. La première maison de la liste est celle qui s'ouvre par défaut. Le dock de la barre latérale permet ensuite de passer de l'une à l'autre.
