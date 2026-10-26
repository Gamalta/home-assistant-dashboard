# Ajouter une maison

Une maison regroupe un modèle 3D et la description de ses pièces et entités ([ADR 0007](../adr/0007-une-config-par-maison.md)).

## 1. Préparer le modèle dans Blender

- Exporter en glTF binaire (`.glb`), avec les lumières (`KHR_lights_punctual`) et une caméra.
- Nommer les matériaux selon le rôle qu'ils jouent dans les effets ([ADR 0004](../adr/0004-scenematerials-proprietaire-unique.md)) :
  - `room_*` pour les sols, colorés par la carte des températures ;
  - `wall_*`, `white` ou `yellowbrt` pour les murs, qui s'effacent près de la caméra. Les murs sont des couleurs unies : là où ils s'effacent, ils partagent un même matériau dont seule la couleur change ([ADR 0011](../adr/0011-fusion-des-meshes-des-modeles.md)).
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
- `HouseConfig` : le modèle, la caméra, et les pièces avec leur position 3D et leurs éléments (`light`, `climate`, `temperature`, `shutter`, `desktop`, [`printer3d`](imprimante-3d.md), [`outlet`](prises.md), [`media`](medias.md), [`ambilight`](bandeaux-led-ambilight.md), [`battery` et `smoke`](appareils-sur-pile.md)) ;
- `SideBarConfig` : la météo, les personnes, les animaux et la modale Système.

Les identifiants d'entités sont typés : une faute de frappe sur le domaine est signalée par `pnpm typecheck`.

### La modale Système

Le bloc `system` de `SideBarConfig` ajoute le bouton « Système » au dock. Tous ses identifiants sont facultatifs : une ligne n'apparaît que si son entité existe ([spec](../specs/systeme-enrichi.md)).

| Champ                        | Entité Home Assistant                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `uptimeEntityId`             | Capteur de démarrage de System Monitor (« Lancé depuis »)                                                  |
| `powerStatusEntityId`        | Alimentation du Raspberry Pi (`off` : suffisante)                                                          |
| `internetEntityId`           | `binary_sensor` de connexion WAN de la box (`on` : connecté)                                               |
| `lastBackupEntityId`         | Intégration Backup : _Last successful automatic backup_                                                    |
| `lastBackupAttemptEntityId`  | _Last attempted automatic backup_ : plus récente que la dernière réussite, elle signale un échec           |
| `nextBackupEntityId`         | _Next scheduled automatic backup_                                                                          |
| `backupStateEntityId`        | _Backup Manager state_ : évite de signaler un échec pendant une sauvegarde en cours                        |
| `tabletBatteryLevelEntityId` | Application Companion de la tablette murale : _Battery Level_                                              |
| `tabletBatteryStateEntityId` | _Battery State_ : `discharging` (débranchée) s'affiche en rouge, « Ne charge pas »                         |
| `tabletChargerTypeEntityId`  | _Charger Type_ (`ac`, `usb`, `wireless`, `dock`, `none`)                                                   |
| `graphs`                     | Graphes des dernières 24 h : `label`, `color` et `sensorEntityId` (mémoire, température, processeur, etc.) |

Les mises à jour ne se configurent pas : la modale liste toutes les entités `update` à `on`, avec leur version installée et la version disponible. Elle est en lecture seule : on installe depuis Home Assistant.

## 4. Activer la maison

Ajouter `<id>` à `VITE_HOUSE_CONFIGS` dans `.env`, par exemple `["demo", "<id>"]`. La première maison de la liste est celle qui s'ouvre par défaut. Le dock de la barre latérale permet ensuite de passer de l'une à l'autre.
