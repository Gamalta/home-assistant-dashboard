# Carrousel de la barre latérale et « Tout éteindre »

- Issue : #15
- Statut : Livrée

## Problème

Ce qui concerne toute la maison n'a pas d'emplacement : la carte sous les personnes est vide. Le soir, sur la tablette murale, il faut ouvrir chaque pièce pour éteindre ses lumières, sans même savoir lesquelles sont encore allumées. Une grille de petites tuiles ne montre qu'un libellé par fonction, et le propriétaire veut voir d'un coup d'œil le média en cours, la liste de courses ou les prochains trains.

## Objectif

Un carrousel de cartes riches, qu'on fait défiler du doigt sous les personnes, et un bouton « Tout éteindre » dans l'en-tête qui éteint en un geste les lumières allumées de la maison.

## Hors périmètre

- Éteindre autre chose que des lumières (prises, TV) : un script Home Assistant le permet via `scriptEntityId`.
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

### Scénario : le bouton « Tout éteindre » indique ce qui est allumé

- **Étant donné** une maison avec des lumières allumées
- **Quand** la barre latérale s'affiche
- **Alors** un bouton rond, à côté de l'heure, porte une pastille avec le nombre de lumières allumées. Sans lumière allumée, la pastille disparaît.

### Scénario : la modale liste les lumières allumées

- **Étant donné** des lumières allumées
- **Quand** l'utilisateur touche le bouton « Tout éteindre »
- **Alors** une modale liste leurs noms

### Scénario : tout éteindre en un geste

- **Étant donné** la modale ouverte
- **Quand** l'utilisateur touche « Éteindre »
- **Alors** les lumières allumées de la maison s'éteignent en un seul appel au service `light.turn_off`, la modale se ferme et la pastille disparaît

### Scénario : script Home Assistant à la place

- **Étant donné** l'action configurée avec `scriptEntityId`
- **Quand** l'utilisateur touche « Éteindre »
- **Alors** le script est lancé, et le dashboard n'éteint rien lui-même

### Scénario : rien à éteindre

- **Étant donné** aucune lumière allumée et aucun script
- **Quand** la modale est ouverte
- **Alors** elle indique « Aucune lumière allumée. » et le bouton est désactivé

### Scénario : la page tient sur l'écran de la tablette

- **Étant donné** un écran de 1280 × 800
- **Quand** la barre latérale s'affiche avec son carrousel
- **Alors** la page ne défile pas et le carrousel tient dans l'écran

## Critères d'acceptation

- [x] Les cartes viennent de `sideBar.shortcuts` et les actions de `sideBar.actions` ; sans config, rien ne s'affiche.
- [x] Le carrousel n'ajoute aucune dépendance : défilement et accrochage en CSS (`scroll-snap`).
- [x] Seules les lumières de la maison configurée sont concernées.
- [x] Chaque scénario est couvert par un test : E2E `e2e/raccourcis.spec.ts`, unitaires `MediaShortcut.test.tsx`, `AllLightsOffModal/index.test.tsx`, `utils/carousel.test.ts` et `utils/house.test.ts`.

## Impacts

- Config : champs optionnels `actions` et `shortcuts` dans `SideBarConfigType`. `{type: 'allLightsOff'}` passe de `shortcuts` à `actions` ([ADR 0035](../adr/0035-carrousel-de-cartes-et-actions.md)).
- Mock : deux lecteurs multimédias fictifs, dont les changements de média gardent le nom du lecteur. `light.turn_off` et les services appelés sur plusieurs entités à la fois sont simulés, et les lumières de la démo ont un nom.
- Dock : il ne s'ouvre plus sur un glissement horizontal, ni sur un appui tactile dans le bas de la barre.
- Performance : aucun impact sur la scène 3D.
