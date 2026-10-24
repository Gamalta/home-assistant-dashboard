# Imprimante 3D

L'élément `printer3d` affiche une imprimante Bambu Lab dans une pièce : un bouton dans la scène 3D, avec la progression pendant une impression, et une modale pour la suivre et la piloter ([spec](../specs/imprimante-3d-p1s.md)). Il a été écrit pour une P1S avec une bobine externe, sans AMS.

## Prérequis

L'imprimante est ajoutée dans Home Assistant avec l'intégration HACS [ha-bambulab](https://github.com/greghesp/ha-bambulab). Ses entités portent toutes le même préfixe, `p1s_<numéro de série>` pour une P1S : par exemple `sensor.p1s_<numéro de série>_print_progress`.

Pour le retrouver, ouvrir l'appareil dans Home Assistant (Paramètres → Appareils et services → Bambu Lab), puis l'entité « Progression de l'impression » : le préfixe est son identifiant, sans le domaine `sensor.` ni la fin `_print_progress`.

## Configurer l'élément

Dans le `House.ts` de la maison, ajouter l'élément à la pièce qui accueille l'imprimante, ici avec l'imprimante fictive de la démo :

```ts
{
  type: 'printer3d',
  prefix: 'p1s_demo',
  position: {x: 6.2, y: 1.1, z: -2.6},
},
```

`position` place le bouton dans la scène, un peu au-dessus du meuble qui porte l'imprimante. `roomDisplay: true` le range plutôt avec les boutons de la pièce. Le bouton n'apparaît que si l'entité `print_status` existe : une faute dans le préfixe le fait disparaître.

Les identifiants des entités sont déduits du préfixe ([ADR 0018](../adr/0018-appareil-configure-par-prefixe.md)). Ils suivent les noms anglais de l'intégration : si une entité a été renommée dans Home Assistant, lui rendre son identifiant d'origine.

## Entités utilisées

| Entité (après le préfixe)                                         | Affichage                                                 |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| `sensor._print_progress`                                          | Pourcentage du bouton, barre de progression               |
| `sensor._print_status`, `sensor._current_stage`                   | État et étape, en français                                |
| `sensor._task_name`                                               | Nom de la tâche                                           |
| `sensor._current_layer`, `sensor._total_layer_count`              | « Couche x / y »                                          |
| `sensor._remaining_time`                                          | « Reste 1 h 15 », en heures décimales (unité par défaut)  |
| `sensor._end_time`                                                | « Fin vers 14:32 », « Fin demain vers 08:05 »             |
| `sensor._nozzle_temperature`, `sensor._nozzle_target_temperature` | « Buse 219 / 220 °C » sur l'image                         |
| `sensor._bed_temperature`, `sensor._bed_target_temperature`       | « Plateau 55 / 55 °C » sur l'image                        |
| `light._chamber_light`                                            | Image éclairée ou éteinte, bouton de la lumière           |
| `image._cover_image`                                              | Aperçu de l'impression sur le plateau                     |
| `select._printing_speed`                                          | Vitesse, pendant l'impression et hors pause               |
| `button._pause`, `button._resume`, `button._stop`                 | Pause, Reprendre, Arrêter (avec confirmation)             |
| `binary_sensor._print_error`, `binary_sensor._hms_errors`         | Alerte rouge avec le texte de l'erreur                    |
| `binary_sensor._online`                                           | Alerte « Imprimante hors ligne »                          |
| `sensor._externalspool_external_spool`, `sensor._wi_fi_signal`    | Type et couleur de la bobine, signal Wi-Fi dans l'en-tête |

Une entité absente masque la partie de la modale qui en dépend, ou l'affiche avec `--`. La caméra, les ventilateurs et les consignes de température (`number`) ne sont pas utilisés.

## Démo et mock

La démo place une imprimante fictive, `p1s_demo`, dans la chambre 2. Ses entités sont créées par `createPrinter3d` (`src/mock/mocks/createPrinter3d.ts`) avec la même déduction d'identifiants que l'application. Les boutons et la vitesse modifient son état simulé (`src/mock/mocks/fake-call-service/button.ts` et `select.ts`) ; un arrêt la passe en « Interrompue », comme ha-bambulab, qui remonte alors l'état `failed`.

Les images de la P1S (`public/printer3d/p1s_on.png` et `p1s_off.png`) et l'aperçu fictif de la démo (`demo_cover.svg`) ne se chargent qu'à l'ouverture de la modale.
