# Aspirateur robot

L'élément `vacuum` affiche un aspirateur robot Dreame dans une pièce : un bouton dans la scène 3D, avec la progression pendant un nettoyage, et une modale qui montre le plan de nettoyage, l'état du robot et ses consommables, et permet de lancer le nettoyage des pièces choisies sur le plan ([spec](../specs/aspirateur-robot.md)). Il a été écrit pour une P40S Pro Ultra, avec sa station de lavage.

## Prérequis

L'aspirateur est ajouté dans Home Assistant avec l'intégration HACS [dreame-vacuum](https://github.com/Tasshack/dreame-vacuum), connectée au compte Dreame (ou Xiaomi) : sans le cloud, l'intégration ne publie pas de plan.

Ses entités portent toutes le même préfixe, le nom de l'appareil : `vacuum.<préfixe>`, `camera.<préfixe>_map`, `select.<préfixe>_cleaning_mode`… Pour le retrouver, ouvrir l'entité aspirateur dans Home Assistant : le préfixe est son identifiant, sans le domaine `vacuum.`.

Dans les options de l'intégration (Paramètres → Appareils et services → Dreame Vacuum → Configurer), cacher les **noms des pièces** dans les « Objets de carte cachés » : la modale pose ses propres étiquettes, que l'on touche pour choisir les pièces. La palette de couleurs de la carte se choisit au même endroit ; une palette sombre se fond mieux dans la modale.

## Configurer l'élément

Dans le `House.ts` de la maison, ajouter l'élément à la pièce où se trouve la station, ici avec l'aspirateur fictif de la démo :

```ts
{
  type: 'vacuum',
  prefix: 'dreame_demo',
  position: {x: 0.6, y: 0.3, z: 4.6},
},
```

`position` place le bouton dans la scène, au sol près de la station. `roomDisplay: true` le range plutôt avec les boutons de la pièce. Le bouton n'apparaît que si l'entité `vacuum.<préfixe>` existe : une faute dans le préfixe le fait disparaître.

Les identifiants des entités sont déduits du préfixe ([ADR 0018](../adr/0018-appareil-configure-par-prefixe.md)). Si une entité a été renommée dans Home Assistant, lui rendre son identifiant d'origine.

## Entités utilisées

| Entité                           | Affichage                                                                                                                                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vacuum.<préfixe>`               | État, boutons Pause, Reprendre, Rentrer et Tout nettoyer                                                                                                                                                                                   |
| ses attributs                    | `vacuum_state` (état en français), `cleaning_progress`, `cleaned_area`, `cleaning_time`, `battery`, `charging`, `current_segment`, consommables (`main_brush_left`, `side_brush_left`, `filter_left`, `mop_pad_left`, `sensor_dirty_left`) |
| `camera.<préfixe>_map`           | Plan de nettoyage ; ses attributs `rooms`, `calibration_points`, `active_segments` et `completed_segments` placent et colorent les étiquettes des pièces                                                                                   |
| `select.<préfixe>_cleaning_mode` | Mode : Aspirer, Laver, Les deux, Aspirer puis laver                                                                                                                                                                                        |
| `select.<préfixe>_suction_level` | Puissance : Silencieuse, Standard, Forte, Turbo                                                                                                                                                                                            |
| `sensor.<préfixe>_error`         | Alerte rouge avec la description de l'erreur, dans la langue de Home Assistant                                                                                                                                                             |

Le nettoyage des pièces choisies appelle le service `dreame_vacuum.vacuum_clean_segment`. Une entité absente masque la partie de la modale qui en dépend, ou l'affiche avec `--`.

Les étiquettes se placent au centre de chaque pièce, par les points de calibration de la carte ([ADR 0050](../adr/0050-plan-de-l-aspirateur-dessine-par-l-integration.md)). Pendant un nettoyage, le plan se recharge à chaque nouvelle carte tant que la modale est ouverte.

## Plan sur le sol de la vue 3D

Quand la maison a un aspirateur, le menu rapide propose « Aspirateur » : le plan de nettoyage se pose sur le sol de la scène, comme la carte des températures, qu'il remplace ([spec](../specs/plan-de-l-aspirateur-sur-le-sol.md), [ADR 0051](../adr/0051-plan-de-l-aspirateur-sur-le-sol-de-la-scene.md)). La maison devient translucide et seule l'étiquette de l'aspirateur reste. Pendant un nettoyage, le sol suit chaque nouvelle carte.

### Autoriser le dashboard à lire le plan

Pour envoyer l'image au GPU, le navigateur demande à Home Assistant d'autoriser l'adresse du dashboard, s'il est servi ailleurs. Dans `configuration.yaml`, puis redémarrer Home Assistant :

```yaml
http:
  cors_allowed_origins:
    - https://dashboard.example.com
```

L'adresse est l'origine du dashboard : protocole, nom et port, sans chemin. Sans elle, le sol reste gris et la console du navigateur affiche « Plan de l'aspirateur illisible ».

### Aligner le plan sur la maison

Le robot compte en millimètres, dans son propre repère. `mapAlignment` le place dans la scène :

```ts
{
  type: 'vacuum',
  prefix: 'dreame_demo',
  position: {x: 0.6, y: 0.3, z: 4.6},
  mapAlignment: {x: 0, z: 0, rotation: 0},
},
```

- `x` et `z` : la position, dans la scène, du point (0, 0) du robot ;
- `rotation` : la rotation du plan autour de la verticale, en degrés, dans le sens de `rotation.y` de three (anti-horaire vu de dessus).

Un mètre de la scène vaut 1000 mm du robot. Sans `mapAlignment`, l'origine du robot est au centre de la scène, sans rotation.

Pour le régler, choisir d'abord le quart de tour qui rend les murs du plan parallèles à ceux de la maison, puis déplacer `x` et `z` jusqu'à ce qu'ils tombent dessous.

## Démo et mock

La démo place un aspirateur fictif, `dreame_demo`, dans le séjour, en train de laver le séjour après la cuisine. Ses entités sont créées par `createVacuum` (`src/mock/mocks/createVacuum.ts`) avec la même déduction d'identifiants que l'application. Ses services modifient son état simulé (`src/mock/mocks/fake-call-service/vacuum.ts`) : il rentre à sa station en cinq secondes.

Son plan, `public/vacuum/demo_map.svg`, est tiré des murs de `Demo.glb` : ses pièces, ses portes et ses cloisons sont celles de la maison 3D. Ses points de calibration : 40 pixels par mètre, axe vertical inversé comme chez Dreame. L'origine du robot y est celle de la scène : le plan se pose sur le sol sans `mapAlignment`.
