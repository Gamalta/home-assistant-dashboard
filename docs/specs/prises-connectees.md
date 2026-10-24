# Prises connectées

- Issue : #17
- Statut : Brouillon

## Problème

Les prises connectées (Zigbee, une entité `switch` et un capteur de puissance en W) n'apparaissent pas sur la tablette murale. Pour couper la prise de la TV ou savoir si un appareil est resté allumé, il faut ouvrir Home Assistant sur un téléphone.

## Objectif

Allumer ou éteindre une prise d'un appui depuis la scène 3D, voir ce qu'elle consomme, et repérer un appareil resté en veille.

## Hors périmètre

- L'énergie consommée dans la journée (kWh) : les prises du propriétaire n'ont pas de capteur d'énergie.
- La coupure automatique d'un appareil en veille : c'est le rôle d'une automatisation Home Assistant.
- Les prises sans capteur de puissance restent pilotables, mais sans puissance ni historique.

## Comportement attendu

### Scénario : basculer la prise d'un appui court

- **Étant donné** la prise « Prise bureau » allumée, qui consomme 85,4 W
- **Quand** je regarde la scène, puis que j'appuie brièvement sur son bouton
- **Alors** le bouton montre l'icône de prise, en couleur, et « 85 W » ;
- **et** après l'appui, la prise s'éteint : l'icône perd sa couleur et la puissance disparaît ;
- **quand** j'appuie de nouveau, la prise se rallume et « 85 W » revient.

La puissance s'affiche avec une décimale sous 10 W (« 0,8 W ») et au watt au-dessus. Elle n'est montrée que prise allumée, quand le capteur la connaît. Une prise `unavailable` est grisée et ne réagit pas.

### Scénario : ouvrir le détail de la prise d'un appui long

- **Étant donné** la prise « Prise bureau » allumée
- **Quand** je garde le doigt sur son bouton
- **Alors** la modale « Prise bureau » s'ouvre, avec la puissance « 85 W », l'état « Allumée », un interrupteur et le graphe de la puissance des dernières 24 h ;
- **quand** j'actionne l'interrupteur, l'état passe à « Éteinte » et la puissance disparaît.

### Scénario : signaler une prise en veille

- **Étant donné** la prise « Prise TV » allumée, qui consomme 0,8 W, sous le seuil de veille
- **Quand** j'ouvre sa modale
- **Alors** le bouton de la scène affiche « 0,8 W », et la modale affiche « 0,8 W » et l'état « En veille ».

Le seuil vaut 5 W par défaut et se règle par prise. Une prise éteinte n'est jamais « en veille », et une prise allumée dont la puissance est inconnue est « Allumée ». Ces règles se testent en unitaire (`src/utils/entity/plug.test.ts`).

## Critères d'acceptation

- [x] L'élément `plug` se configure par l'entité `switch`, et en option le capteur de puissance et le seuil de veille.
- [x] L'historique de puissance n'est demandé à Home Assistant qu'à l'ouverture de la modale.
- [x] La démo contient deux prises fictives, dont celle de la TV en veille.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : le bouton est un élément HTML, sans draw call ni programme de plus.

## Impacts

- Configuration des maisons : nouvel élément `plug` ([guide](../guides/prises.md)).
- Mock Home Assistant : prises `switch.desk_plug` et `switch.tv_plug`, avec leurs capteurs `sensor.*_power`. La bascule passe par le service `toggle` générique du mock.
- Performance : aucun changement mesuré sur la démo (46 draw calls au repos, 0 programme compilé pendant le benchmark, aucune tâche longue en rotation).
