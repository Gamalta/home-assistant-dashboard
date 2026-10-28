# Carrousel et menu rapide de la barre latérale

La barre latérale donne accès à ce qui concerne toute la maison ([ADR 0035](../adr/0035-carrousel-de-cartes-et-actions.md)). Tout se déclare dans `SideBarConfig`, dans le `House.ts` de la maison :

```ts
export const SideBarConfig: SideBarConfigType = {
  // …
  scenarios: ['script.leave_home', 'script.eco_mode'],
  shoppingListEntityId: 'todo.shopping_list',
  shortcuts: [
    {type: 'media', mediaPlayerEntityId: 'media_player.living_room_tv'},
  ],
};
```

- `scenarios` : un bouton rond « Menu rapide » en haut à gauche de la vue 3D, près de la barre latérale. Il déplie l'action « Température » puis la liste des scripts, et un appui sur l'un d'eux le lance aussitôt.
- `mortgages` : une entrée « Crédit » après les scénarios, qui ouvre le [suivi du crédit](#crédit-immobilier) de tous les prêts.
- `shoppingListEntityId` : une entrée « Courses » à la fin de ce menu, qui ouvre la [liste de courses](#liste-de-courses).
- `shortcuts` : les cartes du carrousel sous les personnes, dans l'ordre de la liste. Avec une carte [`energy`](#énergie), le menu rapide propose aussi « Énergie », avant « Crédit », qui ouvre la même modale.
  - On glisse du doigt pour passer d'une carte à l'autre, et les points en dessous indiquent la carte affichée.
  - Un appui sur un point fait défiler jusqu'à sa carte, et un appui sur une carte ouvre sa modale.

Sans carte, le carrousel ne s'affiche pas. Le menu, lui, propose toujours « Température », même sans scénario ni prêt.

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

## Température

La première action du menu n'est pas un script : « Température » affiche la carte des températures, et seules les étiquettes de thermomètre et de climatisation restent sur la vue 3D. L'action reste en surbrillance tant que la carte est affichée, et un second appui la coupe. Le réglage est mémorisé : la carte reste affichée après un rechargement. La modale Système ne le propose plus ([ADR 0041](../adr/0041-carte-des-temperatures-dans-le-menu-rapide.md)).

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

## Liste de courses

Un appui sur « Courses », dans le menu rapide, referme le menu et ouvre la modale de la liste `todo`, par exemple celle de l'intégration « Liste de courses ». Les articles y sont des tuiles, « À acheter » puis « Dans le panier », avec un emoji au dessin d'iOS tiré de leur nom : le dictionnaire de `src/utils/groceryEmoji.ts` d'abord, à compléter quand emojibase se trompe, puis les noms et mots-clés français d'emojibase ([ADR 0042](../adr/0042-emojis-apple-et-mots-cles-emojibase.md)). Un appui coche un article, dont la tuile glisse dans « Dans le panier », ou le décoche. Le champ du haut en ajoute un et le bouton du bas retire les articles cochés. La modale garde la même hauteur et la liste défile. La liste se met à jour en temps réel quand elle change ailleurs ([ADR 0023](../adr/0023-listes-todo-par-abonnement.md)).

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

La carte affiche la puissance instantanée, la période tarifaire en cours et le coût estimé du jour (« 1,2 kVA Heures creuses, Aujourd’hui : 1,15 € »). Un appui, ou l'entrée « Énergie » du menu rapide, ouvre la modale sur le mois en cours :

- en grand, la consommation du mois en kWh, son coût estimé et l'écart avec le mois précédent, en vert si l'on consomme moins, en orange si l'on consomme plus. Tant que la période n'est pas finie, l'écart est calculé « à date égale » : le 24 octobre à midi, on compare au 1er–24 septembre à midi ;
- dessous, un graphique en barres, heures pleines et heures creuses empilées, avec la période comparée en pointillés ; un appui sur une barre en donne le détail ;
- à droite (dessous sur téléphone), l'échelle (« Semaine », « Mois », « Année »), les flèches pour reculer ou avancer d'une période, la comparaison (période précédente ou « Un an avant ») et les totaux en kWh et en euros, avec le prix du kWh de `prices` sous chaque période tarifaire ;
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
