# Appareils sur pile et détecteur de fumée

Deux éléments de pièce montrent les appareils passifs dans la scène 3D ([spec](../specs/appareils-sur-pile.md), [ADR 0034](../adr/0034-appareils-sur-pile-elements-de-piece.md)) :

- `battery` : un appareil sur pile (interrupteur sans fil, télécommande, capteur), avec son niveau de pile ;
- `smoke` : un détecteur de fumée, avec son état et sa pile.

Une pile est faible sous **20 %** : l'étiquette passe alors en rouge.

## Trouver les entités

Dans Home Assistant, ouvrir l'appareil (Paramètres → Appareils et services → Zigbee), puis chaque entité, et copier son identifiant (roue dentée → « ID de l'entité »). Avec Zigbee2MQTT, elles portent le nom de l'appareil suivi de la donnée : `sensor.<nom>_battery`, `binary_sensor.<nom>_smoke`…

## Ajouter un appareil sur pile

Dans le `House.ts` de la maison, ajouter l'élément à la pièce de l'appareil :

```ts
{
  type: 'battery',
  name: 'Interrupteur de la cuisine',
  batteryEntityId: 'sensor.kitchen_button_battery',
  position: {x: 1.4, y: 1.1, z: -5},
},
```

| Champ             | Rôle                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `name`            | Titre de la modale, et nom accessible de l'étiquette                 |
| `batteryEntityId` | `sensor` du niveau de pile, en %                                     |
| `position`        | Place de l'étiquette dans la scène : à hauteur d'interrupteur, ~1 m  |
| `roomDisplay`     | `true` à la place de `position` : l'étiquette rejoint celle de pièce |

L'élément n'apparaît que si l'entité existe : une faute dans l'identifiant le fait disparaître sans erreur.

## Ajouter un détecteur de fumée

```ts
{
  type: 'smoke',
  smokeEntityId: 'binary_sensor.hallway_smoke_detector_smoke',
  heatEntityId: 'binary_sensor.hallway_smoke_detector_heat',
  batteryEntityId: 'sensor.hallway_smoke_detector_battery',
  batteryLowEntityId: 'binary_sensor.hallway_smoke_detector_battery_low',
  tamperEntityId: 'binary_sensor.hallway_smoke_detector_tamper',
  position: {x: 2.9, y: 2.4, z: -1.1},
},
```

Seule `smokeEntityId` est obligatoire. Chaque autre entité ajoute une ligne à la modale et compte dans l'état du détecteur :

| Champ                | Entité                     | Effet                                                         |
| -------------------- | -------------------------- | ------------------------------------------------------------- |
| `smokeEntityId`      | `binary_sensor` de fumée   | `on` : alarme « Fumée détectée ! », voyant rouge qui clignote |
| `heatEntityId`       | `binary_sensor` de chaleur | `on` : alarme « Chaleur détectée ! »                          |
| `batteryEntityId`    | `sensor` de pile, en %     | Niveau sur l'étiquette ; sous 20 %, voyant orange             |
| `batteryLowEntityId` | `binary_sensor` pile       | `on` : voyant orange, pile en orange dans la modale           |
| `tamperEntityId`     | `binary_sensor` autoprot.  | `on` : voyant orange, « Déclenchée » dans la modale           |
| `testEntityId`       | `button` d'autotest        | Bouton « Tester » dans la modale                              |

Si l'entité de fumée est `unavailable` ou `unknown`, la modale affiche « Détecteur indisponible » et le voyant est éteint. La chaleur reste signalée même dans ce cas. La ligne « Mis à jour » donne la dernière mise à jour de l'ensemble des entités du détecteur : c'est sa dernière nouvelle.

## Placer l'étiquette

Les coordonnées sont celles du modèle 3D, en mètres. Partir d'une position connue de la même pièce (celle de la pièce ou d'un volet), puis ajuster dans `pnpm dev`. Vérifier à 1280 × 800, la taille de la tablette, que l'étiquette ne recouvre pas celle d'une lumière ou d'une pièce. Les étiquettes de pile sont masquées avec la carte des températures, comme les lumières et les volets.

## Démo et mock

La démo place trois interrupteurs fictifs (séjour 54 %, cuisine 12 %, chambre 85 %) et le détecteur du couloir, `hallway_smoke_detector`, avec un bouton de test. Leurs entités sont dans `src/mock/mocks/mockEntities.ts`. Pour simuler un événement depuis la console ou un E2E :

```js
window.__mockSetState('binary_sensor.hallway_smoke_detector_smoke', 'on');
window.__mockSetState('sensor.living_room_button_battery', '8');
```
