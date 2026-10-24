# Carrousel et actions de la barre latérale

La barre latérale donne accès à ce qui concerne toute la maison ([ADR 0035](../adr/0035-carrousel-de-cartes-et-actions.md)). Deux listes se déclarent dans `SideBarConfig`, dans le `House.ts` de la maison :

```ts
export const SideBarConfig: SideBarConfigType = {
  // …
  actions: [{type: 'allLightsOff'}],
  shortcuts: [
    {type: 'media', mediaPlayerEntityId: 'media_player.living_room_tv'},
  ],
};
```

- `actions` : des boutons ronds dans l'en-tête, à côté de l'heure, toujours à un appui.
- `shortcuts` : les cartes du carrousel sous les personnes, dans l'ordre de la liste.
  - On glisse du doigt pour passer d'une carte à l'autre, et les points en dessous indiquent la carte affichée.
  - Un appui sur un point fait défiler jusqu'à sa carte, et un appui sur une carte ouvre sa modale.

Sans l'une ou l'autre liste, rien ne s'affiche à sa place.

## Migration depuis les tuiles

« Tout éteindre » n'est plus une tuile mais une action : l'entrée passe de `shortcuts` à `actions`, avec les mêmes options.

```ts
// Avant
shortcuts: [{type: 'allLightsOff'}],
// Après
actions: [{type: 'allLightsOff'}],
```

Les autres types gardent leur place et leurs options dans `shortcuts`.

## Actions

### Tout éteindre

`{type: 'allLightsOff'}`

Un bouton rond à l'icône marche/arrêt. Sa pastille indique le nombre de lumières allumées et disparaît quand tout est éteint. Un appui ouvre la liste de ces lumières, et le bouton « Éteindre » les éteint toutes en un seul appel à `light.turn_off`. Seules les lumières déclarées dans les pièces de la maison sont concernées.

| Option           | Rôle                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `scriptEntityId` | Script Home Assistant lancé à la place, par exemple pour éteindre aussi la TV ou les prises. Le dashboard n'éteint alors rien lui-même. |

## Cartes

### Média

`{type: 'media', mediaPlayerEntityId: 'media_player.living_room_tv'}`

La carte affiche le nom du lecteur, la pochette, le titre et l'artiste du média en cours, ainsi que les boutons précédent, lecture ou pause et suivant que le lecteur prend en charge. Ces boutons agissent sans ouvrir la modale. Un appui ailleurs sur la carte ouvre la modale du lecteur. Un lecteur éteint ou en veille affiche « Éteint ».

| Option                | Rôle                                                  |
| --------------------- | ----------------------------------------------------- |
| `mediaPlayerEntityId` | Lecteur `media_player` : TV, Apple TV, enceinte, etc. |

### Crédit immobilier

```ts
{
  type: 'mortgage',
  label: 'Crédit maison',
  principal: 250_000,
  annualRate: 1.45,
  durationMonths: 300,
  firstPaymentDate: '2021-06-05',
  monthlyInsurance: 28,
}
```

La carte affiche le capital restant dû et la part déjà remboursée. La modale montre une maison qui se remplit jusqu'à cette part et, à côté, le capital restant dû, la mensualité, la date de fin avec les échéances payées, et les intérêts payés et restants. Le bouton « Historique » affiche la courbe du capital restant dû, année par année jusqu'à la fin du prêt. Le calcul suppose un prêt à taux fixe et à échéances constantes ([ADR 0022](../adr/0022-credit-calcule-par-le-dashboard.md)).

| Option             | Rôle                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `principal`        | Montant emprunté, en euros                                                                  |
| `annualRate`       | Taux nominal annuel, en %                                                                   |
| `durationMonths`   | Nombre d'échéances                                                                          |
| `firstPaymentDate` | Date de la première échéance, au format `AAAA-MM-JJ` ; le jour donne le jour de prélèvement |
| `monthlyInsurance` | Assurance mensuelle, facultative                                                            |
| `label`            | Libellé de la carte, `Crédit` par défaut ; utile pour plusieurs prêts                       |

Après un remboursement anticipé, remplacer `principal`, `durationMonths` et `firstPaymentDate` par les valeurs du nouvel échéancier.

### Liste de courses

`{type: 'shoppingList', todoEntityId: 'todo.shopping_list'}`

La carte affiche le nombre d'articles à acheter et les 3 premiers. La modale permet d'ajouter un article au clavier, de cocher et décocher un article d'un appui, et de retirer les articles cochés. La liste se met à jour en temps réel quand elle change ailleurs ([ADR 0023](../adr/0023-listes-todo-par-abonnement.md)).

| Option         | Rôle                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| `todoEntityId` | Liste `todo` de Home Assistant, par exemple celle de l'intégration « Liste de courses » |
| `label`        | Libellé de la carte, `Courses` par défaut                                               |

### Prochains trains

`{type: 'trains', label: 'Vers le travail', prefix: 'sncf_paris_lyon'}`

Une carte par trajet de l'intégration HACS [sncf_trains](https://github.com/Master13011/SNCF-API-HA). Elle affiche les trois prochains départs : « 07:42 à l'heure », « 07:42 +5 min » en orange ou l'heure barrée et « supprimé » en rouge, et la voie si elle est connue. Un appui ouvre la liste des départs à venir : heure réelle en grand, heure prévue barrée en cas de retard, voie, train et heure d'arrivée. Les trains partis disparaissent d'eux-mêmes.

