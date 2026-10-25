# Carrousel et scénarios de la barre latérale

La barre latérale donne accès à ce qui concerne toute la maison ([ADR 0035](../adr/0035-carrousel-de-cartes-et-actions.md)). Deux listes se déclarent dans `SideBarConfig`, dans le `House.ts` de la maison :

```ts
export const SideBarConfig: SideBarConfigType = {
  // …
  scenarios: ['script.depart', 'script.temperature', 'script.energie'],
  shortcuts: [
    {type: 'media', mediaPlayerEntityId: 'media_player.living_room_tv'},
  ],
};
```

- `scenarios` : un bouton rond « Scénarios » en haut à gauche de la vue 3D, près de la barre latérale. Il déplie la liste des scripts, et un appui sur l'un d'eux le lance aussitôt.
- `shortcuts` : les cartes du carrousel sous les personnes, dans l'ordre de la liste.
  - On glisse du doigt pour passer d'une carte à l'autre, et les points en dessous indiquent la carte affichée.
  - Un appui sur un point fait défiler jusqu'à sa carte, et un appui sur une carte ouvre sa modale.

Sans l'une ou l'autre liste, rien ne s'affiche à sa place.

## Migration depuis les tuiles

« Tout éteindre » disparaît. Un script Home Assistant le remplace, déclaré dans `scenarios` :

```ts
// Avant
shortcuts: [{type: 'allLightsOff'}],
// Après
scenarios: ['script.tout_eteindre'],
```

Les autres types gardent leur place et leurs options dans `shortcuts`.

## Scénarios

Un scénario est un [script Home Assistant](https://www.home-assistant.io/integrations/script/). Son bouton reprend le nom du script et son icône, `mdi:script-text-outline` par défaut : on les change dans Home Assistant. Un appui sur un scénario le lance sans confirmation et referme le menu, et une coche remplace l'icône du bouton rond pendant 1,5 s. Un script absent de Home Assistant n'apparaît pas.

```yaml
script:
  depart:
    alias: Départ
    icon: mdi:exit-run
    sequence:
      - action: light.turn_off
        target:
          entity_id: all
      - action: climate.set_preset_mode
        target:
          entity_id: climate.sejour
        data:
          preset_mode: away
```

Un script doit pouvoir se relancer sans dommage, car un appui accidentel suffit à le lancer. Le menu tient 5 ou 6 scénarios : au-delà, il descend trop sur la vue 3D.

## Cartes

### Média

`{type: 'media', mediaPlayerEntityId: 'media_player.living_room_tv'}`

La carte affiche le nom du lecteur, la pochette, le titre et l'artiste du média en cours, ainsi que les boutons précédent, lecture ou pause et suivant que le lecteur prend en charge. Ces boutons agissent sans ouvrir la modale. Un appui ailleurs sur la carte ouvre la modale du lecteur. Un lecteur éteint ou en veille affiche « Éteint ».

| Option                | Rôle                                                  |
| --------------------- | ----------------------------------------------------- |
| `mediaPlayerEntityId` | Lecteur `media_player` : TV, Apple TV, enceinte, etc. |

### Prochains trains

`{type: 'trains', label: 'Vers le travail', prefix: 'sncf_paris_lyon'}`

Une carte par trajet de l'intégration HACS [sncf_trains](https://github.com/Master13011/SNCF-API-HA). Elle affiche les trois prochains départs : « 07:42 à l'heure », « 07:42 +5 min » en orange ou l'heure barrée et « supprimé » en rouge, et la voie si elle est connue. Un appui ouvre la liste des départs à venir : heure réelle en grand, heure prévue barrée en cas de retard, voie, train et heure d'arrivée. Les trains partis disparaissent d'eux-mêmes.

| Option   | Rôle                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`  | Titre de la carte et de la modale.                                                                                                                          |
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
