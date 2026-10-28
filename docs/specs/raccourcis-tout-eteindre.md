# Carrousel et menu rapide de la barre latérale

- Issue : #15
- Statut : Livrée

## Problème

Ce qui concerne toute la maison n'a pas d'emplacement : la carte sous les personnes est vide. En partant, sur la tablette murale, il faut ouvrir chaque pièce pour éteindre les lumières, baisser le chauffage ou couper ce qui consomme. Une grille de petites tuiles ne montre qu'un libellé par fonction, et le propriétaire veut voir d'un coup d'œil le média en cours, la liste de courses ou les prochains trains.

## Objectif

Un carrousel de cartes riches, qu'on fait défiler du doigt sous les personnes, et un menu rapide de scénarios (Départ, Température, Énergie…) en haut de la vue 3D, près de la barre latérale, qui lance chacun en deux appuis.

## Hors périmètre

- Décrire dans le dashboard ce que fait un scénario : c'est un script Home Assistant, réglé dans Home Assistant.
- Confirmer avant de lancer un scénario : le propriétaire veut un seul appui.
- Réordonner les cartes depuis l'interface : l'ordre est celui de la config.
- Le volume, la source et la télécommande du lecteur multimédia : ils viennent avec la modale complète des médias.

## Comportement attendu

### Scénario : une carte visible et le bord de la suivante

- **Étant donné** une maison avec plusieurs cartes configurées
- **Quand** la barre latérale s'affiche
- **Alors** la première carte est visible en entier, le bord de la suivante dépasse à droite, et le premier point de pagination est actif

### Scénario : glisser pour changer de carte

- **Étant donné** le carrousel sur la première carte
- **Quand** l'utilisateur glisse du doigt vers la gauche, même un peu de biais
- **Alors** la carte suivante s'accroche en place, son point devient actif, et le dock ne s'ouvre pas

### Scénario : revenir à une carte par sa pagination

- **Étant donné** le carrousel sur la deuxième carte
- **Quand** l'utilisateur touche le premier point
- **Alors** le carrousel revient à la première carte

### Scénario : une carte ouvre sa modale

- **Étant donné** une carte affichée
- **Quand** l'utilisateur la touche
- **Alors** sa modale s'ouvre en s'agrandissant depuis la carte

### Scénario : piloter un média depuis sa carte

- **Étant donné** un lecteur multimédia en lecture
- **Quand** la barre latérale s'affiche
- **Alors** sa carte montre le nom du lecteur, la pochette, le titre et l'artiste
- **Et** les boutons « Pause » et « Suivant » agissent sans ouvrir la modale
- **Et** un lecteur éteint affiche « Éteint », sans boutons

### Scénario : ouvrir le menu rapide

- **Étant donné** une maison avec des scénarios configurés
- **Quand** l'utilisateur touche le bouton rond « Menu rapide », en haut à gauche de la vue 3D, près de la barre latérale et à la hauteur de l'en-tête
- **Alors** le menu se déplie vers le bas, avec l'icône et le nom de chaque script, dans l'ordre de la config
- **Et** il reste ouvert jusqu'au choix d'un scénario, sans réagir au survol

### Scénario : lancer un scénario d'un appui

- **Étant donné** le menu rapide ouvert
- **Quand** l'utilisateur touche « Départ »
- **Alors** le script est lancé tout de suite, sans confirmation, et le menu se referme
- **Et** le bouton rond montre une coche pendant 1,5 s, puis reprend son icône

### Scénario : script absent

- **Étant donné** un script configuré qui n'existe pas dans Home Assistant
- **Quand** le dashboard s'affiche
- **Alors** il n'apparaît pas dans le menu

### Scénario : la page tient sur l'écran de la tablette

- **Étant donné** un écran de 1280 × 800
- **Quand** la barre latérale s'affiche avec son carrousel
- **Alors** la page ne défile pas et le carrousel tient dans l'écran

## Critères d'acceptation

- [x] Les cartes viennent de `sideBar.shortcuts` et les scénarios de `sideBar.scenarios` ; sans config, rien ne s'affiche.
- [x] Le carrousel n'ajoute aucune dépendance : défilement et accrochage en CSS (`scroll-snap`).
- [x] Le nom et l'icône d'un scénario sont ceux de son script dans Home Assistant.
- [x] Chaque scénario est couvert par un test : E2E `e2e/shortcuts.spec.ts`, unitaires `MediaShortcut.test.tsx`, `ScenarioAction.test.tsx` et `utils/carousel.test.ts`.

## Impacts

- Config : champs optionnels `scenarios` et `shortcuts` dans `SideBarConfigType`. `{type: 'allLightsOff'}` disparaît : un script Home Assistant le remplace, dans `scenarios` ([ADR 0035](../adr/0035-carrousel-de-cartes-et-actions.md)).
- Mock : deux lecteurs multimédias et trois scripts fictifs. Les changements de média gardent le nom du lecteur, `light.turn_off` est simulé, et les lumières de la démo ont un nom.
- Dock : il ne s'ouvre plus sur un glissement horizontal, ni sur un appui tactile dans le bas de la barre.
- Performance : le bouton rond recouvre le coin haut gauche de la vue 3D, et le menu ouvert un peu plus, sans toucher à la scène.