| Option   | Rôle                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`  | Titre de la carte et de la modale.                                                                                                                          |
| `prefix` | Début des capteurs du trajet, sans le domaine ni `_train_<n>` : `sncf_paris_lyon` pour `sensor.sncf_paris_lyon_train_1`. Les capteurs absents sont ignorés. |

Pour trouver le préfixe, chercher `_train_1` dans **Paramètres → Entités** : l'intégration nomme ses capteurs `sensor.sncf_<départ>_<arrivée>_train_<n>`, avec `n` de 1 au nombre de trains choisi pour le trajet. Garder ces identifiants d'origine. Les capteurs `sncf_tous_les_trains_ligne`, `sncf_trajets` et le calendrier ne servent pas.

Le retard affiché est celui au départ, recalculé à partir des heures réelle et prévue : l'attribut `delay_minutes` de l'intégration est le retard à l'arrivée. sncf_trains 1.3.3 ne publie ni la voie ni les suppressions, et un train supprimé disparaît simplement de la liste. Le dashboard les affiche si un capteur porte les attributs `platform` (texte) ou `cancelled` (booléen), comme ceux du mock ([ADR 0027](../adr/0027-trains-sncf-par-prefixe.md)).

### Énergie

```ts
{
  type: 'energy',
  powerEntityId: 'sensor.compteur_papp',
  tariffPeriodEntityId: 'sensor.compteur_ptec',
  peakIndexEntityId: 'sensor.compteur_hchp',
  offPeakIndexEntityId: 'sensor.compteur_hchc',
  subscribedCurrentEntityId: 'sensor.compteur_isousc',
  prices: {peak: 0.27, offPeak: 0.21},
}
```

La carte affiche la puissance instantanée, la période tarifaire en cours et le coût estimé du jour (« 1,2 kVA Heures creuses, Aujourd’hui : 1,15 € »). Un appui ouvre la modale sur le mois en cours :

- en grand, la consommation du mois en kWh, son coût estimé et l'écart avec le mois précédent, en vert si l'on consomme moins, en orange si l'on consomme plus. Tant que la période n'est pas finie, l'écart est calculé « à date égale » : le 24 octobre à midi, on compare au 1er–24 septembre à midi ;
- un graphique en barres, heures pleines et heures creuses empilées, avec la période comparée en pointillés ; un appui sur une barre en donne le détail ;
- à droite, l'échelle (« Semaine », « Mois », « Année »), les flèches pour reculer ou avancer d'une période, la comparaison (période précédente ou « Un an avant ») et les totaux en kWh et en euros ;
- dans l'en-tête, la puissance instantanée, avec un éclair de la couleur de la période tarifaire, et, si l'intensité souscrite est fournie, la charge par rapport à la puissance souscrite.

« Un an avant » compare au même mois ou à la même année, et une semaine à celle d'il y a 52 semaines, pour garder les mêmes jours. Les jours s'alignent par leur rang : le 1er avec le 1er.

| Option                      | Rôle                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `powerEntityId`             | Puissance instantanée, en VA (PAPP du Linky) ou en W.                                                                       |
| `tariffPeriodEntityId`      | Période tarifaire en cours : PTEC du mode historique (« HP.. », « HC.. ») ou libellé du mode standard (« HEURES CREUSES »). |
| `peakIndexEntityId`         | Index heures pleines (HCHP), en Wh, kWh ou MWh.                                                                             |
| `offPeakIndexEntityId`      | Index heures creuses (HCHC), en Wh, kWh ou MWh.                                                                             |
| `subscribedCurrentEntityId` | Facultatif. Intensité souscrite en A (ISOUSC) : la puissance souscrite vaut 200 V par ampère, soit 6 kVA pour 30 A.         |
| `prices`                    | Prix du kWh TTC en euros, `peak` en heures pleines et `offPeak` en heures creuses. Le coût n'inclut pas l'abonnement.       |

Avec un ZLinky sous Zigbee2MQTT, les entités s'appellent `sensor.<nom>_papp`, `sensor.<nom>_active_register_tier_delivered`, `sensor.<nom>_hchp`, `sensor.<nom>_hchc` et `sensor.<nom>_isousc`.

Les consommations viennent des statistiques à long terme de Home Assistant ([ADR 0021](../adr/0021-consommation-par-les-statistiques-long-terme.md), [ADR 0037](../adr/0037-comparaison-de-consommation-par-periode.md)), par jour ou par mois : on remonte aussi loin qu'elles existent. Les deux index doivent avoir `state_class: total_increasing`, ce que Zigbee2MQTT pose sur les capteurs en kWh. On le vérifie dans **Outils de développement > Statistiques**. Une valeur absente s'affiche « — », par exemple le jour où les index viennent d'être créés.

## Ajouter un type de carte

1. Ajouter son type à l'union `ShortcutConfigType` de `src/configs/sidebar.d.ts`.
2. Créer `src/components/SideBar/Shortcuts/<Type>Shortcut.tsx`. Il rend un `ShortcutCard` et sa modale, avec le même `id`.
   - Le contenu tient en 3 ou 4 lignes courtes, soit environ 300 × 130 px à 1280 × 800. Le détail va dans la modale.
   - Les textes sont des `span` (`component="span"`), car la carte est un bouton.
   - Les boutons de la carte passent par `controls` : un bouton ne peut pas en contenir un autre.
3. Ajouter le `case` correspondant dans `src/components/SideBar/Shortcuts/index.tsx`.
4. Documenter la carte dans ce guide, et ajouter ses entités au mock pour la démo et les tests.

## Ajouter une action

1. Ajouter son type à l'union `ActionConfigType` de `src/configs/sidebar.d.ts`.
2. Créer `src/components/SideBar/HeaderCard/<Type>Action.tsx`, qui rend un `IconButton` rond avec un `aria-label`, et sa modale avec le même `id`.
3. Ajouter le `case` correspondant dans `src/components/SideBar/HeaderCard/index.tsx`.

L'en-tête n'a de place que pour 2 ou 3 boutons à côté de l'heure.
