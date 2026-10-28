# Version mobile

- Issue : #70
- Statut : Brouillon

## Problème

Le dashboard est pensé pour la tablette murale. Sous 600 px de large, sur un téléphone en portrait, il est inutilisable :

- la barre latérale garde 30 % de la largeur, la date, les personnes et les animaux sont coupés ;
- la caméra garde son champ vertical : on ne voit qu'un tiers de la maison, et les étiquettes se chevauchent dès qu'on dézoome ;
- le dock (thème, maison, système) ne s'ouvre qu'au survol de la souris ou par un glissé caché ;
- les modales, larges de 500 px, débordent de l'écran.

## Objectif

Sur un téléphone en portrait, piloter la maison d'un pouce, pièce par pièce sur la vue 3D ou toutes à la fois dans une liste, sans rien changer à la tablette.

## Hors périmètre

- Le téléphone en paysage et la tablette en portrait : la bascule se fait sur la largeur seule, ils gardent la disposition tablette.
- L'heure, la date et la météo : le téléphone les affiche déjà.
- Une vue d'ensemble de la maison sur mobile : la caméra cadre toujours une pièce, on peut dézoomer à la main.
- Un résumé de la maison (« 4 lumières allumées ») au-dessus de la liste des pièces.
- Les notifications. L'application installable a sa propre spec, [Application installable](application-installable.md).

## Comportement attendu

### Scénario : le sélecteur de vue remplace la barre latérale sous 600 px

- **Étant donné** un téléphone en portrait (390 × 844)
- **Quand** le dashboard s'ouvre
- **Alors** un en-tête s'affiche en haut de l'écran, avec le sélecteur « 3D » / « Pièces » et les avatars
- **Et** il n'y a ni barre latérale, ni barre en bas, ni heure, ni météo

### Scénario : l'en-tête et le carrousel évitent l'encoche et la barre d'accueil

- **Étant donné** un iPhone à Dynamic Island en portrait, avec une zone sûre de 59 px en haut et de 34 px en bas
- **Quand** le dashboard s'ouvre
- **Alors** le sélecteur et les avatars s'affichent en deux îlots, sous l'heure et l'encoche
- **Et** le carrousel s'arrête au-dessus de la barre d'accueil
- **Et** entre les deux îlots, le doigt atteint la scène 3D

### Scénario : la tablette garde sa disposition à partir de 600 px

- **Étant donné** un écran de 1280 × 800
- **Quand** le dashboard s'ouvre
- **Alors** la barre latérale et la vue 3D s'affichent côte à côte, sans sélecteur de vue

### Scénario : la vue 3D s'ouvre sur la première pièce

- **Étant donné** un téléphone en portrait
- **Quand** le dashboard s'ouvre
- **Alors** la maison 3D s'affiche, cadrée sur la première pièce de la config
- **Et** un carrousel en bas montre une puce par pièce et la carte de cette pièce, avec une tuile par équipement
- **Et** seules les étiquettes de cette pièce s'affichent dans la scène

### Scénario : choisir une pièce y amène la caméra

- **Étant donné** la vue 3D sur le séjour
- **Quand** l'utilisateur touche la puce « Cuisine »
- **Alors** la caméra vole jusqu'à la cuisine et le carrousel affiche sa carte
- **Et** elle se centre sur la lampe principale de la cuisine, la première lumière de sa config
- **Et** seules les étiquettes de la cuisine restent dans la scène
- **Et** aucun shader n'est compilé pendant le vol

### Scénario : glisser le carrousel change de pièce

- **Étant donné** la vue 3D sur la première pièce
- **Quand** l'utilisateur glisse la carte vers la gauche
- **Alors** la carte suivante s'accroche en place, sa puce devient active et la caméra la cadre

### Scénario : les cartes du carrousel ont toutes la même taille

- **Étant donné** des pièces d'un à cinq équipements
- **Quand** la vue 3D s'affiche
- **Alors** toutes les cartes du carrousel ont la même hauteur, et toutes les tuiles la même taille
- **Et** dans une carte qui a trop d'équipements, les tuiles défilent

