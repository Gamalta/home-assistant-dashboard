# Carrousel et menu rapide de la barre latérale

La barre latérale donne accès à ce qui concerne toute la maison ([ADR 0035](../adr/0035-carrousel-de-cartes-et-actions.md)). Tout se déclare dans `SideBarConfig`, dans le `House.ts` de la maison :

```ts
export const SideBarConfig: SideBarConfigType = {
  // …
  scenarios: ['script.leave_home', 'script.temperature', 'script.energy'],
  shortcuts: [
    {type: 'media', mediaPlayerEntityId: 'media_player.living_room_tv'},
  ],
};
```

- `scenarios` : un bouton rond « Menu rapide » en haut à gauche de la vue 3D, près de la barre latérale. Il déplie la liste des scripts, et un appui sur l'un d'eux le lance aussitôt.
- `mortgages` : une entrée « Crédit » à la fin de ce menu, qui ouvre le [suivi du crédit](#crédit-immobilier) de tous les prêts.
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
scenarios: ['script.leave_home'],
```

Les autres types gardent leur place et leurs options dans `shortcuts`.

## Scénarios

Un scénario est un [script Home Assistant](https://www.home-assistant.io/integrations/script/). Son bouton reprend le nom du script et son icône, `mdi:script-text-outline` par défaut : on les change dans Home Assistant. Un appui sur un scénario le lance sans confirmation et referme le menu, et une coche remplace l'icône du bouton rond pendant 1,5 s. Un script absent de Home Assistant n'apparaît pas.

```yaml
script:
  leave_home:
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
mortgages: ['sensor.loan_main', 'sensor.loan_ptz'],
```

Chaque prêt est une entité Home Assistant qui fournit son tableau d'amortissement ([ADR 0022](../adr/0022-echeancier-lu-dans-home-assistant.md)). Trois attributs associent chacun un mois `AAAA-MM` à un montant en euros :

| Attribut    | Montant du mois                                    |
| ----------- | -------------------------------------------------- |
| `principal` | Part de capital remboursée ; ses mois font le prêt |
| `interest`  | Part d'intérêts                                    |
| `insurance` | Assurance, facultative                             |

Le `friendly_name` nomme le prêt dans la légende. L'état n'est pas lu. Un capteur template suffit, avec les montants du tableau de la banque :

```yaml
template:
  - sensor:
      - name: Prêt principal
        default_entity_id: sensor.loan_main
        state: "{{ now().strftime('%Y-%m') }}"
        attributes:
          principal: >
            {{ {'2025-02': 120.42, '2025-03': 121.05, '2025-04': 121.18} }}
          interest: >
            {{ {'2025-02': 27.71, '2025-03': 21.92, '2025-04': 21.79} }}
          insurance: >
            {{ {'2025-02': 5.40, '2025-03': 5.40, '2025-04': 5.40} }}
```

Sur 25 ans, les attributs dépassent les 16 Ko que l'enregistreur accepte : il les ignore avec un avertissement, sans gêner le dashboard. Pour éviter l'avertissement, exclure ces entités de l'enregistreur (`recorder: exclude: entities:`).

Une seule entrée « Crédit » réunit tous les prêts. Un appui referme le menu et ouvre la modale : une maison qui se remplit jusqu'à la part remboursée et, à côté, les totaux de tous les prêts (capital restant dû, mensualité et assurance du mois, dernière échéance avec les échéances payées, intérêts payés et restants). L'échéance d'un mois compte dès le 1er du mois. Le bouton « Historique » affiche deux graphiques :

- le capital restant dû de chaque prêt, en aires empilées, avec sa part remboursée dans la légende ;
- par année, le capital remboursé, les intérêts et l'assurance, en barres empilées, sous le coût total du crédit.

Après un remboursement anticipé ou une renégociation, mettre à jour le template avec le nouveau tableau.

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
