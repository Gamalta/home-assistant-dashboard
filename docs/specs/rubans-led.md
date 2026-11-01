# Rubans LED

- Issue : à créer
- Statut : Brouillon

## Problème

Un ruban LED s'éclaire dans la scène comme une ampoule : un seul spot, qui dessine une tache ronde sur le mur ou le meuble qu'il éclaire. Le ruban de la tête de lit, du bar ou de la cuisine ne ressemble pas à un ruban, ni l'Ambilight à un halo autour de la TV.

## Objectif

Un ruban LED éclaire une bande sur toute sa longueur.

## Hors périmètre

- Une vraie source linéaire : three.js n'en éclaire que les matériaux physiques, pas les matériaux Lambert de la scène ([ADR 0052](../adr/0052-rubans-led-en-plusieurs-spots.md)).
- L'intensité : chaque spot du ruban garde celle d'une lumière.
- Les couleurs par zone : les quatre spots prennent la couleur que donne Home Assistant, même pour un ruban WLED en effet ou un Ambilight HyperHDR.

## Comportement attendu

Un ruban LED est fait de quatre spots répartis sur sa longueur : le spot qui porte le nom de l'entité et trois copies Blender (`.001`, `.002`, `.003`). Un Ambilight en compte un par côté de la TV, tourné vers le mur. L'entité pilote le spot et ses copies, qui s'allument, s'éteignent et changent de couleur ensemble.

### Scénario : un ruban LED allume ses quatre spots

- **Étant donné** la démo, dont la TV du séjour porte le ruban fictif `light.living_room_led_strip`, éteint
- **Quand** le ruban s'allume
- **Alors** ses quatre spots s'allument ensemble dans la scène.

### Scénario : pilote aussi les copies de la lumière, comme les spots d'un ruban

- **Étant donné** un modèle qui contient `Bedroom_Led_Strip`, `Bedroom_Led_Strip.001` et `Bedroom_Led_Strip.002`
- **Quand** la scène se charge
- **Alors** l'entité `light.bedroom_led_strip` pilote les trois spots.

### Scénario : pilote la première lumière dont le nom commence par l'identifiant

- **Étant donné** une entité `light.corridor_light`, et un modèle qui contient `Corridor_Light` puis `Corridor_Light_2`
- **Quand** la scène se charge
- **Alors** l'entité pilote `Corridor_Light` seule : un nom qui prolonge l'identifiant n'est pas une copie.

## Critères d'acceptation

- [x] Une lumière et ses copies Blender suivent la même entité ; une lumière sans copie se comporte comme avant.
- [x] Les cinq rubans de l'appartement, Ambilight compris, et le ruban fictif de la démo comptent quatre spots chacun.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : mêmes draw calls, aucun programme compilé pendant une rotation.

## Impacts

- Modèles : un ruban se modélise en quatre spots ([guide](../guides/ajouter-une-maison.md)). Les spots ajoutés au chunk JSON des modèles optimisés disparaîtraient avec un nouvel export Blender, comme les lumières d'appoint de l'appartement.
- Démo et mock : la TV du séjour reçoit le ruban fictif `light.living_room_led_strip`.
- Performance : un ruban allumé compte quatre spots dans les shaders au lieu d'un.
