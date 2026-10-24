# Raccourcis de la barre latérale

Les tuiles de la barre latérale donnent accès aux actions qui concernent toute la maison ([ADR 0016](../adr/0016-tuiles-de-raccourcis.md)). Elles se déclarent dans `SideBarConfig.shortcuts`, dans le `House.ts` de la maison, et s'affichent dans l'ordre de la liste.

```ts
export const SideBarConfig: SideBarConfigType = {
  // …
  shortcuts: [{type: 'allLightsOff'}],
};
```

Sans `shortcuts`, la carte reste vide.

## Tout éteindre

`{type: 'allLightsOff'}`

La tuile affiche le nombre de lumières allumées. Un appui ouvre la liste de ces lumières, et le bouton « Éteindre » les éteint toutes en un seul appel à `light.turn_off`. Seules les lumières déclarées dans les pièces de la maison sont concernées.

| Option           | Rôle                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `scriptEntityId` | Script Home Assistant lancé à la place, par exemple pour éteindre aussi la TV ou les prises. Le dashboard n'éteint alors rien lui-même. |

## Prochains trains

`{type: 'trains', label: 'Vers le travail', prefix: 'sncf_paris_lyon'}`

Une tuile par trajet de l'intégration HACS [sncf_trains](https://github.com/Master13011/SNCF-API-HA). Elle affiche le prochain départ, « 07:42 · à l'heure », « 07:42 · +5 min » en orange ou « 07:42 · supprimé » en rouge. Un appui ouvre la liste des départs à venir : heure réelle en grand, heure prévue barrée en cas de retard, voie, train et heure d'arrivée. Les trains partis disparaissent d'eux-mêmes.

| Option   | Rôle                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`  | Titre de la tuile et de la modale.                                                                                                                          |
| `prefix` | Début des capteurs du trajet, sans le domaine ni `_train_<n>` : `sncf_paris_lyon` pour `sensor.sncf_paris_lyon_train_1`. Les capteurs absents sont ignorés. |

Pour trouver le préfixe, chercher `_train_1` dans **Paramètres → Entités** : l'intégration nomme ses capteurs `sensor.sncf_<départ>_<arrivée>_train_<n>`, avec `n` de 1 au nombre de trains choisi pour le trajet. Garder ces identifiants d'origine. Les capteurs `sncf_tous_les_trains_ligne`, `sncf_trajets` et le calendrier ne servent pas.

Le retard affiché est celui au départ, recalculé à partir des heures réelle et prévue : l'attribut `delay_minutes` de l'intégration est le retard à l'arrivée. sncf_trains 1.3.3 ne publie ni la voie ni les suppressions, et un train supprimé disparaît simplement de la liste. Le dashboard les affiche si un capteur porte les attributs `platform` (texte) ou `cancelled` (booléen), comme ceux du mock ([ADR 0027](../adr/0027-trains-sncf-par-prefixe.md)).

## Ajouter un type de tuile

1. Ajouter son type à l'union `ShortcutConfigType` de `src/configs/sidebar.d.ts`.
2. Créer `src/components/SideBar/Shortcuts/<Type>Shortcut.tsx`, qui rend un `ShortcutTile` et sa modale avec le même `id`.
3. Ajouter le `case` correspondant dans `src/components/SideBar/Shortcuts/index.tsx`.
4. Documenter la tuile dans ce guide, et ajouter ses entités au mock pour la démo et les tests.
