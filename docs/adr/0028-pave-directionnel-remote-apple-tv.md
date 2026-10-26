# 0028 — Pavé directionnel par l'entité `remote`, avec les commandes de l'Apple TV

- Statut : Proposé
- Date : 2026-10-24
- Issue : #27

## Contexte

Le séjour du propriétaire compte une Apple TV, une TV LG webOS, des lecteurs Freebox et des appareils Cast. Toutes ces intégrations créent une entité `media_player`, dont les services génériques couvrent la marche, la lecture, le volume et la source. Aucun ne permet de naviguer dans les menus (haut, bas, OK, retour).

Chaque intégration expose la navigation à sa manière :

- l'Apple TV crée une entité `remote` à côté de son `media_player`, et `remote.send_command` accepte ses propres noms de commandes : `up`, `down`, `left`, `right`, `select`, `menu` (retour), `home` ;
- LG webOS n'a pas d'entité `remote`, mais un service propre, `webostv.button` (`UP`, `ENTER`, `BACK`…) ;
- d'autres intégrations ont une entité `remote` dont les commandes portent d'autres noms.

Seule l'Apple TV a besoin d'un pavé aujourd'hui.

## Décision

L'élément `media` prend un `remoteEntityId` facultatif. S'il est renseigné, la modale affiche un pavé de sept touches qui appellent `remote.send_command` sur cette entité, avec les commandes de l'intégration Apple TV, écrites dans `RemotePad`.

```ts
{
  type: 'media',
  mediaPlayerEntityId: 'media_player.living_room_tv',
  remoteEntityId: 'remote.living_room_tv',
  position: {x: -3.3, y: 1.4, z: 4.4},
}
```

Le reste de la modale passe par les services génériques de `media_player`, et chaque commande n'apparaît que si le lecteur l'annonce dans `supported_features`.

## Conséquences

- La config tient en deux identifiants ; un lecteur sans `remote` garde la modale, sans pavé.
- La TV LG, les lecteurs Freebox et Cast se pilotent (marche, lecture, volume, source selon leurs fonctions), mais sans pavé.
- Une entité `remote` d'une autre intégration recevrait des commandes qu'elle ne connaît pas : le guide réserve `remoteEntityId` à l'Apple TV.
- Gérer une autre télécommande demandera une table de commandes par intégration. Elle pourra s'ajouter en champ facultatif, sans casser les configs existantes.

## Alternatives considérées

- **Une table de commandes par intégration dès maintenant** (champ `remoteType`) : aucune autre télécommande n'est utilisée aujourd'hui.
- **`webostv.button` pour la TV LG** : un second chemin de code, pour un besoin que la télécommande de l'Apple TV couvre déjà.
- **`MediaPlayerCard` de `@hakit/components`** : installée mais inutilisée dans l'application, elle suit son propre thème plutôt que celui des modales MUI, et n'a pas de pavé directionnel.
