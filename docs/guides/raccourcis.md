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
