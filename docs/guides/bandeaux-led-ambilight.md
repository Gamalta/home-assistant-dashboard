# Bandeaux LED, effets et modale TV

La modale lumière a un onglet « Effets » pour toute lumière qui en propose, avec les réglages propres aux bandeaux WLED. L'élément `tv` montre en direct l'image de la TV et ses LED, et pilote son ambilight HyperHDR ([spec](../specs/bandeaux-led-ambilight.md)).

## Effets d'une lumière

Rien à configurer : l'onglet « Effets » (icône étincelles) apparaît dès qu'une lumière de la pièce a une liste d'effets (`effect_list`) dans Home Assistant. Il liste les effets des lumières sélectionnées, met en évidence l'effet en cours, et un appui lance l'effet (`light.turn_on` avec `effect`).

## Bandeau WLED

Un bandeau WLED est un élément `light` ordinaire :

```ts
{
  type: 'light',
  lightEntityId: 'light.living_room_strip',
  position: {x: -3.0, y: 0.4, z: 4.6},
},
```

Quand le bandeau est seul sélectionné, l'onglet « Effets » ajoute ses réglages. Ils sont trouvés à partir du nom de la lumière, comme l'intégration WLED les nomme ([ADR 0020](../adr/0020-reglages-par-nom-de-lumiere-et-tv-en-direct.md)) :

| Entité                           | Affichage             |
| -------------------------------- | --------------------- |
| `select.<lumière>_preset`        | Liste « Préréglage »  |
| `select.<lumière>_playlist`      | Liste « Playlist »    |
| `select.<lumière>_color_palette` | Liste « Palette »     |
| `number.<lumière>_speed`         | Curseur « Vitesse »   |
| `number.<lumière>_intensity`     | Curseur « Intensité » |

Un réglage dont l'entité n'existe pas n'est pas affiché. Si une entité a été renommée dans Home Assistant, lui rendre son identifiant d'origine. La veilleuse et le gel (`switch.<lumière>_nightlight`, `_freeze`) ne sont pas proposés.

## Lumière Hue via Zigbee2MQTT

Zigbee2MQTT publie la liste des effets Hue (`candle`, `fireplace`, `colorloop`…) avec la lumière : l'onglet « Effets » apparaît sans rien faire. Zigbee2MQTT ne remonte pas l'effet en cours : aucun n'est mis en évidence.

La vitesse des effets, `number.<lumière>_effect_speed`, est désactivée par défaut dans Home Assistant. Une fois activée (Paramètres → Appareils et services → Entités), elle s'affiche comme curseur « Vitesse ». La couleur des effets (`text.<lumière>_effect_color`) n'est pas utilisée.

## TV et ambilight HyperHDR

La TV utilise l'intégration HACS [HyperHDR](https://github.com/Shaffer-Softworks/hyperhdr-ha). Chaque instance HyperHDR crée une lumière `light.<instance>` et deux caméras, désactivées par défaut, à activer (Paramètres → Appareils et services → Entités) :

| Caméra                           | Affichage                                    |
| -------------------------------- | -------------------------------------------- |
| `camera.<instance>_led_colors`   | L'image que capte HyperHDR, en direct        |
| `camera.<instance>_led_gradient` | Le halo des LED autour de l'image, en direct |

Si l'authentification locale de HyperHDR est active, donner le mot de passe administrateur dans les options de l'intégration : sans lui, « LED Colors » ne reçoit aucune image.

```ts
{
  type: 'tv',
  lightEntityId: 'light.tv_ambilight',
  ledLayout: {top: 16, right: 9, bottom: 16, left: 9},
  position: {x: -3.3, y: 1.1, z: 3.9},
},
```

Utiliser la lumière principale de l'instance, pas `light.<instance>_priority`, qui ne connaît ni la capture vidéo ni l'état réel des LED.

`ledLayout` recopie la disposition classique de HyperHDR (Matériel LED → Disposition classique) : le nombre de LED en haut (`top`), à droite (`right`), en bas (`bottom`) et à gauche (`left`), la « Position d'entrée » (`position`, 0 par défaut) et la « Direction inverse » (`reverse`, `false` par défaut). Le halo place chaque LED à l'endroit qu'elle occupe autour de l'écran. Les espaces sans LED (« Longueur de l'espace »), les groupes et les matrices ne sont pas pris en charge : avec eux, les couleurs se décalent.

Comme une lumière, un appui court sur le bouton TV (ou sa tuile sur téléphone, qui affiche l'état de l'ambilight) allume ou éteint l'ambilight, et un appui long ouvre la modale TV :

- **l'image de la TV**, en direct, entourée du halo des LED quand l'ambilight est allumé ; les flux s'arrêtent à la fermeture de la modale ([ADR 0020](../adr/0020-reglages-par-nom-de-lumiere-et-tv-en-direct.md)) ;
- **Ambilight** et le curseur de luminosité ;
- **la source** :
  - « Vidéo » lance l'effet `USB Capture`, la capture de la carte d'acquisition HDMI-USB ;
  - « Couleur » propose huit couleurs fixes (effet `Solid`) ;
  - « Effet » liste les effets de HyperHDR.

La source affichée se déduit de l'effet en cours : `Solid` est une couleur, une source externe (`USB Capture`, `Platform Capture`, `Flatbuffers Server`…) est de la vidéo, le reste est un effet. Une installation qui capture l'écran plutôt qu'une carte USB devra changer `VIDEO_EFFECT` dans `src/utils/entity/ambilight.ts`.

Les réglages de lissage, de moteur de couleur et de tone mapping HDR restent dans HyperHDR ou Home Assistant.

## Démo et mock

La démo place près de la TV du séjour un bandeau WLED fictif, `light.living_room_strip`, et une TV dont l'ambilight fictif est `light.tv_ambilight`. Leurs entités sont créées par `createWledStrip` et `createAmbilight` (`src/mock/mocks/`), avec les mêmes fonctions de déduction que l'application. `light.turn_on`, `select.select_option` et `number.set_value` modifient leur état simulé (`src/mock/mocks/fake-call-service/`). Les caméras fictives servent des images fixes, `public/ambilight/demo-tv-image.svg` et `demo-led-gradient.svg`, dont les couleurs se répondent pour la disposition de la démo (16, 9, 16, 9 LED) ; le halo ne suit donc pas la source choisie.

Le bandeau n'a pas de lumière dans le modèle 3D de la démo : la console signale « Aucune lumière 3D trouvée pour light.living_room_strip », sans conséquence.
