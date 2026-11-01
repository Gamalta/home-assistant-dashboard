# Groupes de lumières

- Issue : à créer
- Statut : Brouillon

## Problème

Une pièce éclairée par plusieurs spots se pilote souvent d'une seule entité Home Assistant : un groupe de lumières. Dans le modèle 3D, chaque spot porte le nom de l'entité de son ampoule. Configurer le groupe dans la pièce ne trouve aucune lumière du modèle : les spots ne s'allument jamais dans la scène, et comptent pourtant dans le rendu. Il faut aujourd'hui déclarer une entité par ampoule, avec un bouton chacune.

## Objectif

Un groupe de lumières configuré dans une pièce allume, éteint et colore dans la scène la lumière de chacun de ses membres.

## Hors périmètre

- Une lumière du modèle propre au groupe : le groupe passe par celles de ses membres.
- L'état propre de chaque membre : toutes les lumières suivent l'état, la luminosité et la couleur du groupe. Un membre éteint dans un groupe allumé paraît allumé.
- Les groupes de groupes : un membre qui est lui-même un groupe ne pilote que la lumière nommée d'après lui.

## Comportement attendu

Un groupe se reconnaît à ses membres, listés par Home Assistant dans l'attribut `entity_id`. Chaque membre pilote la première lumière du modèle dont le nom commence par son identifiant sans le domaine, comme une entité simple, et suit l'état, la luminosité et la couleur du groupe ([ADR 0049](../adr/0049-groupes-de-lumieres.md)).

### Scénario : un groupe allume la lumière 3D de chacun de ses membres

- **Étant donné** la démo, dont le couloir est configuré avec le groupe fictif `light.corridor_spots`, éteint, qui réunit `light.corridor_light` et `light.corridor_light_2`
- **Quand** le groupe s'allume
- **Alors** les spots `corridor_light` et `corridor_light_2` s'allument ensemble dans la scène.

### Scénario : pilote la première lumière dont le nom commence par l'identifiant

- **Étant donné** une entité sans membres, `light.corridor_light`, et un modèle qui contient `Corridor_Light` puis `Corridor_Light_2`
- **Quand** la scène se charge
- **Alors** l'entité pilote `Corridor_Light` seule, comme avant.

### Scénario : ignore les membres sans lumière dans le modèle

- **Étant donné** un groupe qui réunit une ampoule nommée dans le modèle et un ruban LED qui n'y est pas
- **Quand** la scène se charge
- **Alors** le groupe pilote la lumière de l'ampoule et ignore le ruban.

## Critères d'acceptation

- [x] Un groupe pilote la lumière de chacun de ses membres, et une entité sans membres se comporte comme avant.
- [x] Les lumières d'un groupe s'allument et s'éteignent ensemble, avec la même animation et une seule compilation de shaders.
- [x] La démo contient un groupe fictif, pilotable depuis les E2E par `window.__mockSetState`.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : mêmes draw calls, aucun programme compilé pendant une rotation.

## Impacts

- Configuration des maisons : rien de nouveau, `lightEntityId` accepte un groupe ([guide](../guides/ajouter-une-maison.md)).
- Démo et mock : le couloir passe de `light.corridor_light` au groupe `light.corridor_spots`. Son second spot, `corridor_light_2`, n'était piloté par aucune entité.
- Performance : un spot du couloir de moins dans les shaders tant que le groupe est éteint.
