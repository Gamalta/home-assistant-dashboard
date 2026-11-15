# 0057 — Un sapin 3D dont les guirlandes changent de couleur par pas, une image toutes les 2 s

- Statut : Proposé
- Date : 2026-11-16
- Issue : à créer

## Contexte

Le mode fêtes ([spec](../specs/mode-fetes.md)) pose un vrai sapin dans la maison 3D, dont les lumières changent de couleur. La scène est rendue à la demande ([ADR 0002](0002-rendu-3d-a-la-demande.md)) : une animation continue la redessinerait 60 fois par seconde, alors qu'une image coûte de 40 à 300 ms sur la tablette ([ADR 0009](0009-budget-performance-tablette.md)).

## Décision

**Un sapin construit dans le code**, à la position donnée par la config (`christmasTree`). Le tronc et trois étages de cônes forment une seule géométrie, colorée par sommet : un draw call. La guirlande, en spirale, et l'étoile sont les instances d'un même `InstancedMesh` : un second draw call.

**Des couleurs qui changent par pas.** Toutes les 2 s, chaque lumière passe à la couleur suivante de la palette, et le sapin demande une seule image (`invalidate`). Les couleurs vivent dans `instanceColor` : un pas ne recompile rien.

**Des lumières qui n'éclairent pas.** Les ampoules sont en `MeshBasicMaterial`, sans lumière three.js ajoutée. En ajouter une changerait le nombre de lumières, donc tous les programmes, et coûterait sur chaque fragment de la maison. Les branches gardent une faible lueur propre (`emissive`) pour rester lisibles la nuit.

**Rien ne tourne quand on ne le voit pas :**

- prise des guirlandes coupée (`switchEntityId`) : lumières masquées, plus de pas ;
- hors du mode fêtes, et sur les cartes au sol : le sapin n'est pas monté ;
- sous l'écran de veille : le `Dashboard` porte désormais l'état de veille et passe la scène en `frameloop="never"`, comme la vue Pièces du téléphone. La neige s'y arrête aussi.

**Compilé en arrière-plan** : la présence du sapin entre dans la clé des options graphiques. Quand le mode fêtes s'active, ses deux programmes passent par la précompilation ([ADR 0015](0015-compilation-asynchrone.md)) au lieu de figer la première image.

## Conséquences

Mesures du 15/11/2026 : build de production, Chrome sur Mac M-series avec son GPU, 1280×800 à DPR 2, démo au repos, deux lancements :

| Démo                               | Sans mode fêtes | Sapin allumé | Sapin débranché |
| ---------------------------------- | --------------: | -----------: | --------------: |
| Draw calls par image               |              44 |           46 |              45 |
| Images dessinées en 20 s au repos  |               0 |           10 |               0 |
| GPU de `__dashboardBenchmark` (ms) |       4,9 à 7,0 |    4,3 à 5,5 |       4,6 à 7,1 |

- Le sapin coûte 2 draw calls, et 1 seul débranché, quand ses lumières sont masquées. Son temps GPU se perd dans le bruit de la mesure.
- Guirlandes allumées, la scène dessine une image toutes les 2 s. Sur la tablette, à 40–300 ms par image, cela occupe le GPU 2 à 15 % du temps, de décembre au 6 janvier. Ce coût réel reste à vérifier sur l'Adreno 610.
- Le sapin n'est pas dans l'éclairage précalculé : le ciel et le soleil en temps réel l'éclairent. Il ne projette ni ne reçoit d'ombre.
- Les pas sont francs : une lumière saute d'une couleur à l'autre, sans fondu. Un fondu demanderait des images intermédiaires.
- Les couleurs repartent du premier pas quand la prise se rallume.

## Alternatives considérées

- **Une animation continue (`useFrame`)** : un fondu fluide, mais 60 images par seconde tant que le sapin est allumé.
- **Des lumières en étiquettes HTML, animées en CSS** : aucune image de la scène, mais aucune profondeur. Les ampoules de l'arrière du sapin se verraient à travers les branches.
- **De vraies lumières three.js (`PointLight`)** : le sapin éclairerait la pièce, au prix d'une recompilation et d'un coût sur chaque fragment.
- **Un modèle `.glb` de sapin** : plus détaillé, mais un fichier à charger et des matériaux à reprendre. La version construite dans le code suffit à la distance de la caméra.
- **Suivre la couleur réelle d'un ruban connecté (`light`)** : plus fidèle, mais demande une guirlande pilotable. Une prise couvre le cas courant ; reste possible plus tard.
