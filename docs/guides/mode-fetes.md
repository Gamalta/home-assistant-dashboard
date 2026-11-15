# Mode fêtes

Du 1er décembre au 6 janvier, une neige légère tombe derrière la maison 3D et sur l'écran de veille, et un sapin aux guirlandes changeantes peut s'installer dans la maison. Le comportement attendu est décrit dans la [spec](../specs/mode-fetes.md).

## Régler

Dans la modale **Configuration** (dock de la barre latérale, ou Foyer sur téléphone), la ligne « Mode fêtes » propose :

| Choix                  | Effet                                         |
| ---------------------- | --------------------------------------------- |
| Du 1er déc. au 6 janv. | Par défaut : neige et sapin pendant les fêtes |
| Toujours               | Toute l'année, par exemple pour une démo      |
| Jamais                 | Ni neige ni sapin                             |

Le choix est propre à l'appareil.

## Ajouter un sapin

Dans `HouseConfig` de la maison :

```ts
christmasTree: {
  position: {x: -0.5, y: 0, z: 1.8}, // pied du sapin, sur le sol
  height: 1.6, // en mètres, facultatif
  switchEntityId: 'switch.christmas_tree', // facultatif
},
```

- Sans `switchEntityId`, les guirlandes restent allumées. Avec, elles suivent la prise : coupée, elles s'éteignent et la scène ne se redessine plus.
- Pour allumer ou couper la prise depuis le dashboard, ajouter aussi un élément [`outlet`](prises.md) sur cette prise.
- Un sapin trop près d'un mur de façade se cache derrière lui : le placer au fond de la pièce, vu de la caméra.

## Bon à savoir

- La neige ne fait redessiner aucune image de la scène 3D : elle tombe derrière le canvas, animée par le compositeur du navigateur ([ADR 0056](../adr/0056-neige-en-web-animations-derriere-la-scene.md)).
- Elle s'arrête quand le système demande de réduire les animations.
- Guirlandes allumées, la scène se redessine une fois toutes les 2 s pour changer leurs couleurs ([ADR 0057](../adr/0057-sapin-redessine-par-pas.md)). Pas d'animation continue : elle coûterait une image toutes les 16 ms.
