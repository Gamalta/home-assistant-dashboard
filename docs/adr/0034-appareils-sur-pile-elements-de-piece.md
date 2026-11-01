# 0034 — Appareils sur pile et détecteur de fumée en éléments de pièce

- Statut : Proposé
- Date : 2026-10-24
- Issue : #60

## Contexte

Les appareils passifs de l'appartement (une dizaine d'interrupteurs muraux Zigbee, un détecteur de fumée) n'ont rien à piloter : ce qui compte, c'est leur pile et, pour le détecteur, son état. Chacun a une place précise dans la maison, et c'est là qu'on va changer la pile.

- Un interrupteur expose un `sensor.<nom>_battery` en %. Le détecteur expose `smoke`, `heat`, `battery_low` et `tamper` en `binary_sensor`, plus `battery` en %. Ces noms dépendent de l'intégration Zigbee (ZHA ou Zigbee2MQTT) et du nom donné à l'appareil ; ils ne suivent pas un schéma fixe comme ceux de ha-bambulab.
- La tablette est limitée par le GPU : un ajout à la scène 3D se paie à chaque image, une étiquette HTML presque pas.
- Les modales de référence (imprimante 3D, volet) illustrent l'appareil avec des images PNG.

## Décision

Deux nouveaux éléments de pièce, rendus comme les autres en étiquettes HTML (`<Html>` de drei) :

- `battery` : `name`, `batteryEntityId` et une position. L'étiquette montre une pile remplie selon le niveau et le pourcentage, en rouge sous **20 %** (`LOW_BATTERY_LEVEL`, le même seuil par défaut que les alertes de la maison).
- `smoke` : une entité par champ, seule `smokeEntityId` étant obligatoire (`heatEntityId`, `batteryEntityId`, `batteryLowEntityId`, `tamperEntityId`, `testEntityId`). Une fonction pure, `smokeStatus`, réduit ces états à un seul, du plus grave au moins grave : fumée, chaleur, indisponible, avertissement (pile ou autoprotection), normal. L'étiquette, la modale et la couleur du voyant en dépendent.

Les illustrations des modales (interrupteur, détecteur) sont des SVG écrits dans le code. Le voyant prend les couleurs système d'iOS (`src/theme/Leds.ts`), les mêmes en clair et en sombre, comme une vraie LED. Les animations (voyant qui clignote, ondes d'alarme, pulsation de l'étiquette) sont des animations CSS de `transform` et d'`opacity`, actives seulement en alarme ou pile faible.

## Conséquences

- Une pile faible se voit à l'endroit de l'appareil, sans ouvrir Home Assistant. La config grossit d'un élément par appareil : une dizaine de lignes de plus pour l'appartement.
- Aucun coût pour la scène 3D : ni draw call, ni matériau, ni `invalidate()`. Chaque étiquette suit pourtant la caméra comme les autres. Sur la démo, en rotation avec le CPU bridé ×4, les 4 étiquettes ajoutées font passer le travail du navigateur de 4,5 à 5,5 ms par image, soit environ 0,25 ms par étiquette. L'appartement en ajoutera une dizaine : c'est à surveiller sur la tablette.
- Les illustrations n'ajoutent aucun fichier à télécharger, restent nettes à tout DPR et suivent l'état sans changer d'image. En contrepartie, elles sont moins réalistes qu'une photo.
- Le seuil de 20 % est fixe. Un seuil par appareil, ou réglable, pourra s'ajouter s'il manque.
- Le bouton « Tester » n'apparaît que si la config fournit une entité `button` : la plupart des détecteurs Zigbee n'en exposent pas.

## Alternatives considérées

- **Ajouter un `batteryEntityId` aux éléments existants** : un interrupteur sans fil ne pilote rien dans Home Assistant, il n'y a donc pas d'élément auquel le rattacher.
- **Découvrir les piles par le registre des entités** (`device_class: battery`) : aucune config à écrire, mais l'étiquette n'aurait pas de position, le registre est absent du mock, et la tablette afficherait aussi les piles des téléphones et des capteurs déjà montrés ailleurs.
- **Configurer le détecteur par un préfixe**, comme l'imprimante 3D : les noms des entités Zigbee ne suivent pas un schéma fixe, et un détecteur n'expose pas toujours les cinq.
- **Images PNG ou modèle 3D de l'appareil** : un fichier à charger par appareil, une image par état du voyant, ou des draw calls de plus sur la tablette.
- **Couleurs de la palette MUI pour le voyant** : elles changent entre le thème clair et le sombre, et le vert `success` du thème clair est trop sombre pour une LED.
