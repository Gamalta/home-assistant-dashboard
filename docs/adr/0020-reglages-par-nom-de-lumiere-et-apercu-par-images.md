# 0020 — Réglages d'effets trouvés par le nom de la lumière, aperçu de l'ambilight par images fixes

- Statut : Proposé
- Date : 2026-10-24
- Issue : #18

## Contexte

Un bandeau WLED est une `light` accompagnée d'entités sœurs, que l'intégration nomme toujours `<domaine>.<lumière>_<clé>` : `select.<lumière>_preset`, `_playlist`, `_color_palette`, `number.<lumière>_speed`, `_intensity`. Zigbee2MQTT fait de même pour la vitesse des effets Hue (`number.<lumière>_effect_speed`), et l'intégration HACS HyperHDR pour les caméras de l'ambilight (`camera.<instance>_led_gradient`). Le propriétaire a quatre bandeaux, dont trois sont déjà des éléments `light` de sa config, et sept lumières Hue à effets.

L'ADR 0018 (#37) configure l'imprimante 3D par un préfixe explicite. Ici, le préfixe existe déjà : c'est l'identifiant de la lumière, sans le domaine.

HyperHDR expose l'image des LED par deux caméras. Leur flux MJPEG envoie une image à chaque trame (25 à 60 par seconde) : décoder ce flux en continu ferait travailler la tablette pour une bande de 20 pixels de haut.

## Décision

**Les réglages se déduisent du nom de la lumière, sans aucun champ de configuration.** `lightExtraEntityIds` (`src/utils/entity/light.ts`) et `ambilightEntityIds` (`src/utils/entity/ambilight.ts`) construisent les identifiants. Chaque réglage n'est affiché que si son entité existe : un bandeau WLED, une lumière Hue ou une ampoule sans réglage ont donc la même config, `{type: 'light', lightEntityId}`. Seul l'ambilight a son élément, `{type: 'ambilight', lightEntityId}`, parce que sa modale n'est pas celle d'une lumière. Le mock crée ses entités avec les mêmes fonctions.

**L'aperçu de l'ambilight est une image fixe** : l'image `entity_picture` de la caméra « LED Gradient » (`/api/camera_proxy/…`), redemandée 2 s après le chargement de la précédente. Le composant n'existe que modale ouverte : aucune image n'est demandée le reste du temps.

## Conséquences

- Un bandeau déjà configuré gagne ses réglages sans modification de la config.
- Une entité renommée dans Home Assistant n'est plus trouvée : son réglage disparaît sans erreur. Le guide demande de garder les identifiants d'origine.
- Une entité sans rapport, nommée par hasard `select.<lumière>_preset`, serait affichée comme un préréglage.
- L'aperçu se met à jour toutes les 2 s, pas en temps réel. Une image lente à arriver retarde la suivante au lieu de s'empiler.
- Côté Home Assistant, la première image démarre le flux de l'intégration HyperHDR vers la caméra, qui reste ouvert ensuite.

## Alternatives considérées

- **Un champ par entité** (`presetEntityId`, `paletteEntityId`…) : cinq lignes par bandeau à écrire et à tenir à jour, pour le même typage (`` `select.${string}` ``).
- **Un préfixe explicite, comme l'ADR 0018** : il recopierait l'identifiant de la lumière, déjà présent dans la config.
- **Un indicateur `wled: true` sur la lumière** : inutile, puisque l'existence des entités suffit à savoir ce qu'il faut afficher.
- **Le flux MJPEG `camera_proxy_stream`** : temps réel, mais un décodage continu sur la tablette, même modale fermée si l'élément reste monté.
- **Le hook `useCamera` de @hakit/core** : il ajoute des appels WebSocket (`camera/capabilities`, signature des URL) que le mock ne simule pas, pour la même image.
