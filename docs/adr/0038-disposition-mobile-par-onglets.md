# 0038 — Disposition mobile par onglets

- Statut : Proposé
- Date : 2026-10-25
- Issue : #70

## Contexte

Le dashboard est construit pour la tablette murale : une barre latérale redimensionnable à côté de la scène 3D. Sur un téléphone en portrait (moins de 600 px de large), la barre garde 30 % de la largeur, la caméra ne montre qu'un tiers de la maison, les étiquettes se chevauchent, le dock ne s'ouvre qu'au survol, et les modales de 500 px débordent.

Le propriétaire a comparé trois pistes sur maquettes (3D plein écran avec feuille, barre d'onglets, pièce par pièce), puis une fusion. Il retient :

- les onglets **Maison** (3D avec un carrousel de pièces) et **Pièces** (liste filtrable) ;
- un en-tête en pastille, dont les avatars ouvrent une feuille **Foyer**.

Contraintes :

- la tablette ne doit pas changer ;
- le GPU d'un téléphone est faible et sa batterie limitée ;
- un même équipement ne doit pas être piloté par deux codes différents.

## Décision

- **Bascule sur la largeur** : `useIsMobile` lit `theme.breakpoints.down('sm')` (moins de 600 px) dès le premier rendu (`noSsr`). Sinon, la disposition tablette et sa scène 3D se monteraient avant de basculer. `Dashboard` rend alors `MobileDashboard` à la place des panneaux. Seule la largeur compte : un téléphone en paysage garde la disposition tablette.
- **Onglets** : `BottomNavigation` de MUI, avec Maison et Pièces.
  - L'onglet Maison garde la scène 3D, le menu Scénarios sous l'en-tête et un carrousel de pièces en `scroll-snap`, comme celui de l'[ADR 0035](0035-carrousel-de-cartes-et-actions.md).
  - L'onglet Pièces liste toutes les pièces, avec les filtres Toutes / Lumières / Volets / Climat.
- **La 3D reste montée sous l'onglet Pièces** : elle est cachée (`visibility: hidden`) et mise en pause (`frameloop="never"`), puis une image au retour rattrape les changements. Démonter le `Canvas` coûterait une recompilation des shaders à chaque retour.
- **Étiquettes de la pièce choisie seulement** : `Room3d` reçoit `showLabels`. `RoomItem3d` reste monté, pour que les lumières 3D suivent toujours Home Assistant.
- **Tuiles = éléments de pièce** : `RoomItem` et chaque `Room<Type>` gagnent `variant: 'label' | 'tile'`. La tuile (`Mobile/Tile`) n'est qu'une présentation : l'entité, les gestes (`useLongPress`), la modale et son `layoutId` restent ceux de l'étiquette.
  - Chaque carte a son `RoomProvider`, sinon la modale lumière ignore les lumières de la pièce.
  - Les `id` sont préfixés (`carrousel-…`, `liste-…`), pour ne pas croiser les `layoutId` des étiquettes 3D montées en même temps.
- **Modales en feuille du bas** : sous `sm`, `Modal/Base/Container` fixe la modale en bas, sur toute la largeur, sur 85 % de la hauteur au plus. Les contenus larges de 500 px suivent la largeur. Partout, toucher le fond ferme la modale.
- **Foyer** : une `Modal` (donc une feuille sur mobile) avec :
  - `PersonCard` et `PetCard` ;
  - le carrousel de raccourcis ;
  - la liste Thème / Maison / Système, qui remplace le dock.

  Le thème, l'horloge (`useNow`) et le chargement des configs (`useHouseConfigs`) sont partagés avec la barre latérale.

- **Glissé** : `useLongPress` annule l'appui au-delà de 10 px de déplacement du doigt. Sans cela, faire défiler une liste de tuiles bascule les lumières.

## Conséquences

- La tablette garde son code et ses tests E2E. Le mobile a sa propre spec E2E en 390 × 844, tactile.
- Aucune dépendance ajoutée.
- Une seule logique par équipement : un correctif sur une étiquette vaut pour sa tuile.
  - En revanche, chaque `Room<Type>` porte deux rendus.
  - Un nouveau type d'équipement doit prévoir les deux.
- La scène reste en mémoire sous l'onglet Pièces, mais ne rend aucune image.
- Le nom d'une tuile est le `friendly_name` de l'entité : il doit être court et parlant dans Home Assistant.
- Toucher le fond d'une modale la ferme, sur la tablette aussi.
- Le téléphone en paysage et la tablette en portrait restent sur la disposition tablette.

## Alternatives considérées

- **Barre latérale responsive en CSS** (piste A, 3D plein écran et feuille) : moins de code, mais les étiquettes de 12 pièces restent illisibles sur 390 px et les gestes de la feuille croisent ceux de la caméra.
- **3D seulement dans un onglet, sans carrousel** (piste B) : le propriétaire veut garder la 3D comme repère principal.
- **Route `/mobile` séparée** : deux points d'entrée à maintenir, et l'appli force déjà le chemin `/`.
- **Démonter la 3D sous l'onglet Pièces** : moins de mémoire, mais une recompilation des shaders (plusieurs secondes sur un GPU faible) à chaque retour.
- **Composants de tuile séparés** : la logique des entités, des gestes et des modales serait doublée.
- **`SwipeableDrawer` de MUI pour les feuilles** : on perdrait l'animation `layoutId` qui relie le bouton à sa modale, et il faudrait deux composants de modale.
- **Bascule aussi en paysage** (hauteur < 600 px) : il faudrait une troisième disposition, et les tests E2E en 640 × 360 changeraient de disposition.
