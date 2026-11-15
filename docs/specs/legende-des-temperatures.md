# Légende des températures et consigne des climatisations

- Issue : à créer
- Statut : Validée

## Problème

La carte des températures colore le sol du bleu au rouge, mais rien ne dit quelle température porte chaque couleur : l'échelle change avec les capteurs et le réglage « Échelle des températures ». Sur la vue 3D, l'étiquette d'une climatisation ne donne que la température mesurée : il faut ouvrir sa modale pour connaître la consigne.

## Objectif

On lit sans rien ouvrir la température d'une couleur de la carte, et la consigne de chaque climatisation à côté de sa mesure.

## Hors périmètre

- Mettre en évidence sur le sol la couleur survolée dans la légende.
- La consigne sur les tuiles de la version mobile, qui l'affichent déjà (« Consigne 25° »).
- Changer la température mesurée affichée : c'est toujours celle de l'entité climat.

## Comportement attendu

### Scénario : survoler la légende donne la température d'une couleur

- **Étant donné** la carte des températures affichée
- **Quand** l'utilisateur survole le dégradé de la légende, en bas de la vue 3D
- **Alors** la légende va du capteur le plus froid au plus chaud, comme le sol, et n'en montre que les couleurs
- **Et** un repère de la couleur survolée en donne la température, au dixième de degré
- **Et** le repère disparaît quand la souris quitte le dégradé, et la légende quand la carte se coupe

### Scénario : la légende suit l'échelle des températures

- **Étant donné** la carte des températures affichée, avec des capteurs de 19 à 21 °C et l'échelle « Équilibrée » (18 à 22 °C)
- **Quand** l'utilisateur choisit « Douce (8 °C) » dans la modale Configuration
- **Alors** la légende garde ses bornes, 19 et 21 °C
- **Et** son dégradé se resserre sur le vert et le jaune, comme le sol, sans bleu ni rouge

### Scénario : la légende se pose au-dessus du carrousel et répond au doigt

- **Étant donné** la carte des températures affichée sur un téléphone
- **Quand** l'utilisateur touche le dégradé ou y glisse le doigt
- **Alors** la légende se trouve au-dessus du carrousel des pièces
- **Et** la température de la couleur touchée reste affichée une fois le doigt levé

### Scénario : l'étiquette d'une climatisation donne sa consigne

- **Étant donné** une climatisation qui chauffe à 25 °C une pièce à 20 °C
- **Quand** la vue 3D s'affiche
- **Alors** son étiquette indique « 20° » et, en indice, « /25° »

### Scénario : pas de consigne à l'arrêt

- **Étant donné** une climatisation arrêtée
- **Quand** la vue 3D s'affiche
- **Alors** son étiquette n'indique que la température mesurée

## Critères d'acceptation

- [x] La légende ne montre que les couleurs du sol : celles des capteurs extrêmes sur l'échelle (`getTemperatureRange`), et les couleurs de `HEATMAP_COLORS` entre elles (`heatmapGradient`).
- [x] En WebGPU aussi, le sol dégagé reprend au pixel près les couleurs de la légende : le tone mapping se coupe tant que la carte est affichée ([ADR 0056](../adr/0056-carte-des-temperatures-sans-tone-mapping-en-webgpu.md)). Vérifié à la main, les E2E ne tournant qu'en WebGL.
- [x] Budget de performance : rien de nouveau dans la scène, la légende est hors du `Canvas`.
- [x] Chaque scénario est couvert par un test :
  - E2E : `e2e/heatmap.spec.ts` ;
  - unitaires : `HeatmapLegend.test.tsx`, `HeatmapGroundMaterial/common.test.ts` et `RoomItem/RoomClimate.test.tsx`.

## Impacts

- Les shaders du sol (WebGL et WebGPU) répètent les couleurs de `HEATMAP_COLORS` : les changer demande de changer les trois.
- En WebGPU, la maison translucide autour du sol perd le tone mapping tant que la carte est affichée.
- Le nom accessible d'une étiquette de climatisation devient « 20°, consigne 25° » quand elle a une consigne.
