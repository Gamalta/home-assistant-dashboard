# Prises connectées

L'élément `plug` affiche une prise connectée dans une pièce : un bouton dans la scène 3D, qui montre si elle est allumée et ce qu'elle consomme, et une modale qui l'illustre, avec l'historique de sa puissance ([spec](../specs/prises-connectees.md)).

## Utiliser la prise

- **Appui court** sur le bouton : allume ou éteint la prise.
- **Appui long** : ouvre la modale.

Allumée, l'icône est en couleur et le bouton affiche la puissance (« 85 W », « 0,8 W » sous 10 W). Éteinte, il ne montre que l'icône.

La modale montre une prise murale, dessinée en SVG (`PlugModal/PlugView.tsx`), et en dessous la barre d'actions de la modale des volets : « ⚡ Allumer » et « Éteindre ». L'illustration suit l'état, et toucher le voyant affiche une infobulle qui explique sa couleur :

| État      | Voyant | Fiche    |
| --------- | ------ | -------- |
| Allumée   | bleu   | branchée |
| En veille | orange | branchée |
| Éteinte   | gris   | absente  |

Toucher l'illustration bascule aussi la prise : la fiche se branche ou se débranche. L'icône « Historique » de l'en-tête ouvre l'onglet Consommation, la puissance des dernières 24 h tracée par le composant commun `Chart` ([guide des graphiques](graphiques.md)) ; l'icône « Réglage » revient à l'illustration.

## Configurer l'élément

Dans le `House.ts` de la maison, ajouter l'élément à la pièce de la prise, ici avec la prise fictive de la démo :

```ts
{
  type: 'plug',
  switchEntityId: 'switch.tv_plug',
  powerEntityId: 'sensor.tv_plug_power',
  position: {x: -3.3, y: 0.3, z: 4.3},
},
```

| Champ              | Rôle                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| `switchEntityId`   | L'entité `switch` de la prise. Son `friendly_name` nomme le bouton.       |
| `powerEntityId`    | Facultatif. Capteur de puissance instantanée, en W.                       |
| `standbyThreshold` | Facultatif. En W : sous ce seuil, la prise allumée est « en veille » (5). |

`position` place le bouton dans la scène, près de l'appareil branché. `roomDisplay: true` le range plutôt avec les boutons de la pièce. Le bouton n'apparaît que si l'entité `switch` existe.

Avec Zigbee2MQTT, une prise nommée `tv_plug` crée `switch.tv_plug` et `sensor.tv_plug_power`. Régler le seuil de veille un peu au-dessus de ce que consomme l'appareil éteint à la télécommande.

## Démo et mock

La démo place deux prises fictives : `switch.tv_plug` sur le meuble TV du séjour, allumée et en veille (0,8 W), et `switch.desk_plug` sur le bureau de la chambre 3 (85,4 W). Elles sont déclarées dans `src/mock/mocks/mockEntities.ts`. La bascule passe par le service `toggle` générique du mock, qui ne modifie pas la puissance : elle n'est de toute façon pas affichée quand la prise est éteinte. L'historique de 24 h est généré au hasard par le mock.
