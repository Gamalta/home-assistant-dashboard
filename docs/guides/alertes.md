# Alertes de la maison

Une pastille dans l'en-tête de la barre latérale signale ce qui demande une intervention : fumée ou chaleur, piles faibles, internet coupé, pont Zigbee déconnecté, tablette murale débranchée, appareil indisponible ([spec](../specs/alertes-maison.md)).

## Lire les alertes

- Tout va bien : il n'y a pas de pastille.
- Une pastille **orange** avec un triangle compte les alertes d'attention.
- Une pastille **rouge** avec une flamme qui pulse signale au moins une alerte critique (fumée ou chaleur).

Un appui ouvre la liste, alertes critiques en tête. Une alerte disparaît d'elle-même quand l'entité revient à la normale : il n'y a rien à acquitter.

## Configurer les sources

Dans le `House.ts` de la maison, ajouter un bloc `alerts` à `SideBarConfig`. Tous les champs sont facultatifs. Voici celui de la démo :

```ts
alerts: {
  smokeEntityIds: [
    'binary_sensor.hallway_smoke_detector_smoke',
    'binary_sensor.hallway_smoke_detector_heat',
  ],
  batteryLowEntityIds: ['binary_sensor.hallway_smoke_detector_battery_low'],
  batteryLevelEntityIds: [
    'sensor.kitchen_button_battery',
    'sensor.bedroom_button_battery',
    'sensor.cellar_sensor_battery',
  ],
  internetEntityId: 'binary_sensor.router_wan_status',
  zigbeeEntityId: 'binary_sensor.zigbee_bridge_connection_state',
  tabletBatteryStateEntityId: 'sensor.wall_tablet_battery_state',
},
```

| Champ                        | Entités                                                                          | Alerte                                      |
| ---------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| `smokeEntityIds`             | `binary_sensor` de fumée et de chaleur (`device_class: heat` pour la chaleur)    | Critique, à `on`                            |
| `batteryLowEntityIds`        | `binary_sensor` de pile faible (`*_battery_low`)                                 | À `on`                                      |
| `batteryLevelEntityIds`      | `sensor` de batterie en %                                                        | Sous `batteryThreshold`                     |
| `batteryThreshold`           | Seuil en %, 20 par défaut                                                        | —                                           |
| `internetEntityId`           | `binary_sensor` de connexion WAN de la box                                       | À `off`                                     |
| `zigbeeEntityId`             | `binary_sensor` de connexion du pont (Zigbee2MQTT : `*_bridge_connection_state`) | À `off`                                     |
| `tabletBatteryStateEntityId` | _Battery State_ de l'application Companion Android de la tablette murale         | À `discharging` (`not_charging` est normal) |

Toute entité listée qui devient `unavailable`, ou qui n'existe pas dans Home Assistant, donne l'alerte « Indisponible : _nom_ ». Une faute de frappe ou une entité renommée se voit donc tout de suite.

Les libellés reprennent le `friendly_name` de l'entité : « Pile faible : Bouton de la cuisine (12 %) ». Pour un libellé clair, renommer l'entité dans Home Assistant plutôt que dans la config.

Les appareils à pile ne sont pas découverts automatiquement : en ajouter un demande de le lister. Les batteries des téléphones et de la tablette ne sont donc pas prises pour des piles ([ADR 0025](../adr/0025-alertes-par-regles-pures.md)).

## Démo et tests

Le mock (`src/mock/mocks/mockEntities.ts`) produit 2 alertes : la pile du bouton de la cuisine à 12 %, et le capteur de la cave indisponible. Pour déclencher la fumée, depuis la console de la démo ou dans un E2E :

```ts
await page.evaluate(() =>
  window.__mockSetState?.('binary_sensor.hallway_smoke_detector_smoke', 'on'),
);
```

La pastille passe à « 3 », en rouge, et l'alerte fumée arrive en tête de la liste (`e2e/alerts.spec.ts`).
