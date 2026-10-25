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
- Une vue d'ensemble de la maison sur mobile : la caméra cadre toujours une pièce, on peut dézoomer à la main.
- Un résumé de la maison (« 4 lumières allumées ») au-dessus de la liste des pièces.
- Une application installable (PWA) et les notifications.

## Comportement attendu

### Scénario : les onglets remplacent la barre latérale sous 600 px

- **Étant donné** un téléphone en portrait (390 × 844)
- **Quand** le dashboard s'ouvre
- **Alors** un en-tête (heure, date, météo, avatars) et les onglets Maison et Pièces s'affichent, sans barre latérale

### Scénario : la tablette garde sa disposition à partir de 600 px

- **Étant donné** un écran de 1280 × 800
- **Quand** le dashboard s'ouvre
- **Alors** la barre latérale et la vue 3D s'affichent côte à côte, sans onglets

### Scénario : la vue Maison s'ouvre sur la première pièce

- **Étant donné** un téléphone en portrait
- **Quand** le dashboard s'ouvre
- **Alors** la maison 3D s'affiche, cadrée sur la première pièce de la config
- **Et** un carrousel en bas montre une puce par pièce et la carte de cette pièce, avec une tuile par équipement
- **Et** seules les étiquettes de cette pièce s'affichent dans la scène

### Scénario : choisir une pièce y amène la caméra

- **Étant donné** la vue Maison sur le séjour
- **Quand** l'utilisateur touche la puce « Cuisine »
- **Alors** la caméra vole jusqu'à la cuisine et le carrousel affiche sa carte
- **Et** seules les étiquettes de la cuisine restent dans la scène
- **Et** aucun shader n'est compilé pendant le vol

### Scénario : glisser le carrousel change de pièce

- **Étant donné** la vue Maison sur la première pièce
- **Quand** l'utilisateur glisse la carte vers la gauche
- **Alors** la carte suivante s'accroche en place, sa puce devient active et la caméra la cadre

### Scénario : un appui court sur une tuile bascule la lumière

- **Étant donné** une tuile de lumière éteinte
- **Quand** l'utilisateur la touche brièvement
- **Alors** la lumière s'allume et la tuile prend sa couleur

### Scénario : un appui long sur une tuile ouvre sa modale en bas de l'écran

- **Étant donné** une tuile de lumière
- **Quand** l'utilisateur la garde enfoncée
- **Alors** la modale de la lumière s'ouvre en feuille, collée au bas de l'écran et sur toute sa largeur

### Scénario : toucher le fond ferme la modale

- **Étant donné** une modale ouverte
- **Quand** l'utilisateur touche le fond flouté, hors de la modale
- **Alors** la modale se ferme

### Scénario : un doigt qui fait défiler n'appuie sur rien

- **Étant donné** une liste de tuiles
- **Quand** l'utilisateur pose le doigt sur une tuile et le glisse de plus de 10 px pour faire défiler
- **Alors** ni l'appui court ni l'appui long ne se déclenchent

### Scénario : l'onglet Pièces liste toutes les pièces

- **Étant donné** la vue Maison
- **Quand** l'utilisateur touche l'onglet « Pièces »
- **Alors** chaque pièce s'affiche en carte de tuiles, dans l'ordre de la config, et la scène 3D se met en pause

### Scénario : le filtre Volets ne garde que les volets

- **Étant donné** l'onglet Pièces
- **Quand** l'utilisateur touche le filtre « Volets »
- **Alors** seules les tuiles de volet restent, et les pièces sans volet disparaissent

### Scénario : les avatars ouvrent la feuille Foyer

- **Étant donné** un téléphone en portrait
- **Quand** l'utilisateur touche les avatars de l'en-tête
- **Alors** la feuille Foyer s'ouvre : personnes, animaux, carrousel de raccourcis, puis les réglages Thème et Système

### Scénario : changer le thème depuis le Foyer

- **Étant donné** la feuille Foyer ouverte
- **Quand** l'utilisateur touche « Thème » puis « Clair »
- **Alors** le dashboard passe en thème clair

### Scénario : ouvrir la modale Système depuis le Foyer

- **Étant donné** la feuille Foyer ouverte
- **Quand** l'utilisateur touche « Système »
- **Alors** la modale Système s'ouvre

### Scénario : le menu Scénarios reste sur la vue Maison

- **Étant donné** une maison avec des scénarios configurés
- **Quand** la vue Maison s'affiche
- **Alors** le bouton rond « Scénarios » est sous l'en-tête, à gauche, et déplie la liste des scripts

## Critères d'acceptation

- [ ] La tablette (≥ 600 px de large) ne change pas : les tests E2E existants passent sans modification.
- [ ] Les tuiles réutilisent la logique, les gestes et les modales des éléments de pièce : aucun équipement n'est piloté deux fois.
- [ ] Les règles pures ont leurs tests unitaires : filtre des pièces (`utils/room.test.ts`), cadrage de la caméra (`utils/camera.test.ts`), libellés d'état des tuiles (`utils/entity/*.test.ts`), couleur d'icône lisible (`utils/color.test.ts`), tolérance au glissé (`hooks/useLongPress.test.ts`) et tuile (`Mobile/Tile.test.tsx`).
- [ ] Chaque scénario visible est couvert par un test E2E de `e2e/mobile.spec.ts`, qui porte son nom.
- [ ] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : aucun programme compilé pendant un vol de caméra.

## Impacts

- Décisions : [ADR 0038](../adr/0038-disposition-mobile-par-onglets.md) (disposition) et [ADR 0039](../adr/0039-vol-de-camera-vers-une-piece.md) (caméra).
- Config : aucune. La liste des pièces, leur ordre et leurs équipements viennent de `HouseConfig.rooms`, le Foyer de `SideBarConfig`. Le nom d'une tuile est le `friendly_name` de l'entité dans Home Assistant.
- Mock : les volets de la démo ont un nom français.
- Modales : partout, toucher le fond ferme la modale. Sous 600 px, elles deviennent des feuilles du bas.
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
