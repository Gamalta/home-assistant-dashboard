# Bandeaux LED, effets et modale TV

- Issue : #18
- Statut : Brouillon

## Problème

Le propriétaire a des bandeaux WLED, des lumières Hue (Zigbee2MQTT) qui exposent des effets, et un ambilight HyperHDR derrière la TV. Depuis la tablette, on ne peut que les allumer, les éteindre et choisir une couleur : l'onglet « Effets » de la modale lumière est grisé, les préréglages, la palette, la vitesse et l'intensité des bandeaux sont inaccessibles, et l'ambilight n'apparaît pas. Il faut sortir le téléphone pour lancer un effet ou repasser l'ambilight sur la vidéo, et rien ne montre ce que capte HyperHDR ni ce qu'affichent les LED.

## Objectif

Choisir un effet sur n'importe quelle lumière qui en propose, régler un bandeau WLED, et, dans une modale TV, voir en direct l'image de la TV entourée de ses LED et piloter l'ambilight (marche, source, luminosité) depuis la tablette.

## Hors périmètre

- La veilleuse et le gel des bandeaux WLED (`switch.<bandeau>_nightlight`, `switch.<bandeau>_freeze`), et leur courant estimé.
- La couleur des effets Hue (`text.<lumière>_effect_color`) : un texte libre, peu pratique sur une tablette.
- Les réglages de lissage, de moteur de couleur et de tone mapping HDR de HyperHDR : réglés une fois pour toutes, pas au quotidien.
- Le pilotage de la TV elle-même (marche, volume, source HDMI) : la modale TV ne pilote que l'ambilight.
- Les dispositions de LED autres que la disposition classique de HyperHDR : matrice, espace sans LED (« Longueur de l'espace »), groupes.
- La couleur de la lumière 3D pendant un effet : la scène garde la couleur que remonte Home Assistant.

## Comportement attendu

### Scénario : choisir un effet

- **Étant donné** la modale du bandeau WLED sur l'onglet « Effets », avec l'effet « Solid » mis en évidence
- **Quand** je touche « Rainbow »
- **Alors** le bandeau joue « Rainbow », qui est mis en évidence à la place de « Solid ».

L'onglet « Effets » vaut pour toute lumière qui expose une liste d'effets (WLED, Hue, HyperHDR…). Si plusieurs lumières sont liées, il propose tous leurs effets, et chacun n'est envoyé qu'aux lumières qui le connaissent.

### Scénario : régler un bandeau LED

- **Étant donné** la modale du bandeau WLED, seul sélectionné, sur l'onglet « Effets »
- **Quand** je choisis le préréglage « Cinéma », puis que je pousse la vitesse au maximum
- **Alors** le préréglage « Cinéma » est affiché, et la vitesse vaut 255.

Les listes « Préréglage », « Playlist » et « Palette » et les curseurs « Vitesse » et « Intensité » n'apparaissent que si la lumière a les entités correspondantes. Une lumière Hue qui a une vitesse d'effet (`number.<lumière>_effect_speed`) affiche aussi « Vitesse ». Ces réglages disparaissent quand plusieurs lumières sont liées, puisqu'ils ne valent que pour un appareil.

### Scénario : onglet adapté à la lumière

- **Étant donné** une lumière sans couleur ni température, mais avec des effets
- **Quand** je la sélectionne dans la modale
- **Alors** la modale passe sur l'onglet « Effets ». Une lumière en couleur ouvre la roue des couleurs, une lumière blanche réglable la température, une lumière sans rien de tout cela le seul marche/arrêt.

### Scénario : allumer l'ambilight et changer sa source

- **Étant donné** l'ambilight éteint, en capture vidéo
- **Quand** je fais un appui long sur le bouton TV, que j'active « Ambilight », puis que je choisis « Effet » et « Candle »
- **Alors** l'ambilight s'allume, joue l'effet « Candle », et « Effet » est la source affichée ;
- **quand** je choisis « Vidéo », **alors** il repasse sur la capture vidéo, et plus aucun effet n'est mis en évidence.

« Couleur » propose huit couleurs fixes. Le curseur règle la luminosité. Un appui court sur le bouton TV allume ou éteint l'ambilight, comme pour une lumière.

### Scénario : voir la TV et ses LED en direct

- **Étant donné** l'ambilight éteint, avec ses caméras « LED Colors » et « LED Gradient »
- **Quand** j'ouvre la modale TV
- **Alors** l'image de la TV s'affiche en direct, sans halo ;
- **quand** j'active « Ambilight », **alors** un halo entoure l'image : chaque LED y prend sa place autour de l'écran, avec sa couleur du moment ;
- **quand** je l'éteins, **alors** le halo disparaît ; **quand** je ferme la modale, **alors** les flux de l'image et des LED sont coupés.

## Critères d'acceptation

- [ ] L'onglet « Effets » fonctionne pour toute lumière qui a une liste d'effets, sans configuration propre à WLED ou Hue.
- [ ] Les réglages WLED sont trouvés à partir du nom de la lumière, sans configuration ([ADR 0020](../adr/0020-reglages-par-nom-de-lumiere-et-tv-en-direct.md)).
- [ ] Le flux de l'image n'est ouvert que modale TV ouverte, celui des LED seulement si l'ambilight est allumé, et chacun est fermé dès que son image disparaît.
- [ ] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : aucun draw call ni programme de plus dans la démo.

## Impacts

- Configuration des maisons : nouvel élément `tv` (`lightEntityId`, `ledLayout`). Les bandeaux restent des éléments `light`.
- Mock Home Assistant : un bandeau WLED fictif (`light.living_room_strip` et ses `select` et `number`) et une instance HyperHDR fictive (`light.tv_ambilight`, `camera.tv_ambilight_led_colors`, `camera.tv_ambilight_led_gradient`). `light.turn_on` enregistre l'effet, `light.turn_off` éteint enfin une lumière, `select.select_option` et `number.set_value` modifient l'état simulé.
- Démo : le bandeau n'a pas de lumière 3D dans le modèle, d'où l'avertissement « Aucune lumière 3D trouvée pour light.living_room_strip » au chargement.
- Performance : aucun changement de la scène 3D ; deux étiquettes HTML de plus dans le séjour. Modale TV ouverte, la tablette décode les deux flux et redessine le halo dix fois par seconde.
