# Carrousel et scénarios de la barre latérale

La barre latérale donne accès à ce qui concerne toute la maison ([ADR 0035](../adr/0035-carrousel-de-cartes-et-actions.md)). Tout se déclare dans `SideBarConfig`, dans le `House.ts` de la maison :

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
- `mortgages` : une entrée « Crédit » par prêt à la fin de ce menu, qui ouvre le [suivi du crédit](#crédit-immobilier).
- `shortcuts` : les cartes du carrousel sous les personnes, dans l'ordre de la liste.
  - On glisse du doigt pour passer d'une carte à l'autre, et les points en dessous indiquent la carte affichée.
  - Un appui sur un point fait défiler jusqu'à sa carte, et un appui sur une carte ouvre sa modale.

Sans scénario ni prêt, le menu ne s'affiche pas. Sans carte, le carrousel non plus.

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

## Crédit immobilier

```ts
mortgages: [
  {
    label: 'Crédit maison',
    principal: 250_000,
    annualRate: 1.45,
    durationMonths: 300,
    firstPaymentDate: '2021-06-05',
    monthlyInsurance: 28,
  },
],
```

Chaque prêt ajoute une entrée « Crédit » à la fin du menu des scénarios. Un appui referme le menu et ouvre la modale du prêt : une maison qui se remplit jusqu'à la part remboursée et, à côté, le capital restant dû, la mensualité, la date de fin avec les échéances payées, et les intérêts payés et restants. Le bouton « Historique » affiche la courbe du capital restant dû, année par année jusqu'à la fin du prêt. Le calcul suppose un prêt à taux fixe et à échéances constantes ([ADR 0022](../adr/0022-credit-calcule-par-le-dashboard.md)).

| Option             | Rôle                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `principal`        | Montant emprunté, en euros                                                                  |
| `annualRate`       | Taux nominal annuel, en %                                                                   |
| `durationMonths`   | Nombre d'échéances                                                                          |
| `firstPaymentDate` | Date de la première échéance, au format `AAAA-MM-JJ` ; le jour donne le jour de prélèvement |
| `monthlyInsurance` | Assurance mensuelle, facultative                                                            |
| `label`            | Libellé de l'entrée et de la modale, `Crédit` par défaut ; utile pour plusieurs prêts       |

Après un remboursement anticipé, remplacer `principal`, `durationMonths` et `firstPaymentDate` par les valeurs du nouvel échéancier.

## Cartes

### Média

`{type: 'media', mediaPlayerEntityId: 'media_player.living_room_tv'}`

La carte affiche le nom du lecteur, la pochette, le titre et l'artiste du média en cours, ainsi que les boutons précédent, lecture ou pause et suivant que le lecteur prend en charge. Ces boutons agissent sans ouvrir la modale. Un appui ailleurs sur la carte ouvre la modale du lecteur. Un lecteur éteint ou en veille affiche « Éteint ».

| Option                | Rôle                                                  |
| --------------------- | ----------------------------------------------------- |
| `mediaPlayerEntityId` | Lecteur `media_player` : TV, Apple TV, enceinte, etc. |

## Ajouter un type de carte

1. Ajouter son type à l'union `ShortcutConfigType` de `src/configs/sidebar.d.ts`.
2. Créer `src/components/SideBar/Shortcuts/<Type>Shortcut.tsx`. Il rend un `ShortcutCard` et sa modale, avec le même `id`.
   - Le contenu tient en 3 ou 4 lignes courtes, soit environ 300 × 130 px à 1280 × 800. Le détail va dans la modale.
   - Les textes sont des `span` (`component="span"`), car la carte est un bouton.
   - Les boutons de la carte passent par `controls` : un bouton ne peut pas en contenir un autre.
3. Ajouter le `case` correspondant dans `src/components/SideBar/Shortcuts/index.tsx`.
4. Documenter la carte dans ce guide, et ajouter ses entités au mock pour la démo et les tests.
