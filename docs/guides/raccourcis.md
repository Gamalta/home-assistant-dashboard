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

### Prochains trains

`{type: 'trains', label: 'Vers le travail', prefix: 'sncf_paris_lyon'}`

Une tuile par trajet de l'intégration HACS [sncf_trains](https://github.com/Master13011/SNCF-API-HA). Elle affiche le prochain départ, « 07:42 · à l'heure », « 07:42 · +5 min » en orange ou « 07:42 · supprimé » en rouge. Un appui ouvre la liste des départs à venir : heure réelle en grand, heure prévue barrée en cas de retard, voie, train et heure d'arrivée. Les trains partis disparaissent d'eux-mêmes.

| Option   | Rôle                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`  | Titre de la tuile et de la modale.                                                                                                                          |
| `prefix` | Début des capteurs du trajet, sans le domaine ni `_train_<n>` : `sncf_paris_lyon` pour `sensor.sncf_paris_lyon_train_1`. Les capteurs absents sont ignorés. |

Pour trouver le préfixe, chercher `_train_1` dans **Paramètres → Entités** : l'intégration nomme ses capteurs `sensor.sncf_<départ>_<arrivée>_train_<n>`, avec `n` de 1 au nombre de trains choisi pour le trajet. Garder ces identifiants d'origine. Les capteurs `sncf_tous_les_trains_ligne`, `sncf_trajets` et le calendrier ne servent pas.

Le retard affiché est celui au départ, recalculé à partir des heures réelle et prévue : l'attribut `delay_minutes` de l'intégration est le retard à l'arrivée. sncf_trains 1.3.3 ne publie ni la voie ni les suppressions, et un train supprimé disparaît simplement de la liste. Le dashboard les affiche si un capteur porte les attributs `platform` (texte) ou `cancelled` (booléen), comme ceux du mock ([ADR 0027](../adr/0027-trains-sncf-par-prefixe.md)).

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
