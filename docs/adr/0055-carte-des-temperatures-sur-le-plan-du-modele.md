# 0055 — Carte des températures diffusée sur le plan du modèle

- Statut : Proposé
- Date : 2026-11-06
- Issue : à créer

## Contexte

Le shader du sol mélangeait jusqu'à 32 capteurs pour chaque pixel, pondérés par l'inverse du carré de leur distance à vol d'oiseau. Il ne connaissait ni les murs ni l'extérieur :

- la chaleur d'une pièce débordait sur la voisine ;
- chaque capteur dessinait une cible ronde ;
- une terrasse prenait la température du séjour.

La tablette est limitée par son GPU ([ADR 0009](0009-budget-performance-tablette.md)) : la correction ne doit rien lui ajouter.

Le modèle porte déjà ce qu'il faut : les sols (`room_*`) et les murs (`wall_*`) se reconnaissent à leur matériau ([ADR 0004](0004-scenematerials-proprietaire-unique.md)). Coupés à 50 cm du sol, sous l'allège des fenêtres, les murs laissent les portes ouvertes, sur la démo comme sur l'appartement. Le matériau `white` s'efface comme un mur, mais il habille aussi les portes ouvertes, les sanitaires et des meubles : il ne compte pas pour le plan.

## Décision

La carte se calcule sur le processeur, sur un plan du modèle en cellules de 10 cm. Le shader du sol ne fait plus que lire une texture.

- **Plan** (`rendering/floorPlan.ts`) :
  - le sol est fait des cellules dont le centre tombe sur un sol, moins celles que traversent les murs `wall_*` à 50 cm ;
  - une étendue de sol qui n'atteint nulle part 50 cm de large est l'intérieur d'un mur épais, entre ses deux faces : elle quitte le sol.

  Le plan se recalcule à chaque activation de la carte.

- **Distances** (`utils/temperatureField.ts`) : de chaque capteur à chaque cellule, en contournant les murs (Dijkstra sur les huit voisins). Elles ne dépendent que des murs et de la place des capteurs, et se calculent une fois, à l'activation.
- **Températures** : la carte est le régime permanent de l'équation de la chaleur sur le plan.
  - Chaque capteur fixe sa température à moins de 50 cm de lui.
  - Les murs isolent, les portes laissent passer : chaque autre cellule de sol prend la moyenne de ses voisines.
  - Un peu de pertes : chaque cellule tend aussi vers la moyenne des capteurs pondérée par l'inverse du carré de leur distance, en contournant les murs. Loin de ses portes, une pièce sans capteur prend ce mélange plutôt que la température de sa voisine.
  - La surrelaxation part de la carte précédente, ou du capteur le plus proche, et s'arrête quand plus rien ne bouge d'un millième de degré.

  Le résultat part dans une texture en demi-flottants, posée sur le sol en coordonnées monde comme le plan de l'aspirateur ([ADR 0051](0051-plan-de-l-aspirateur-sur-le-sol-de-la-scene.md)).

- **Extérieur** : une pièce marquée `outdoor: true` reste hors de la carte.
  - Le sol sous sa position, trouvé par un rayon vertical, quitte le plan et garde son matériau, translucide comme le reste de la maison.
  - Ses capteurs ne comptent ni pour la diffusion ni pour l'échelle des couleurs.

## Conséquences

- La limite de 32 capteurs disparaît : le shader du sol ne fait plus qu'une lecture de texture par pixel.
- Sur la démo (Mac M4, `pnpm bench`), le rendu ne bouge pas au-delà du bruit : 8 à 9,4 ms de GPU par image avant, sur deux mesures, contre 8,6 à 9 après. Le surcoût de la carte vient de la maison rendue translucide, pas du shader du sol.
- Le processeur travaille à l'activation : environ 150 ms sur la démo comme sur l'appartement (M4 chargé). Il retravaille à chaque nouvelle température : 40 à 50 ms, une vingtaine quand la carte d'avant est proche. Il reste à mesurer sur la tablette.
- Une pièce sans capteur tient de ses voisines près de ses portes, et du mélange des capteurs au-delà. Une pièce fermée à 50 cm, sans passage dans le modèle, prend ce mélange.
- Les pertes éloignent un peu une grande pièce de son capteur, de quelques dixièmes de degré à l'autre bout.
- Un vrai mur modélisé en `white` laisse passer la chaleur.
- Une terrasse doit avoir un sol à elle : une terrasse qui partagerait le matériau du séjour l'emporterait hors de la carte avec elle.
- Le modèle doit avoir ses sols au même niveau : une maison à étages demanderait un plan par niveau.

## Alternatives considérées

- **Un seul mélange de tous les capteurs** en 1/d², en contournant les murs (première version de cette décision). Chaque capteur dessinait une cible ronde, et une grande pièce mesurée changeait de couleur d'un coin à l'autre.
- **Des pièces uniformes, en fondu près des portes**, séparées par les murs coupés sous le plafond (deuxième version). Trop peu de diffusion, et un couloir bordé de portes perdait sa propre mesure.
- **La diffusion sans pertes**, les murs parfaitement isolants (troisième version) : une pièce sans capteur copiait sa voisine, et les pièces fermées au-dessus du couloir de l'appartement en prenaient les 20 °C.
- **La météo sur les terrasses**, mêlée au reste selon la distance au centre des pièces : essayée sur l'appartement.
  - La couleur d'une terrasse n'apprend rien.
  - La limite tombait à mi-chemin des centres, et refroidissait la moitié du séjour.
- **Les murs en `white` dans le plan** : les portes ouvertes, la baignoire et les éviers faisaient des ombres en plein milieu des pièces.
- **La diffusion avec l'extérieur fixé** à la température de la météo, et des capteurs d'une seule cellule : essayée sur la démo. Un capteur pesait trop peu face à l'extérieur, et les pièces tombaient vers 13 °C quand il faisait 5 °C dehors.
- **Détecter l'extérieur dans le modèle**, en remplissant le plan depuis ses bords : le remplissage entre par les portes-fenêtres, et classe dehors 85 % du sol de l'appartement.
- **Les murs dans le shader**, en segments testés pour chaque pixel et chaque capteur : un coût GPU multiplié, sur la ressource qui manque à la tablette.
- **Un plan précalculé dans Blender**, à côté du modèle : un fichier et un script de plus, à refaire à chaque modification du modèle, pour un calcul de quelques millisecondes.
