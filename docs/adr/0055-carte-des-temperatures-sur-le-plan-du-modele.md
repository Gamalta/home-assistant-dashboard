# 0055 — Carte des températures calculée sur le plan du modèle

- Statut : Proposé
- Date : 2026-11-06
- Issue : à créer

## Contexte

Le shader du sol mélangeait jusqu'à 32 capteurs pour chaque pixel, pondérés par l'inverse du carré de leur distance à vol d'oiseau. Il ne connaissait ni les murs ni l'extérieur :

- la chaleur d'une pièce débordait sur la voisine ;
- chaque capteur dessinait une cible ronde ;
- une terrasse prenait la température du séjour.

La tablette est limitée par son GPU ([ADR 0009](0009-budget-performance-tablette.md)) : la correction ne doit rien lui ajouter.

Le modèle porte déjà ce qu'il faut, car les sols (`room_*`) et les murs (`wall_*`) se reconnaissent à leur matériau ([ADR 0004](0004-scenematerials-proprietaire-unique.md)) :

- coupés à 50 cm du sol, sous l'allège des fenêtres, les murs laissent les portes ouvertes ;
- coupés 15 cm sous leur sommet, au-dessus des portes, ils ferment chaque pièce par ses linteaux.

C'est vrai sur la démo comme sur l'appartement. Le matériau `white` s'efface comme un mur, mais il habille aussi les portes ouvertes, les sanitaires et des meubles : il ne compte pas pour le plan.

## Décision

La carte se calcule sur le processeur, sur un plan du modèle en cellules de 10 cm. Le shader du sol ne fait plus que lire une texture.

- **Plan** (`rendering/floorPlan.ts`) :
  - le sol est fait des cellules dont le centre tombe sur un sol, moins celles que traversent les murs à 50 cm ;
  - les pièces sont les étendues de sol que séparent les murs coupés sous leur sommet ;
  - une étendue qui n'atteint nulle part 50 cm de large est l'intérieur d'un mur épais, entre ses deux faces : elle quitte le sol ;
  - le sol laissé hors des pièces est le passage d'une porte.

  Le plan se recalcule à chaque activation de la carte.

- **Distances** (`utils/temperatureField.ts`) : de chaque capteur à chaque cellule, et de chaque cellule à la porte la plus proche, en contournant les murs (Dijkstra sur les huit voisins).
  - Traverser 10 cm de mur coûte autant que 2 m de sol : une cellule enfermée reçoit quand même une température.
  - Elles ne dépendent que des murs et de la place des capteurs, et se calculent une fois, à l'activation.
- **Températures** : elles se recalculent à chaque nouvelle valeur, en quelques millisecondes.
  - Une pièce mesurée prend la température de ses capteurs jusqu'à ses murs. Avec plusieurs capteurs, la pièce mêle les siens en 1/d².
  - À moins de 75 cm d'une porte, la pièce passe en fondu à la température du passage.
  - Ailleurs (pièces sans capteur, passages), tous les capteurs se mêlent en 1/d².
  - Le résultat part dans une texture en demi-flottants, posée sur le sol en coordonnées monde comme le plan de l'aspirateur ([ADR 0051](0051-plan-de-l-aspirateur-sur-le-sol-de-la-scene.md)).
- **Extérieur** : une pièce marquée `outdoor: true` reste hors de la carte.
  - Le sol sous sa position, trouvé par un rayon vertical, quitte le plan et garde son matériau, translucide comme le reste de la maison.
  - Ses capteurs ne comptent ni pour le mélange ni pour l'échelle des couleurs.

## Conséquences

- La limite de 32 capteurs disparaît : le shader du sol ne fait plus qu'une lecture de texture par pixel.
- Sur la démo (Mac M4, `pnpm bench`), le rendu ne bouge pas au-delà du bruit : 8 à 9,4 ms de GPU par image avant, sur deux mesures, contre 8,6 à 9 après. Le surcoût de la carte vient de la maison rendue translucide, pas du shader du sol.
- L'activation de la carte coûte un calcul sur le processeur, proportionnel au nombre de capteurs : environ 80 ms sur la démo et 55 ms sur l'appartement (M4). Il reste à mesurer sur la tablette.
- Une pièce mesurée a une seule couleur : la carte ne montre pas le côté fenêtre plus froid, que les capteurs ne disent pas.
- Un vrai mur modélisé en `white` laisse passer la chaleur, et une pièce dont les portes n'ont pas de linteau en `wall_*` se confond avec la voisine.
- Une terrasse doit avoir un sol à elle : une terrasse qui partagerait le matériau du séjour l'emporterait hors de la carte avec elle.
- Le modèle doit avoir ses sols au même niveau : une maison à étages demanderait un plan par niveau.

## Alternatives considérées

- **Un seul mélange de tous les capteurs sur toute la maison**, en contournant les murs (la première version de cette décision). Chaque capteur dessinait une cible ronde, et une grande pièce mesurée changeait de couleur d'un coin à l'autre.
- **La météo sur les terrasses**, mêlée au reste selon la distance au centre des pièces : essayée sur l'appartement.
  - La couleur d'une terrasse n'apprend rien.
  - La limite tombait à mi-chemin des centres, et refroidissait la moitié du séjour.
- **Les murs en `white` dans le plan** : les portes ouvertes, la baignoire et les éviers faisaient des ombres en plein milieu des pièces.
- **Diffusion de la chaleur en régime permanent** sur le même plan, avec les capteurs et l'extérieur fixés et des murs peu conducteurs : essayée sur la démo.
  - Réduit à une cellule, un capteur pèse trop peu : les pièces tombent vers 13 °C quand il fait 5 °C dehors.
  - Chaque nouvelle valeur demande des centaines d'itérations.
- **Détecter l'extérieur dans le modèle**, en remplissant le plan depuis ses bords : le remplissage entre par les portes-fenêtres, et classe dehors 85 % du sol de l'appartement.
- **Les murs dans le shader**, en segments testés pour chaque pixel et chaque capteur : un coût GPU multiplié, sur la ressource qui manque à la tablette.
- **Un plan précalculé dans Blender**, à côté du modèle : un fichier et un script de plus, à refaire à chaque modification du modèle, pour un calcul de quelques millisecondes.
