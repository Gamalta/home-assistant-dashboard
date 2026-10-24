# Bandeaux LED, effets et ambilight

- Issue : #18
- Statut : Brouillon

## Problème

Le propriétaire a des bandeaux WLED, des lumières Hue (Zigbee2MQTT) qui exposent des effets, et un ambilight HyperHDR derrière la TV. Depuis la tablette, on ne peut que les allumer, les éteindre et choisir une couleur : l'onglet « Effets » de la modale lumière est grisé, les préréglages, la palette, la vitesse et l'intensité des bandeaux sont inaccessibles, et l'ambilight n'apparaît pas. Il faut sortir le téléphone pour lancer un effet ou repasser l'ambilight sur la vidéo.

## Objectif

Choisir un effet sur n'importe quelle lumière qui en propose, régler un bandeau WLED, et piloter l'ambilight (marche, source, luminosité, aperçu) depuis la tablette.

## Hors périmètre

- La veilleuse et le gel des bandeaux WLED (`switch.<bandeau>_nightlight`, `switch.<bandeau>_freeze`), et leur courant estimé.
- La couleur des effets Hue (`text.<lumière>_effect_color`) : un texte libre, peu pratique sur une tablette.
- Les réglages de lissage, de moteur de couleur et de tone mapping HDR de HyperHDR : réglés une fois pour toutes, pas au quotidien.
- Un flux vidéo de l'ambilight : seule une image fixe, rafraîchie, est affichée.
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
- **Quand** je fais un appui long sur son bouton près de la TV, que j'active « Allumé », puis que je choisis « Effet » et « Candle »
- **Alors** l'ambilight s'allume, joue l'effet « Candle », et « Effet » est la source affichée ;
- **quand** je choisis « Vidéo », **alors** il repasse sur la capture vidéo, et plus aucun effet n'est mis en évidence.

« Couleur » propose huit couleurs fixes. Le curseur règle la luminosité. Un appui court sur le bouton allume ou éteint l'ambilight, comme pour une lumière.

### Scénario : aperçu des LED rafraîchi seulement modale ouverte

- **Étant donné** l'ambilight avec sa caméra « LED Gradient »
- **Quand** j'ouvre sa modale
- **Alors** une bande montre les couleurs des LED, rafraîchie toutes les 2 s environ ;
- **quand** je ferme la modale, **alors** plus aucune image n'est demandée.

## Critères d'acceptation

- [ ] L'onglet « Effets » fonctionne pour toute lumière qui a une liste d'effets, sans configuration propre à WLED ou Hue.
- [ ] Les réglages WLED sont trouvés à partir du nom de la lumière, sans configuration ([ADR 0020](../adr/0020-reglages-par-nom-de-lumiere-et-apercu-par-images.md)).
- [ ] L'aperçu ne charge jamais de flux MJPEG, et aucune image tant que la modale est fermée.
- [ ] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : aucun draw call ni programme de plus dans la démo.

## Impacts

- Configuration des maisons : nouvel élément `ambilight` (`lightEntityId`). Les bandeaux restent des éléments `light`.
- Mock Home Assistant : un bandeau WLED fictif (`light.salon_strip` et ses `select` et `number`) et une instance HyperHDR fictive (`light.tv_ambilight`, `camera.tv_ambilight_led_gradient`). `light.turn_on` enregistre l'effet, `light.turn_off` éteint enfin une lumière, `select.select_option` et `number.set_value` modifient l'état simulé.
- Démo : le bandeau n'a pas de lumière 3D dans le modèle, d'où l'avertissement « Aucune lumière 3D trouvée pour light.salon_strip » au chargement.
- Performance : aucun changement de la scène 3D ; deux étiquettes HTML de plus dans le séjour.
