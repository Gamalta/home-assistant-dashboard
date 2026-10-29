# 0044 — Le Foyer en menu sous les avatars

- Statut : Proposé
- Date : 2026-10-28
- Issue : #82

## Contexte

Sur téléphone, les avatars de l'en-tête ouvrent le Foyer dans une modale centrée ([ADR 0038](0038-disposition-mobile-a-deux-vues.md)) : personnes, animaux, raccourcis, puis Thème, Maison et Système. Le propriétaire veut y ajouter la déconnexion, et trouve que ces réglages ont leur place dans un menu qui se déroule sous les avatars, en haut à droite, comme le menu de compte d'une application. Il garde tout le contenu du Foyer.

Contraintes :

- les modales Système et Média s'ouvrent depuis le Foyer : elles doivent passer devant lui et rester utilisables ;
- le Foyer est plus haut que l'écran d'un iPhone, une fois l'encoche et la barre d'accueil retirées ;
- la tablette ne change pas.

## Décision

Le Foyer devient un `Popover` de MUI, ancré sous les avatars et aligné sur eux à droite, à 12 px des bords de l'écran. Il garde son contenu, et « Se déconnecter » ferme la liste des réglages.

- Le menu se déroule depuis les avatars (transition `Grow` de MUI). Toucher à côté le referme.
- Il passe sous les modales (z-index 40, contre 50 pour leur fond) et ne retient pas le focus (`disableEnforceFocus`). Système et Média s'ouvrent donc par-dessus, et toucher leur fond les ferme sans fermer le menu.
- Sa hauteur s'arrête à 12 px de la barre d'accueil. Au-delà, il défile.
- « Se déconnecter » appelle `helpers.logout` de `@hakit/core`.

## Conséquences

- Les réglages et la déconnexion sont là où on les cherche, sous les avatars.
- L'animation `layoutId` entre les avatars et le Foyer disparaît : le menu se déroule depuis eux.
- La hauteur maximale suppose l'en-tête actuel, avec des avatars de 46 px à 8 px sous la zone sûre. Changer l'en-tête demande de la revoir.
- Échap ferme le menu, et avec lui une modale Système ou Média ouverte par-dessus : les événements d'un portail remontent l'arbre React. Un téléphone n'a pas de touche Échap.
- La tablette garde son dock, sans déconnexion.

## Alternatives considérées

- **Garder la modale centrée** ([ADR 0038](0038-disposition-mobile-a-deux-vues.md)) : les réglages et la déconnexion s'ouvrent au milieu de l'écran, loin des avatars qui les appellent.
- **Le `Menu` de MUI** : son rôle `menu` et sa navigation au clavier conviennent à une liste d'actions, pas à des cartes et à un carrousel.
- **Les réglages et la déconnexion seuls**, personnes, animaux et raccourcis retirés du téléphone : un menu court, mais le propriétaire garde tout le Foyer.
- **Les personnes en lignes compactes** : un menu plus court, mais une seconde présentation des personnes à maintenir.
- **Fermer le menu en ouvrant Système ou Média** : ces modales vivent dans le menu, elles seraient démontées avec lui.
