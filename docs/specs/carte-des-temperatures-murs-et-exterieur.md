# Carte des températures : murs et extérieur

- Issue : à créer
- Statut : Validée

## Problème

La carte des températures mélange les capteurs à vol d'oiseau :

- la chaleur d'une pièce traverse les murs et déborde sur la pièce voisine ;
- chaque capteur dessine une cible ronde ;
- une terrasse prend la température du séjour.

Sur la tablette, on lit mal quelle pièce est froide.

## Objectif

Chaque pièce garde la température de ses capteurs jusqu'à ses murs, et la chaleur ne passe d'une pièce à l'autre que par les portes. Les pièces extérieures restent hors de la carte.

## Hors périmètre

- Une simulation thermique : isolation réelle, soleil, inertie.
- Les écarts à l'intérieur d'une pièce, que ses capteurs ne mesurent pas.
- La température extérieure sur la carte.
- Les maisons à plusieurs niveaux.

## Comportement attendu

### Scénario : un mur arrête la chaleur

- **Étant donné** deux pièces voisines à 19 °C et 21 °C, séparées par un mur percé d'une porte
- **Quand** la carte des températures est affichée
- **Alors** chaque pièce garde la couleur de son capteur jusqu'à ses murs
- **Et** le passage de l'une à l'autre se fait en fondu, près de la porte

### Scénario : une pièce sans capteur

- **Étant donné** une pièce sans capteur, ouverte sur deux pièces mesurées
- **Quand** la carte est affichée
- **Alors** elle prend un mélange de leurs températures, d'autant plus proche de l'une que le chemin par les portes est court

### Scénario : plusieurs capteurs dans une même pièce

- **Étant donné** une pièce ouverte, un séjour et sa cuisine sans mur entre eux, avec un capteur de chaque côté
- **Quand** la carte est affichée
- **Alors** la pièce passe de la température de l'un à celle de l'autre, sans tenir compte des pièces voisines

### Scénario : les meubles et les portes ouvertes ne comptent pas

- **Étant donné** une pièce mesurée avec une porte ouverte, une baignoire ou un meuble
- **Quand** la carte est affichée
- **Alors** la pièce garde une seule couleur, autour d'eux comme derrière eux

### Scénario : une terrasse reste hors de la carte

- **Étant donné** une pièce marquée `outdoor: true`, avec ou sans capteur
- **Quand** la carte est affichée
- **Alors** son sol garde son matériau, translucide comme le reste de la maison
- **Et** ses capteurs ne colorent pas les pièces voisines et ne comptent pas dans l'échelle

### Scénario : un capteur placé dans un mur

- **Étant donné** un capteur dont la position tombe dans un mur ou hors du sol
- **Quand** la carte est affichée
- **Alors** il colore la pièce la plus proche de sa position

## Critères d'acceptation

- [x] Le plan (sol, murs, pièces) est tiré du modèle chargé, sans fichier ni réglage en plus ([ADR 0055](../adr/0055-carte-des-temperatures-sur-le-plan-du-modele.md)).
- [x] `rooms[].outdoor` est documenté dans le [guide d'ajout d'une maison](../guides/ajouter-une-maison.md).
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : la carte ne coûte pas plus de GPU qu'avant.
- [x] Chaque scénario est couvert par un test :
  - unitaires : `utils/temperatureField.test.ts`, `rendering/floorPlan.test.ts` et `hooks/useTemperatureMap.test.ts` ;
  - E2E : `e2e/heatmap.spec.ts`.

## Impacts

- Config : `outdoor?: boolean` sur une pièce. Une maison sans pièce extérieure ne change rien.
- Modèle : seuls les murs `wall_*` séparent les pièces. Un sol de terrasse doit avoir son propre matériau.
- Démo : aucune pièce extérieure ; sa carte change par les murs et les pièces.
- La limite de 32 capteurs disparaît : le shader ne lit plus les capteurs.
- Performance : le calcul du plan et des distances se fait sur le processeur, une fois, à l'activation de la carte ; chaque nouvelle température ne refait que le mélange.
