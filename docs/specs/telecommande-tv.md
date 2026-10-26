# Télécommande TV et médias

- Issue : #27
- Statut : Brouillon

## Problème

Les téléviseurs et lecteurs du séjour (Apple TV, TV LG webOS, lecteurs Freebox et Cast) ne sont pas visibles sur la tablette murale. Pour mettre en pause, baisser le son ou naviguer dans un menu, il faut retrouver la bonne télécommande ou ouvrir Home Assistant sur un téléphone.

## Objectif

Voir ce qui passe sur un lecteur depuis la scène 3D, et le piloter depuis une modale : marche, lecture, volume, source et, pour l'Apple TV, navigation dans les menus.

## Hors périmètre

- La barre de progression et l'avance dans le média (`media_seek`).
- La navigation dans la bibliothèque (`browse_media`) et le lancement d'un média précis.
- Le pavé directionnel des autres intégrations que l'Apple TV ([ADR 0028](../adr/0028-pave-directionnel-remote-apple-tv.md)).
- Les modes sonores, la lecture aléatoire et la répétition.

## Comportement attendu

### Scénario : affiche le média en cours

- **Étant donné** la TV du séjour qui lit « My Way » de Calvin Harris
- **Quand** je regarde la scène, puis que j'appuie sur le bouton de la TV
- **Alors** le bouton montre l'icône de lecture et le titre « My Way », coupé s'il est trop long ;
- **et** la modale « TV du séjour » s'ouvre, avec le visuel du média, le titre et l'artiste.

Sans titre de média (accueil d'une application), le bouton et la modale affichent le nom de l'application. En pause, le bouton montre l'icône de pause et le titre. Éteint ou en veille, il ne montre que l'icône de la TV, sans couleur.

### Scénario : met en pause puis relance la lecture

- **Étant donné** la modale ouverte pendant la lecture
- **Quand** j'appuie sur « Pause », puis sur « Lecture »
- **Alors** la lecture s'arrête puis reprend, et le bouton alterne entre « Pause » et « Lecture » ;
- **quand** j'appuie sur « Suivant » puis « Précédent », le titre passe au média suivant puis revient.

### Scénario : règle le volume et coupe le son

- **Étant donné** la modale ouverte, volume à 30
- **Quand** je déplace le curseur « Volume », puis que j'appuie sur « Couper le son » puis « Rétablir le son »
- **Alors** le volume suit le curseur, et le son est coupé puis rétabli.

### Scénario : change de source

- **Étant donné** la modale ouverte, sur la source « Apple TV »
- **Quand** je choisis « Freebox » dans la liste « Source »
- **Alors** la TV passe sur « Freebox ».

La liste n'apparaît que si le lecteur annonce ses sources (`source_list`).

### Scénario : pilote le lecteur avec le pavé directionnel

- **Étant donné** la TV du séjour avec une entité `remote` configurée
- **Quand** j'appuie sur « Haut », « OK » puis « Retour »
- **Alors** la modale envoie `remote.send_command` avec les commandes `up`, `select` puis `menu`.

Le pavé compte sept touches : Haut, Bas, Gauche, Droite, OK, Retour et Menu (`up`, `down`, `left`, `right`, `select`, `menu`, `home`, les commandes de l'Apple TV). Sans `remoteEntityId`, il n'est pas affiché.

### Scénario : éteint puis rallume le lecteur

- **Étant donné** la modale ouverte pendant la lecture
- **Quand** j'appuie sur « Éteindre »
- **Alors** la modale n'affiche plus que « Éteint » et le bouton de la scène perd son titre ;
- **quand** j'appuie sur « Allumer », les commandes reviennent.

Chaque commande (marche, arrêt, lecture, pause, précédent, suivant, volume, muet, source) n'apparaît que si le lecteur l'annonce dans `supported_features`. Les règles d'état et de titre se testent en unitaire (`src/utils/entity/media.test.ts`).

## Critères d'acceptation

- [x] L'élément `media` se configure par l'entité `media_player`, et en option l'entité `remote` de l'Apple TV.
- [x] Le visuel du média passe par `joinHassUrl`, pour les adresses relatives de Home Assistant.
- [x] La démo contient une TV fictive dans le séjour, avec sa télécommande.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : le bouton est un élément HTML, sans draw call ni programme de plus.

## Impacts

- Configuration des maisons : nouvel élément `media` ([guide](../guides/medias.md)).
- Mock Home Assistant : TV `media_player.living_room_tv` et télécommande `remote.living_room_tv`. Le service simulé des lecteurs (`fake-call-service/mediaPlayer.ts`), inutilisé jusqu'ici, est corrigé : ses changements ne sont plus écrasés par le traitement générique, il gère `select_source` et ne renomme plus le lecteur en changeant de média.
- Image : `public/media/demo_cover.svg`, visuel fictif de la démo.
- Performance : aucun changement mesuré sur la démo (46 draw calls au repos, 0 programme compilé pendant le benchmark, aucune tâche longue en rotation).