### Scénario : un appui court sur une tuile bascule la lumière

- **Étant donné** une tuile de lumière éteinte
- **Quand** l'utilisateur la touche brièvement
- **Alors** la lumière s'allume et la tuile prend sa couleur

### Scénario : un appui long sur une tuile ouvre sa modale au centre de l'écran

- **Étant donné** une tuile de lumière
- **Quand** l'utilisateur la garde enfoncée
- **Alors** la modale de la lumière s'ouvre en carte, centrée dans l'écran, à 12 px des bords

### Scénario : chaque modale tient dans l'écran du téléphone

- **Étant donné** un téléphone en portrait
- **Quand** l'utilisateur ouvre la modale d'une lumière, d'un volet, d'une prise, d'une climatisation, de l'imprimante 3D, du crédit, des courses ou le Foyer
- **Alors** elle tient dans l'écran, centrée, sans défilement horizontal
- **Et** la page garde la largeur de l'écran

### Scénario : la modale lumière tient dans la hauteur visible de Safari

- **Étant donné** un iPhone 15 Pro dans Safari, avec 393 × 659 px visibles sous les barres
- **Quand** l'utilisateur ouvre la modale d'une lumière
- **Alors** la roue, les boutons et les cartes des lumières tiennent dans la carte, sans défilement
- **Et** sur chaque carte de lumière, le bouton de lien flotte dans le coin

### Scénario : toucher le fond ferme la modale

- **Étant donné** une modale ouverte
- **Quand** l'utilisateur touche le fond flouté, hors de la modale
- **Alors** la modale se ferme

### Scénario : un doigt qui fait défiler n'appuie sur rien

- **Étant donné** une liste de tuiles
- **Quand** l'utilisateur pose le doigt sur une tuile et le glisse de plus de 10 px pour faire défiler
- **Alors** ni l'appui court ni l'appui long ne se déclenchent

### Scénario : un appui long ne sélectionne pas le texte

- **Étant donné** une tuile de lumière
- **Quand** l'utilisateur la garde enfoncée jusqu'à l'ouverture de sa modale
- **Alors** aucun texte de la page n'est sélectionné, et le navigateur n'ouvre pas son menu

### Scénario : le téléphone vibre quand une tuile bascule ou qu'une modale s'ouvre

- **Étant donné** un téléphone qui sait vibrer
- **Quand** l'utilisateur touche une tuile de lumière, puis la garde enfoncée
- **Alors** le téléphone vibre brièvement à la bascule, puis à l'ouverture de la modale

### Scénario : la vue Pièces liste toutes les pièces

- **Étant donné** la vue 3D
- **Quand** l'utilisateur touche « Pièces » dans le sélecteur
- **Alors** chaque pièce s'affiche en carte de tuiles, dans l'ordre de la config, et la scène 3D se met en pause

### Scénario : le filtre Volets ne garde que les volets

- **Étant donné** la vue Pièces
- **Quand** l'utilisateur touche le filtre « Volets »
- **Alors** seules les tuiles de volet restent, et les pièces sans volet disparaissent

### Scénario : les avatars ouvrent le Foyer

- **Étant donné** un téléphone en portrait
- **Quand** l'utilisateur touche les avatars de l'en-tête
- **Alors** le Foyer s'ouvre : personnes, animaux, carrousel de raccourcis, puis les réglages Thème et Système

### Scénario : changer le thème depuis le Foyer

- **Étant donné** le Foyer ouvert
- **Quand** l'utilisateur touche « Thème » puis « Clair »
- **Alors** le dashboard passe en thème clair

### Scénario : ouvrir la modale Système depuis le Foyer

- **Étant donné** le Foyer ouvert
- **Quand** l'utilisateur touche « Système »
- **Alors** la modale Système s'ouvre

### Scénario : le menu rapide reste sur la vue 3D

