# Carte des températures : murs et extérieur

- Issue : à créer
- Statut : Validée

## Problème

La carte des températures mélange les capteurs à vol d'oiseau : la chaleur d'une pièce traverse les murs et déborde sur la pièce voisine, et une terrasse prend la température du séjour. Sur la tablette, on lit mal quelle pièce est froide, et l'extérieur n'apparaît nulle part.

## Objectif

Chaque pièce garde la température de ses capteurs jusqu'à ses murs, la chaleur ne passe d'une pièce à l'autre que par les ouvertures, et les pièces extérieures prennent la température de la météo.

## Hors périmètre

- Une simulation thermique : isolation réelle, soleil, inertie.
- L'effet du froid du dehors à travers les murs et les fenêtres des pièces intérieures.
- Les maisons à plusieurs niveaux.
- Les couleurs et l'échelle : elle reste bornée aux capteurs intérieurs.

## Comportement attendu

### Scénario : un mur arrête la chaleur

- **Étant donné** deux pièces voisines à 19 °C et 21 °C, séparées par un mur percé d'une porte
- **Quand** la carte des températures est affichée
- **Alors** chaque pièce garde la couleur de son capteur jusqu'au mur
- **Et** le passage de l'une à l'autre se fait par la porte

### Scénario : une pièce sans capteur

- **Étant donné** une pièce sans capteur, ouverte sur deux pièces mesurées
- **Quand** la carte est affichée
- **Alors** elle prend un mélange de leurs températures, d'autant plus proche de l'une que le chemin par les portes est court

### Scénario : une terrasse prend la température extérieure

- **Étant donné** une pièce marquée `outdoor: true` et la météo de la barre latérale à 5 °C
- **Quand** la carte est affichée
- **Alors** la terrasse prend la température de la météo
- **Et** plus froide que toutes les pièces, elle prend la couleur de la plus froide : l'échelle reste celle de l'intérieur

### Scénario : météo indisponible

- **Étant donné** une pièce marquée `outdoor: true` et la météo indisponible
- **Quand** la carte est affichée
- **Alors** la terrasse se colore comme une pièce sans capteur

### Scénario : un capteur placé dans un mur

- **Étant donné** un capteur dont la position tombe dans un mur ou hors du sol
- **Quand** la carte est affichée
- **Alors** il colore le sol le plus proche de sa position

## Critères d'acceptation

- [x] Le plan (sol et murs) est tiré du modèle chargé, sans fichier ni réglage en plus ([ADR 0055](../adr/0055-carte-des-temperatures-sur-le-plan-du-modele.md)).
- [x] `rooms[].outdoor` est documenté dans le [guide d'ajout d'une maison](../guides/ajouter-une-maison.md).
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : la carte ne coûte pas plus de GPU qu'avant.
- [x] Chaque scénario est couvert par un test : unitaires `utils/temperatureField.test.ts`, `rendering/floorPlan.test.ts` et `hooks/useTemperatureMap.test.ts`, E2E `e2e/heatmap.spec.ts`.

## Impacts

- Config : `outdoor?: boolean` sur une pièce. Une maison sans pièce extérieure ne change rien.
- Démo : aucune pièce extérieure ; sa carte ne change que par les murs.
- La limite de 32 capteurs disparaît : le shader ne lit plus les capteurs.
- Performance : le calcul du plan et des distances se fait sur le processeur, une fois, à l'activation de la carte ; chaque nouvelle température ne refait que le mélange.
