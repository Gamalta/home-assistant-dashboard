# Modale Système : mises à jour, sauvegardes, tablette et internet

- Issue : #22
- Statut : Brouillon

## Problème

La modale Système n'affiche que l'uptime, l'alimentation et trois graphes. Pour savoir si une mise à jour attend, si la sauvegarde de la nuit a marché, si la tablette murale est bien branchée ou si internet est coupé, il faut ouvrir Home Assistant sur un téléphone.

## Objectif

Voir d'un coup d'œil, depuis la tablette murale, l'état de santé de l'installation : mises à jour, sauvegardes, tablette et internet.

## Hors périmètre

- Installer une mise à jour ou lancer une sauvegarde : la modale est en lecture seule, l'action se fait dans Home Assistant.
- Les notes de version et les liens vers les mises à jour.
- Une alerte visible hors de la modale : c'est le sujet des alertes de la maison (#23).

## Comportement attendu

Chaque bloc n'apparaît que si son entité est configurée dans le bloc `system` de la maison et existe dans Home Assistant. Les mises à jour ne se configurent pas : la modale lit toutes les entités `update`. Les nouveaux blocs forment une seconde colonne, à droite des réglages d'affichage.

### Scénario : liste les mises à jour disponibles

- **Étant donné** deux entités `update` à `on` (« Home Assistant Core », « Pont Zigbee ») et une à `off`
- **Quand** j'ouvre la modale Système depuis le dock
- **Alors** je lis « Mises à jour : 2 disponibles », puis « Home Assistant Core : 2026.10.1 → 2026.10.2 » et « Pont Zigbee : 2.6.0 → 2.7.0 » (nom, version installée, version disponible) ;
- **et** la mise à jour à `off` n'est pas listée. Aucun bouton ne permet d'installer.

### Scénario : indique qu'aucune mise à jour n'est disponible

- **Étant donné** que toutes les entités `update` sont à `off`
- **Quand** j'ouvre la modale Système
- **Alors** je lis « Mises à jour : Aucune », sans liste.

### Scénario : affiche la dernière et la prochaine sauvegarde

- **Étant donné** une dernière sauvegarde automatique réussie il y a 3 jours et la prochaine prévue dans 22 heures
- **Quand** j'ouvre la modale Système
- **Alors** le bloc « Sauvegardes » affiche « Dernière réussie : il y a 3 jours » et « Prochaine : dans 22 heures ».

Les dates sont relatives, en français : « hier », « il y a 3 jours », « demain », « dans 5 heures ». Un capteur sans date (`unknown`) affiche « Aucune » pour la dernière sauvegarde et « Non planifiée » pour la prochaine.

### Scénario : signale l'échec de la dernière sauvegarde

- **Étant donné** une dernière tentative de sauvegarde hier, plus récente que la dernière réussite
- **Quand** j'ouvre la modale Système
- **Alors** la ligne « Échec de la dernière tentative (hier) » s'affiche en rouge.

C'est la règle de l'interface de Home Assistant. Pendant une sauvegarde en cours (état du gestionnaire `create_backup`), la tentative a commencé mais pas encore réussi : rien n'est signalé.

### Scénario : affiche la batterie, la charge et le chargeur de la tablette

- **Étant donné** la tablette murale à 64 %, en charge, sur secteur
- **Quand** j'ouvre la modale Système
- **Alors** le bloc « Tablette murale » affiche « Batterie : 64 % », « Charge : En charge » et « Chargeur : Secteur ».

### Scénario : signale la tablette qui ne charge pas

- **Étant donné** que la tablette se décharge (état `discharging` de l'application Companion Android)
- **Quand** la modale Système est ouverte
- **Alors** la charge passe à « Ne charge pas », en rouge : la tablette doit rester branchée.

L'état `not_charging` (branchée, charge en pause par la protection de la batterie) affiche « Charge en pause », sans alerte. Une batterie pleine affiche « Chargée ».

### Scénario : signale la connexion internet coupée

- **Étant donné** le capteur de connexion WAN de la box à `on`
- **Quand** il passe à `off` pendant que la modale est ouverte
- **Alors** « Internet : Connecté » devient « Internet : Coupé », en rouge.

## Critères d'acceptation

- [x] Les nouveaux identifiants du bloc `system` sont facultatifs : une maison qui ne les renseigne pas garde la modale actuelle, plus le bloc des mises à jour.
- [x] La modale tient sans défilement en 1280 × 720 : les nouveaux blocs sont dans une seconde colonne.
- [x] La démo configure tous les blocs avec des entités fictives.
- [x] Le rendu 3D n'est pas touché : la modale est en HTML et ses blocs ne sont montés que lorsqu'elle est ouverte.

## Impacts

- Configuration des maisons : identifiants facultatifs dans `system` ([guide](../guides/ajouter-une-maison.md#la-modale-système)).
- Mock Home Assistant : `binary_sensor.router_wan_status`, `sensor.wall_tablet_*`, `sensor.backup_*` et trois entités `update`. `window.__mockSetState` permet aux E2E de changer l'état d'une entité.
- Performance : le bloc des mises à jour lit toutes les entités et se redessine à chaque changement d'état dans Home Assistant, seulement quand la modale est ouverte. Aucun effet sur la scène 3D.
