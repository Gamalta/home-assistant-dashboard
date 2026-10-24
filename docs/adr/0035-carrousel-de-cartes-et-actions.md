# 0035 — Carrousel de cartes et actions dans l'en-tête de la barre latérale

- Statut : Proposé
- Date : 2026-10-24
- Issue : #15

## Contexte

L'[ADR 0016](0016-tuiles-de-raccourcis.md) range les raccourcis dans une grille de tuiles, sous les personnes. Le propriétaire veut à la place des cartes qu'on fait défiler du doigt, comme un carrousel : un lecteur multimédia, la liste de courses, les trains… Il veut aussi que les actions, comme « Tout éteindre », quittent les tuiles.

Contraintes :

- à 1280 × 800, la zone mesure environ 330 × 200 px, et la page ne doit pas défiler ;
- la tablette est tactile et son GPU est faible ;
- le dock de la barre latérale s'ouvre d'un glissement vertical, n'importe où sur la barre.

## Décision

`sideBar.shortcuts` devient un carrousel horizontal de cartes, et une nouvelle liste `sideBar.actions` place les actions en boutons ronds dans l'en-tête, à côté de l'heure.

- **Carrousel en CSS natif** : `scroll-snap-type: x mandatory` sur une grille en colonnes. Le défilement, l'inertie et l'accrochage restent au navigateur.
  - Une carte est visible en entier, et le bord de la suivante (24 px) dépasse pour suggérer qu'il y a une suite.
  - Des points de pagination suivent le défilement (`carouselPage`), et un appui sur un point fait défiler jusqu'à sa carte.
- **Cartes** : `ShortcutCard` affiche l'icône, le libellé et un contenu riche de 3 ou 4 lignes.
  - La carte entière est un bouton qui ouvre la modale. Les deux partagent le même `layoutId`, comme avant.
  - Les commandes d'une carte, par exemple lecture et suivant pour un média, se placent sous ce bouton (`controls`), car un bouton ne peut pas en contenir un autre.
- **Types de carte** : la même union discriminée par `type`, avec un composant `<Type>Shortcut` par type. La première carte est « Média », sur une entité `media_player`.
- **Actions** : `ActionConfigType` est une union discriminée par `type`, comme les cartes. « Tout éteindre » est un bouton rond. Une pastille y indique le nombre de lumières allumées, et un appui ouvre la même modale qu'avant.
- **En-tête plutôt que bouton flottant sur la vue 3D** :
  - l'en-tête est toujours visible et regroupe ce qui concerne toute la maison : heure, météo, bientôt les alertes ;
  - l'action reste à un appui, quelle que soit la carte affichée ;
  - la vue 3D reste dédiée aux pièces : un bouton flottant y masquerait des étiquettes, qui bougent avec la caméra, et capterait des gestes de rotation.
- **Dock** : un glissement plus horizontal que vertical est laissé au carrousel. Seule une vraie souris ouvre le dock au survol, car un appui tactile émet aussi un `mousemove`.

## Conséquences

- Aucune dépendance ajoutée. Le défilement est géré par le compositeur, sans JavaScript par image.
- Une carte doit tenir dans environ 300 × 180 px à 1280 × 800 : son contenu est choisi et tronqué (`noWrap`), et le détail reste dans la modale.
- Migration : `{type: 'allLightsOff'}` passe de `shortcuts` à `actions` (voir le [guide](../guides/raccourcis.md)).
- L'en-tête n'a de place que pour 2 ou 3 boutons à côté de l'heure. La pastille des alertes, centrée en bas de l'en-tête, est à vérifier quand les deux fonctionnalités seront réunies.
- Au-delà d'une douzaine de cartes, les points ne tiennent plus sur la largeur.

## Alternatives considérées

- **Bibliothèque de carrousel** (Swiper, Embla) : une dépendance et du JavaScript pour ce que le CSS fait nativement.
- **Défilement par `transform` et gestionnaires de pointeur** : il faut réécrire l'inertie et l'accrochage.
- **Cartes pleine largeur, sans bord visible** : rien n'indique qu'on peut faire défiler.
- **« Tout éteindre » en carte** : il faudrait d'abord chercher la carte dans le carrousel. Le propriétaire veut sortir les actions des tuiles.
- **Bouton flottant sur la vue 3D** : il masque une partie de la scène et entre en conflit avec ses gestes.
- **Bouton dans le dock** : caché derrière un geste.
- **Renommer `shortcuts` en `cards`** : toutes les configs changeraient, sans gain fonctionnel.
