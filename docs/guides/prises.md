# Prises connectées

L'élément `outlet` affiche une prise connectée dans une pièce : un bouton dans la scène 3D, qui montre si elle est allumée, et une modale qui l'illustre, avec l'historique de sa puissance ([spec](../specs/prises-connectees.md)).

## Utiliser la prise

- **Appui court** sur le bouton : allume ou éteint la prise.
- **Appui long** : ouvre la modale.

Le bouton ne montre que l'icône, en couleur quand la prise est allumée. La puissance se lit dans la modale.

La modale affiche la puissance en haut, dans l'en-tête, quand la prise est allumée et que le capteur la connaît. Elle montre une prise murale, dessinée en SVG (`OutletModal/OutletView.tsx`), et en dessous le bouton marche/arrêt, dans une barre d'actions comme celle des volets. Il bascule la prise et prend la couleur primaire quand elle est allumée. L'illustration suit l'état :

| État    | Voyant | Fiche    |
| ------- | ------ | -------- |
| Allumée | bleu   | branchée |
| Éteinte | éteint | absente  |

Toucher l'illustration bascule aussi la prise : la fiche se branche ou se débranche. L'icône « Historique » de l'en-tête ouvre l'onglet Consommation, la puissance des dernières 24 h tracée par le composant commun `Chart` ([guide des graphiques](graphiques.md)) ; l'icône « Réglage » revient à l'illustration.

## Configurer l'élément

Dans le `House.ts` de la maison, ajouter l'élément à la pièce de la prise, ici avec la prise fictive de la démo :

```ts
{
  type: 'outlet',
  switchEntityId: 'switch.tv_outlet',
  powerEntityId: 'sensor.tv_outlet_power',
  position: {x: -3.3, y: 0.3, z: 4.3},
},
```

| Champ            | Rôle                                                                |
| ---------------- | ------------------------------------------------------------------- |
| `switchEntityId` | L'entité `switch` de la prise. Son `friendly_name` nomme le bouton. |
| `powerEntityId`  | Facultatif. Capteur de puissance instantanée, en W.                 |

`position` place le bouton dans la scène, près de l'appareil branché. `roomDisplay: true` le range plutôt avec les boutons de la pièce. Le bouton n'apparaît que si l'entité `switch` existe.

Avec Zigbee2MQTT, une prise nommée `tv_outlet` crée `switch.tv_outlet` et `sensor.tv_outlet_power`.

## Démo et mock

La démo place deux prises fictives : `switch.tv_outlet` sur le meuble TV du séjour, allumée (0,8 W), et `switch.desk_outlet` sur le bureau de la chambre 3 (85,4 W). Elles sont déclarées dans `src/mock/mocks/mockEntities.ts`. La bascule passe par le service `toggle` générique du mock, qui ne modifie pas la puissance : elle n'est de toute façon pas affichée quand la prise est éteinte. L'historique de 24 h est généré au hasard par le mock.