- **Étant donné** une maison avec des scénarios, un crédit et une liste de courses configurés
- **Quand** la vue 3D s'affiche
- **Alors** le bouton rond « Menu rapide » est sous l'en-tête, à gauche, et déplie la carte des températures, les scénarios, le crédit et les courses

### Scénario : le crédit tient dans la largeur du téléphone

- **Étant donné** la vue 3D avec un crédit configuré
- **Quand** l'utilisateur ouvre « Crédit » depuis le menu rapide, puis son historique
- **Alors** la modale du crédit empile la maison et les chiffres, et ses graphiques suivent la largeur de l'écran, sans défilement horizontal

## Critères d'acceptation

- [ ] La tablette (≥ 600 px de large) ne change pas : les tests E2E existants passent sans modification.
- [ ] Les tuiles réutilisent la logique, les gestes et les modales des éléments de pièce : aucun équipement n'est piloté deux fois.
- [ ] Les règles pures ont leurs tests unitaires : filtre des pièces (`utils/room.test.ts`), cadrage de la caméra (`utils/camera.test.ts`), lampe principale d'une pièce (`utils/model.test.ts`), libellés d'état des tuiles (`utils/entity/*.test.ts`), couleur d'icône lisible (`utils/color.test.ts`), tolérance au glissé (`hooks/useLongPress.test.ts`) et tuile (`Mobile/Tile.test.tsx`).
- [ ] Chaque scénario visible est couvert par un test E2E de `e2e/mobile.spec.ts`, qui porte son nom.
- [ ] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : aucun programme compilé pendant un vol de caméra.

## Impacts

- Décisions : [ADR 0038](../adr/0038-disposition-mobile-a-deux-vues.md) (disposition) et [ADR 0039](../adr/0039-vol-de-camera-vers-une-piece.md) (caméra).
- Config : aucune. La liste des pièces, leur ordre et leurs équipements viennent de `HouseConfig.rooms`, le Foyer de `SideBarConfig`. Le nom d'une tuile est le `friendly_name` de l'entité dans Home Assistant.
- Mock : les volets de la démo ont un nom français.
- Modales : partout, toucher le fond ferme la modale. Sous 600 px, elles deviennent des cartes centrées dans l'écran. Celles du crédit et de l'imprimante 3D y empilent leurs deux blocs.
- Page : `viewport-fit=cover`, et `html` comme `body` en `overflow: hidden`. L'en-tête, le menu rapide, la liste, le carrousel et les modales suivent les zones sûres de l'écran.
- `useLongPress` : un glissé de plus de 10 px annule l'appui, sur les étiquettes 3D aussi.
- Performance : voir la section Mesures.

## Mesures

Build de production, maison démo, en 390 × 844 avec un DPR de 3 (R3F le plafonne à 2). Le Chromium sans tête de Playwright tourne sur le GPU d'un Mac M4 (Metal). Un Mac n'est pas un téléphone : ces chiffres comparent `dev` et la branche entre eux.

| 390 × 844                                        | `dev` (disposition tablette) |                      Version mobile |
| ------------------------------------------------ | ---------------------------: | ----------------------------------: |
| Étiquettes dans la scène                         |                           31 |                                   5 |
| Appels de dessin par image, au repos             |                           74 |                                  88 |
| GPU au repos, DPR 2 (`__dashboardBenchmark(60)`) |                       6,8 ms |                              8,6 ms |
| GPU au repos, DPR 1                              |                       3,6 ms |                              3,4 ms |
| Rotation (`__dashboardMotionBenchmark()`)        |    55 i/s, pire image 183 ms |            60 i/s, pire image 17 ms |
| Vol vers la cuisine                              |                            — | 0 programme compilé, 0 tâche longue |

- Le temps GPU au repos suit la surface du canvas : en pleine largeur, il couvre 1,4 fois plus de pixels que les 70 % de la disposition tablette.
- Les appels de dessin restent sous les 150 du [budget](../adr/0009-budget-performance-tablette.md).
- En rendu logiciel (SwiftShader, comme en CI), on compte les mêmes étiquettes, les mêmes appels de dessin et aucune compilation pendant le vol.
