# Prises connectées

- Issue : #17
- Statut : Brouillon

## Problème

Les prises connectées (Zigbee, une entité `switch` et un capteur de puissance en W) n'apparaissent pas sur la tablette murale. Pour couper la prise de la TV ou savoir si un appareil est resté allumé, il faut ouvrir Home Assistant sur un téléphone.

## Objectif

Allumer ou éteindre une prise d'un appui depuis la scène 3D, et voir ce qu'elle consomme.

## Hors périmètre

- L'énergie consommée dans la journée (kWh) : les prises du propriétaire n'ont pas de capteur d'énergie.
- La coupure automatique d'un appareil en veille : c'est le rôle d'une automatisation Home Assistant.
- Les prises sans capteur de puissance restent pilotables, mais sans puissance ni historique.

## Comportement attendu

### Scénario : basculer la prise d'un appui court

- **Étant donné** la prise « Prise bureau » allumée, qui consomme 85,4 W
- **Quand** je regarde la scène, puis que j'appuie brièvement sur son bouton
- **Alors** le bouton montre l'icône de prise, en couleur ;
- **et** après l'appui, la prise s'éteint : l'icône perd sa couleur ;
- **quand** j'appuie de nouveau, la prise se rallume et l'icône reprend sa couleur.

Le bouton ne montre que l'icône : la puissance se lit dans la modale. Une prise `unavailable` est grisée et ne réagit pas.

### Scénario : ouvrir le détail de la prise d'un appui long

- **Étant donné** la prise « Prise bureau » allumée
- **Quand** je garde le doigt sur son bouton
- **Alors** la modale « Prise bureau » s'ouvre : l'illustration d'une prise murale blanche, fiche branchée et voyant bleu allumé, la puissance « 85 W » en haut, dans l'en-tête, et en dessous le bouton marche/arrêt, dans une barre d'actions comme celle des volets ;
- **quand** je touche le bouton, la fiche se débranche, le voyant s'éteint en gris et la puissance disparaît ;
- **quand** je le touche de nouveau, la fiche se rebranche et le voyant redevient bleu.

La fiche se branche et se débranche en glissant et en fondu, le voyant change de couleur en fondu. Le voyant n'a que deux états : bleu, prise allumée, et éteint, prise éteinte. La modale garde la même taille, prise allumée ou éteinte, et dans les deux onglets. La plaque reste blanche en mode sombre, comme une vraie prise.

### Scénario : basculer la prise en touchant l'illustration

- **Étant donné** la modale « Prise bureau » ouverte, prise allumée
- **Quand** je touche l'illustration
- **Alors** la prise s'éteint : la fiche se débranche ;
- **quand** je la touche de nouveau, la fiche se rebranche et la prise se rallume.

### Scénario : afficher la consommation dans un second onglet

- **Étant donné** la modale « Prise bureau » ouverte
- **Quand** je touche l'icône « Historique » de l'en-tête
- **Alors** la modale montre la puissance des dernières 24 h, avec le graphique commun du dashboard (aire pleine largeur, sans axes) et la puissance actuelle en grand ;
- **quand** je touche l'icône « Réglage », l'illustration et le bouton marche/arrêt reviennent.

La puissance s'affiche avec une décimale sous 10 W (« 0,8 W ») et au watt au-dessus, règle testée en unitaire (`src/utils/entity/outlet.test.ts`). Une prise sans capteur de puissance n'a ni puissance ni onglet Consommation.

## Critères d'acceptation

- [x] L'élément `outlet` se configure par l'entité `switch`, et en option le capteur de puissance.
- [x] L'historique de puissance n'est demandé à Home Assistant qu'à l'ouverture de l'onglet Consommation.
- [x] Le graphique passe par le composant commun `Chart` ([ADR 0031](../adr/0031-un-composant-de-graphique-unique.md)).
- [x] La démo contient deux prises fictives, dont celle de la TV, qui consomme 0,8 W.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : le bouton est un élément HTML, sans draw call ni programme de plus.

## Impacts

- Configuration des maisons : nouvel élément `outlet` ([guide](../guides/prises.md)).
- Mock Home Assistant : prises `switch.desk_outlet` et `switch.tv_outlet`, avec leurs capteurs `sensor.*_power`. La bascule passe par le service `toggle` générique du mock.
- Performance : aucun changement mesuré sur la démo (46 draw calls au repos, 0 programme compilé pendant le benchmark, aucune tâche longue en rotation).
