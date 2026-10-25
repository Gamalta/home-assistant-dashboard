# 0035 — Carrousel de cartes et barre de scénarios

- Statut : Proposé
- Date : 2026-10-24
- Issue : #15

## Contexte

L'[ADR 0016](0016-tuiles-de-raccourcis.md) range les raccourcis dans une grille de tuiles, sous les personnes. Le propriétaire veut à la place des cartes qu'on fait défiler du doigt, comme un carrousel : un lecteur multimédia, la liste de courses, les trains… Il veut aussi des scénarios à un appui, comme Départ, Température ou Énergie, hors des tuiles.

Contraintes :

- à 1280 × 800, la zone mesure environ 330 × 200 px, et la page ne doit pas défiler ;
- la tablette est tactile et son GPU est faible ;
- le dock de la barre latérale s'ouvre d'un glissement vertical, n'importe où sur la barre.

## Décision

`sideBar.shortcuts` devient un carrousel horizontal de cartes, et une nouvelle liste `sideBar.scenarios` place des scripts Home Assistant dans une colonne collée à la barre latérale, en haut de la vue 3D.

- **Carrousel en CSS natif** : `scroll-snap-type: x mandatory` sur une grille en colonnes. Le défilement, l'inertie et l'accrochage restent au navigateur.
  - Une carte est visible en entier, et le bord de la suivante (24 px) dépasse pour suggérer qu'il y a une suite.
  - Des points de pagination suivent le défilement (`carouselPage`), et un appui sur un point fait défiler jusqu'à sa carte.
- **Cartes** : `ShortcutCard` affiche l'icône, le libellé et un contenu riche de 3 ou 4 lignes.
  - La carte entière est un bouton qui ouvre la modale. Les deux partagent le même `layoutId`, comme avant.
  - Les commandes d'une carte, par exemple lecture et suivant pour un média, se placent sous ce bouton (`controls`), car un bouton ne peut pas en contenir un autre.
- **Types de carte** : la même union discriminée par `type`, avec un composant `<Type>Shortcut` par type. La première carte est « Média », sur une entité `media_player`.
- **Scénarios** : une liste d'entités `script`. Un appui lance le script, sans modale, et une coche dans la couleur primaire le confirme pendant 1,5 s.
  - Le nom et l'icône sont ceux du script. Ce qu'il fait (lumières, chauffage, prises) se règle dans Home Assistant.
  - Un script absent de Home Assistant n'a pas de bouton.
- **Colonne collée à la barre latérale** plutôt que dans l'en-tête :
  - elle prolonge la barre, avec le même fond et le bord droit arrondi du séparateur, à la hauteur de l'en-tête ;
  - les scénarios restent à un appui, quelle que soit la carte affichée ;
  - chaque bouton porte un libellé, ce que l'en-tête ne permettait pas.
- **Dock** : un glissement plus horizontal que vertical est laissé au carrousel. Seule une vraie souris ouvre le dock au survol, car un appui tactile émet aussi un `mousemove`.

## Conséquences

- Aucune dépendance ajoutée. Le défilement est géré par le compositeur, sans JavaScript par image.
- Une carte doit tenir dans environ 300 × 180 px à 1280 × 800 : son contenu est choisi et tronqué (`noWrap`), et le détail reste dans la modale.
- Migration : `{type: 'allLightsOff'}` disparaît. Un script Home Assistant le remplace, déclaré dans `scenarios` (voir le [guide](../guides/raccourcis.md)).
- La colonne couvre environ 80 × 210 px dans le coin haut gauche de la vue 3D. Une étiquette qui passe dessous est masquée, et ce coin ne capte plus les gestes de rotation. Au-delà de 4 ou 5 scénarios, elle descend trop sur la scène.
- Sans confirmation, un appui accidentel lance le script : un scénario doit pouvoir se relancer sans dommage.
- Au-delà d'une douzaine de cartes, les points ne tiennent plus sur la largeur.

## Alternatives considérées

- **Bibliothèque de carrousel** (Swiper, Embla) : une dépendance et du JavaScript pour ce que le CSS fait nativement.
- **Défilement par `transform` et gestionnaires de pointeur** : il faut réécrire l'inertie et l'accrochage.
- **Cartes pleine largeur, sans bord visible** : rien n'indique qu'on peut faire défiler.
- **Scénarios en cartes** : il faudrait d'abord chercher la carte dans le carrousel. Le propriétaire veut sortir les actions des tuiles.
- **Bouton « Tout éteindre » dans l'en-tête**, à côté de l'heure (première version de cette PR) : 2 ou 3 boutons au plus, sans libellé, et une seule action.
- **Scénarios codés dans le dashboard** : un composant par scénario, et une logique en double avec Home Assistant.
- **Modale de confirmation** : un appui de plus à chaque scénario. Le propriétaire préfère le lancement direct.
- **Boutons flottants au milieu de la vue 3D** : ils masquent la scène et captent ses gestes. Collée au bord, la colonne n'en prend qu'un coin.
- **Bouton dans le dock** : caché derrière un geste.
- **Renommer `shortcuts` en `cards`** : toutes les configs changeraient, sans gain fonctionnel.
