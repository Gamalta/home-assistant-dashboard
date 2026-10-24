# Appareils sur pile et détecteur de fumée

- Issue : #60
- Statut : Brouillon

## Problème

L'appartement compte une dizaine d'interrupteurs muraux sans fil Zigbee et un détecteur de fumée, tous sur pile. Rien ne montre sur la tablette murale qu'une pile faiblit : on le découvre quand l'interrupteur ne répond plus. Le détecteur de fumée n'apparaît nulle part, ni son état, ni sa pile, ni son autoprotection.

## Objectif

Voir d'un coup d'œil, dans la scène 3D, le niveau de pile de chaque appareil passif et l'état du détecteur de fumée, puis le détail dans une modale illustrée.

## Hors périmètre

- L'historique du niveau de pile : il arrivera avec le composant de graphique partagé (branche `feat/graphiques-uniformes`), dans un second onglet de la modale.
- Les appareils qui ne donnent qu'une pile faible binaire, sans niveau en % (l'élément `battery` attend un `sensor` en %).
- La liste des alertes de la maison (pastille de l'en-tête) : c'est l'objet de l'issue #23.
- Son, notification ou réveil de l'écran en cas de fumée : c'est le rôle des automatisations Home Assistant.

## Comportement attendu

Sous **20 %**, une pile est faible. Les éléments se configurent dans la pièce ([guide](../guides/appareils-sur-pile.md)). Les étiquettes de pile sont masquées par défaut : la puce « Piles » du [filtre des étiquettes](filtres-entites.md) les affiche. Le détecteur de fumée n'a pas de puce et reste toujours affiché.

### Scénario : affiche le niveau de pile dans la scène

- **Étant donné** la démo, avec les interrupteurs du séjour à 54 %, de la cuisine à 12 % et de la chambre à 85 %
- **Quand** j'ouvre le dashboard et que j'affiche les piles par leur puce
- **Alors** chaque interrupteur a une étiquette avec une icône de pile remplie selon le niveau et le pourcentage ;
- **et** l'étiquette de la cuisine, sous 20 %, est en rouge, les autres dans la couleur habituelle des étiquettes.

Un niveau inconnu ou indisponible s'affiche `--`, avec une pile vide.

### Scénario : ouvre la modale d'un interrupteur

- **Étant donné** l'interrupteur de la cuisine à 12 %
- **Quand** j'appuie sur son étiquette
- **Alors** la modale « Interrupteur de la cuisine » montre l'interrupteur dessiné, avec un voyant rouge qui clignote, « 12% » et « Pile faible, à remplacer » en rouge, une jauge en forme de pile remplie à 12 % et l'heure de la dernière mise à jour ;
- **et** pour l'interrupteur de la chambre, le voyant est vert, la jauge verte et le texte « Pile en bon état ».

### Scénario : affiche le détecteur de fumée dans la scène

- **Étant donné** le détecteur du couloir au repos, pile à 90 %
- **Quand** j'ouvre le dashboard
- **Alors** son étiquette montre un détecteur avec un voyant vert, puis le niveau de sa pile.

### Scénario : ouvre la modale du détecteur au repos

- **Étant donné** le détecteur au repos
- **Quand** j'appuie sur son étiquette
- **Alors** la modale « Détecteur de fumée » montre le détecteur vu de dessous avec son voyant vert, « Aucune fumée » en grand, puis la pile (90%), la chaleur (« Normale »), l'autoprotection (« OK ») et la dernière mise à jour ;
- **et** un bouton « Tester », parce que la démo configure un bouton de test.

Sans entité de test dans la config, le bouton « Tester » n'existe pas. Une ligne n'apparaît que si son entité est configurée.

### Scénario : passe en alerte quand le détecteur voit de la fumée

- **Étant donné** la modale du détecteur ouverte
- **Quand** l'entité de fumée passe à `on`
- **Alors** la modale affiche « Fumée détectée ! » en rouge, le voyant clignote en rouge et des ondes rouges s'échappent du détecteur ;
- **et**, une fois la modale fermée, l'étiquette de la scène est rouge, avec « Fumée » et une icône qui pulse.

La chaleur (`heat` à `on`) donne de même « Chaleur détectée ! » et une étiquette « Chaleur ».

### Scénario : avertit pour la pile ou l'autoprotection du détecteur

- **Étant donné** le détecteur sans fumée
- **Quand** l'autoprotection se déclenche (`tamper` à `on`), ou que la pile est faible (`battery_low` à `on` ou niveau sous 20 %)
- **Alors** le voyant passe à l'orange dans l'étiquette et dans la modale, qui garde « Aucune fumée » et affiche « Déclenchée » ou la pile en orange.

### Règles testées en unitaire

- Seuils de pile (`src/utils/entity/battery.test.ts`) : lecture du niveau, arrondi, niveau inconnu, faible sous 20 % et pas à 20 %.
- État du détecteur (`src/utils/entity/smoke.test.ts`) : fumée avant tout, chaleur, détecteur indisponible ou absent, pile faible binaire ou sous 20 %, autoprotection.
- Bouton « Tester » (`src/components/Modal/SmokeModal/SmokeModal.test.tsx`) : présent et qui appuie sur l'entité `button` quand elle est configurée, absent sinon.

## Critères d'acceptation

- [x] Deux nouveaux éléments de pièce, `battery` et `smoke`, placés par `position` ou rangés avec les boutons de la pièce (`roomDisplay: true`).
- [x] Les étiquettes suivent le style des autres (bouton arrondi `secondary`) et ne se recouvrent pas à 1280 × 800 sur la démo.
- [x] Les modales suivent le modèle de l'imprimante 3D : illustration à gauche qui réagit à l'état, colonne de 300 px à droite.
- [x] La démo contient trois interrupteurs fictifs, dont un à 12 %, et un détecteur fictif, pilotables depuis les E2E par `window.__mockSetState`.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : les étiquettes et les modales sont en HTML, sans draw call ni programme de plus.

## Impacts

- Configuration des maisons : éléments `battery` et `smoke` ([guide](../guides/appareils-sur-pile.md), [ADR 0034](../adr/0034-appareils-sur-pile-elements-de-piece.md)).
- Mock Home Assistant : trois piles d'interrupteurs et un détecteur complet (`hallway_smoke_detector`), aux mêmes identifiants que la démo des alertes (#23).
- Performance : quatre étiquettes HTML de plus sur la démo ; animations CSS de transform et d'opacité seulement, et uniquement en alarme ou pile faible.
