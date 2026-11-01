# 0050 — Plan de l'aspirateur dessiné par l'intégration, pièces en surimpression

- Statut : Proposé
- Date : 2026-10-31
- Issue : à ouvrir

## Contexte

L'aspirateur robot (Dreame P40S Pro Ultra, intégration HACS dreame-vacuum) connaît le plan de la maison : ses pièces, ses murs, le chemin parcouru pendant le nettoyage et sa position. C'est ce plan que l'on veut voir sur la tablette, et c'est là que l'on veut choisir les pièces à nettoyer.

- L'intégration dessine le plan en PNG et le sert par une entité `camera.<préfixe>_map`, avec le chemin, le robot, la station et les couleurs des pièces. Elle le redessine quand le robot envoie une nouvelle carte, soit toutes les quelques secondes pendant un nettoyage.
- Les attributs de cette entité donnent les pièces (`rooms`, avec leur centre en millimètres), trois points de calibration (`calibration_points`, millimètres du robot ↔ pixels de l'image), les pièces prévues (`active_segments`) et terminées (`completed_segments`).
- Le contour exact des pièces n'est publié que dans les données brutes de la carte (entité `camera.<préfixe>_map_data`, désactivée par défaut), un format interne à l'intégration.
- La tablette est limitée par le GPU ; une image dans une modale ne touche pas la scène 3D.

## Décision

La modale affiche l'image de `camera.<préfixe>_map` telle quelle et pose par-dessus une étiquette par pièce, cliquable. La fonction pure `toMapPixel` (`src/utils/entity/vacuum.ts`) passe du centre de la pièce, en millimètres, aux pixels de l'image par les trois points de calibration ; l'étiquette se place en pourcentage de la taille d'origine de l'image, lue à son chargement.

Les étiquettes portent l'état : pièce choisie, pièce en cours (en couleur, avec une onde CSS de `transform` et d'`opacity`), pièce terminée (coche verte), pièce hors du nettoyage (estompée). Le nettoyage des pièces choisies passe par le service `dreame_vacuum.vacuum_clean_segment`.

L'élément se configure par le préfixe de ses entités, comme l'imprimante 3D ([ADR 0018](0018-appareil-configure-par-prefixe.md)).

## Conséquences

- Le plan est celui de l'application Dreame, chemin compris, sans rien redessiner : les réglages de l'intégration (couleurs, icônes, objets affichés) s'appliquent tels quels. Le guide conseille d'y masquer les noms des pièces, que les étiquettes remplacent.
- Pendant un nettoyage, l'image se recharge à chaque nouvelle carte tant que la modale est ouverte : une image de quelques dizaines de Ko toutes les quelques secondes, décodée par le navigateur. C'est le prix du suivi en direct ; la scène 3D n'est pas touchée.
- Une étiquette se place au centre de sa pièce, pas sur son contour : on touche le nom, pas la surface. Une pièce en L peut avoir son centre près d'un mur.
- Le plan dépend de l'intégration : un autre aspirateur demandera une autre fonction d'identifiants, voire une autre source d'image.

## Alternatives considérées

- **Redessiner le plan en SVG à partir des données brutes** : un rendu aux couleurs du tableau de bord et des pièces cliquables sur toute leur surface, mais il faut décoder le format interne de `map_data`, suivre ses évolutions et redessiner le chemin. Beaucoup de code pour un plan que l'intégration dessine déjà.
- **Rectangles des pièces (`x0`, `y0`, `x1`, `y1`) comme zones cliquables** : les boîtes englobantes se chevauchent dès qu'une pièce n'est pas rectangulaire.
- **Image figée, rechargée à l'ouverture seulement** : moins de téléchargements, mais on ne suit plus le robot, ce qui est la raison d'être de la modale.
