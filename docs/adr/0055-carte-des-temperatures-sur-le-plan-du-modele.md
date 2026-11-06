# 0055 — Carte des températures calculée sur le plan du modèle

- Statut : Proposé
- Date : 2026-11-06
- Issue : à créer

## Contexte

Le shader du sol mélangeait jusqu'à 32 capteurs pour chaque pixel, pondérés par l'inverse du carré de leur distance à vol d'oiseau. Il ne connaissait ni les murs ni l'extérieur : la chaleur d'une pièce débordait sur la voisine, et une terrasse prenait la température du séjour. La tablette est limitée par son GPU ([ADR 0009](0009-budget-performance-tablette.md)) : la correction ne doit rien lui ajouter.

Le modèle porte déjà ce qu'il faut : les sols (`room_*`) et les murs (`wall_*`, `white`, `yellowbrt`) se reconnaissent à leur matériau ([ADR 0004](0004-scenematerials-proprietaire-unique.md)). Coupés à 50 cm du sol, sous l'allège des fenêtres, les murs dessinent les pièces avec leurs portes ouvertes, sur la démo comme sur l'appartement.

## Décision

La carte se calcule sur le processeur, sur un plan du modèle en cellules de 10 cm, et le shader du sol ne fait plus que lire une texture.

- **Plan** (`rendering/floorPlan.ts`) : les cellules dont le centre tombe sur un sol, moins celles que traversent les murs à 50 cm de hauteur. Il se recalcule à chaque activation de la carte, en une quinzaine de millisecondes.
- **Distances** (`utils/temperatureField.ts`) : de chaque capteur à chaque cellule, en contournant les murs (Dijkstra sur les huit voisins). Traverser 10 cm de mur coûte 2 m : une cellule enfermée reçoit quand même une température. Elles ne dépendent que des murs et de la place des capteurs, et se calculent une fois à l'activation.
- **Températures** : même mélange en 1/d² qu'avant, sur ces distances. Il se refait à chaque nouvelle valeur, en quelques millisecondes. Le résultat part dans une texture en demi-flottants, posée sur le sol en coordonnées monde comme le plan de l'aspirateur ([ADR 0051](0051-plan-de-l-aspirateur-sur-le-sol-de-la-scene.md)).
- **Extérieur** : une pièce marquée `outdoor: true` prend la température de la météo de la barre latérale. La part qui lui revient dans chaque cellule se calcule comme une température, en 1/d⁴, à partir des distances au centre de toutes les pièces. La terrasse est donc presque entièrement à la météo, et une pièce voisine sans capteur garde la température de l'intérieur. L'échelle de couleurs reste bornée aux capteurs intérieurs.

## Conséquences

- La limite de 32 capteurs disparaît : le shader du sol ne fait plus qu'une lecture de texture par pixel.
- Sur la démo (Mac M4, `pnpm bench`), le rendu ne bouge pas au-delà du bruit : 8 à 9,4 ms de GPU par image avant, sur deux mesures, contre 8,6 à 9 après. Le surcoût de la carte vient de la maison rendue translucide, pas du shader du sol.
- L'activation de la carte coûte un calcul sur le processeur, proportionnel au nombre de capteurs, plus celui des pièces quand l'une est extérieure : 50 ms sur la démo et 40 ms sur l'appartement (M4). Il reste à mesurer sur la tablette.
- La limite entre une terrasse et la pièce voisine tombe à mi-chemin de leurs centres, pas forcément sur la porte-fenêtre : la position des pièces dans la config compte.
- Un meuble au matériau de mur (`white`) coupé à 50 cm devient un obstacle, contourné comme un mur.
- Le modèle doit avoir ses sols au même niveau : une maison à étages demanderait un plan par niveau.

## Alternatives considérées

- **Diffusion de la chaleur en régime permanent** sur le même plan (capteurs et extérieur fixés, murs peu conducteurs) : essayée sur la démo. Réduit à une cellule, un capteur pèse trop peu : les pièces tombent vers 13 °C quand il fait 5 °C dehors. Et chaque nouvelle valeur demande des centaines d'itérations.
- **Détecter l'extérieur dans le modèle**, en remplissant le plan depuis ses bords : le remplissage entre par les portes-fenêtres, et classe dehors 85 % du sol de l'appartement.
- **La météo comme un capteur de plus**, posé sur la terrasse : elle entre par la porte-fenêtre et refroidit les pièces sans capteur, la cuisine comme l'entrée.
- **Les murs dans le shader**, en segments testés pour chaque pixel et chaque capteur : un coût GPU multiplié, sur la ressource qui manque à la tablette.
- **Un plan précalculé dans Blender**, à côté du modèle : un fichier et un script de plus, à refaire à chaque modification du modèle, pour un calcul de quelques millisecondes.
