# 0020 — Réglages d'effets trouvés par le nom de la lumière, TV et LED en direct par flux MJPEG

- Statut : Proposé
- Date : 2026-10-24, révisé le 2026-10-28
- Issue : #18

## Contexte

Un bandeau WLED est une `light` accompagnée d'entités sœurs, que l'intégration nomme toujours `<domaine>.<lumière>_<clé>` : `select.<lumière>_preset`, `_playlist`, `_color_palette`, `number.<lumière>_speed`, `_intensity`. Zigbee2MQTT fait de même pour la vitesse des effets Hue (`number.<lumière>_effect_speed`), et l'intégration HACS HyperHDR pour les caméras de l'ambilight. Le propriétaire a quatre bandeaux, dont trois sont déjà des éléments `light` de sa config, et sept lumières Hue à effets.

L'ADR 0018 (#37) configure l'imprimante 3D par un préfixe explicite. Ici, le préfixe existe déjà : c'est l'identifiant de la lumière, sans le domaine.

HyperHDR expose deux caméras, désactivées par défaut : « LED Colors » (`camera.<instance>_led_colors`) diffuse l'image que capte HyperHDR, jusqu'à 30 images par seconde ; « LED Gradient » (`_led_gradient`) une image d'un pixel de large par LED, dans l'ordre du ruban, 10 fois par seconde. Home Assistant les sert en flux MJPEG (`/api/camera_proxy_stream/…`), authentifiés par le jeton de `entity_picture`. Il ne dit pas où se trouve chaque LED autour de l'écran : seul HyperHDR connaît la disposition. Le propriétaire demande de voir l'image de la TV et ses LED en direct, dans une modale TV.

## Décision

**Les réglages se déduisent du nom de la lumière, sans aucun champ de configuration.** `lightExtraEntityIds` (`src/utils/entity/light.ts`) et `ambilightEntityIds` (`src/utils/entity/ambilight.ts`) construisent les identifiants. Chaque réglage n'est affiché que si son entité existe : un bandeau WLED, une lumière Hue ou une ampoule sans réglage ont donc la même config, `{type: 'light', lightEntityId}`. Seule la TV a son élément, `{type: 'tv', lightEntityId, ledLayout}`, parce que sa modale n'est pas celle d'une lumière. Le mock crée ses entités avec les mêmes fonctions.

**La modale TV affiche les deux flux MJPEG en direct**, par une `<img>` chacun (`CameraStream`). L'image de la TV est visible ; celle des LED, masquée, sert de source à un canvas de 160 × 90 : toutes les 100 ms, chaque LED y peint son pixel sur sa zone du bord de l'écran, puis un flou CSS en fait un halo autour de l'image. Les zones viennent de `ledLayout`, recopié de la disposition classique de HyperHDR (LED par côté, « Position d'entrée », « Direction inverse ») et calculé par `ledAreas`.

Les flux ne vivent que modale ouverte, celui des LED seulement ambilight allumé. Chrome garde un flux MJPEG ouvert après le retrait de son image, jusqu'à la fermeture de la page (vérifié avec un serveur MJPEG local) : `CameraStream` retire la source de l'image au démontage, ce qui ferme la connexion aussitôt.

## Conséquences

- Un bandeau déjà configuré gagne ses réglages sans modification de la config.
- Une entité renommée dans Home Assistant n'est plus trouvée : son réglage, l'image ou le halo disparaît sans erreur. Le guide demande de garder les identifiants d'origine.
- Une entité sans rapport, nommée par hasard `select.<lumière>_preset`, serait affichée comme un préréglage.
- Modale ouverte, la tablette décode le flux de l'image à la cadence et à la taille que lui donne HyperHDR, et recompose le halo flouté dix fois par seconde. La scène 3D, à l'arrêt derrière la modale, n'est pas touchée.
- Les deux flux occupent deux des six connexions HTTP/1.1 que le navigateur ouvre vers Home Assistant.
- Une disposition qui change dans HyperHDR doit être recopiée dans la config, sinon le halo place les couleurs au mauvais endroit. Les espaces sans LED et les matrices ne sont pas pris en charge.
- Avec l'authentification locale de HyperHDR, « LED Colors » ne reçoit rien sans le mot de passe administrateur dans l'intégration : la modale montre alors un écran noir.

## Alternatives considérées

- **Un champ par entité** (`presetEntityId`, `paletteEntityId`…) : cinq lignes par bandeau à écrire et à tenir à jour, pour le même typage (`` `select.${string}` ``).
- **Un préfixe explicite, comme l'ADR 0018** : il recopierait l'identifiant de la lumière, déjà présent dans la config.
- **Un indicateur `wled: true` sur la lumière** : inutile, puisque l'existence des entités suffit à savoir ce qu'il faut afficher.
- **Des images fixes redemandées toutes les 2 s** (la première version de cet ADR) : légères, mais ni l'image de la TV ni les LED ne sont en direct.
- **Le WebSocket JSON de HyperHDR, ouvert par la tablette** : il donne aussi la disposition des LED, mais le tableau de bord, servi en HTTPS, ne peut pas ouvrir de `ws://`, le `wss://` de HyperHDR a un certificat auto-signé, et le mot de passe administrateur se retrouverait dans le navigateur.
- **Une `<img>` des LED par côté de l'écran** : sans canvas, mais quatre flux pour les mêmes données, au-delà de la limite de six connexions.
- **Lire les pixels de l'image des LED** : un canvas qui dessine une image d'une autre origine, servie sans en-têtes CORS, ne se relit plus. Il faudrait configurer CORS dans Home Assistant ; peindre sans relire marche dans tous les cas.
- **Le hook `useCamera` de @hakit/core** : il ajoute des appels WebSocket (`camera/capabilities`, signature des URL) que le mock ne simule pas, pour le même flux.
