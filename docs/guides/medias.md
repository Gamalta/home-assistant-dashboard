# TV et médias

L'élément `media` affiche un téléviseur ou un lecteur dans une pièce : un bouton dans la scène 3D, avec le titre en cours, et une modale pour le piloter ([spec](../specs/telecommande-tv.md)). Il marche avec toute entité `media_player` (Apple TV, LG webOS, Freebox, Cast…), et ajoute un pavé directionnel pour l'Apple TV.

## Utiliser la modale

Un appui sur le bouton ouvre la modale :

- en-tête : marche ou arrêt ;
- visuel, titre et artiste (ou série) du média, sinon le nom de l'application ;
- précédent, lecture ou pause, suivant ;
- muet et curseur de volume ;
- liste des sources, quand le lecteur en annonce ;
- pavé directionnel (Haut, Bas, Gauche, Droite, OK, Retour, Menu), quand une télécommande est configurée.

Chaque commande n'apparaît que si le lecteur l'annonce dans ses fonctions (`supported_features`). Éteint, la modale ne propose que l'allumage.

## Configurer l'élément

Dans le `House.ts` de la maison, ici avec la TV fictive de la démo :

```ts
{
  type: 'media',
  mediaPlayerEntityId: 'media_player.living_room_tv',
  remoteEntityId: 'remote.living_room_tv',
  position: {x: -3.3, y: 1.4, z: 4.4},
},
```

| Champ                 | Rôle                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| `mediaPlayerEntityId` | L'entité `media_player`. Son `friendly_name` nomme le bouton et la modale.  |
| `remoteEntityId`      | Facultatif. L'entité `remote` de l'**Apple TV**, pour le pavé directionnel. |

`position` place le bouton dans la scène, près de l'écran. `roomDisplay: true` le range plutôt avec les boutons de la pièce. Le bouton n'apparaît que si l'entité `media_player` existe.

Le pavé envoie les commandes de l'intégration Apple TV (`up`, `down`, `left`, `right`, `select`, `menu`, `home`) avec `remote.send_command` ([ADR 0028](../adr/0028-pave-directionnel-remote-apple-tv.md)). Ne pas renseigner `remoteEntityId` pour une autre intégration : ses commandes portent d'autres noms. Une TV LG webOS, un lecteur Freebox ou Cast s'ajoutent sans `remoteEntityId`.

Le visuel vient de l'attribut `entity_picture`, souvent une adresse relative de Home Assistant (`/api/media_player_proxy/…`) : il est chargé à l'ouverture de la modale, à travers `joinHassUrl`.

## Démo et mock

La démo place une TV fictive, `media_player.living_room_tv`, au-dessus du meuble TV du séjour, avec sa télécommande `remote.living_room_tv` (`src/mock/mocks/createRemote.ts`). Les services simulés (`src/mock/mocks/fake-call-service/mediaPlayer.ts`) mettent en pause, changent de titre, de volume et de source. Le pavé ne change rien à l'état simulé : chaque appel de service est tracé dans la console par le mock, ce que vérifie le test E2E.
