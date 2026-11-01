# Aspirateur robot Dreame

- Issue : à ouvrir
- Statut : Brouillon

## Problème

L'aspirateur robot (Dreame P40S Pro Ultra, avec station de lavage, intégration HACS dreame-vacuum) nettoie la maison pendant qu'on fait autre chose. Pour savoir où il en est, quelle pièce il lave, ou pour lui faire nettoyer seulement la cuisine, il faut aujourd'hui sortir son téléphone et ouvrir l'application Dreame. La tablette murale ne montre rien de l'aspirateur.

## Objectif

Suivre le nettoyage sur le plan de la maison et lancer celui des pièces choisies depuis la tablette, dans une modale très visuelle.

## Hors périmètre

- Les zones, les points, les murs virtuels et les zones interdites : ils se dessinent dans l'application Dreame.
- Le choix de la carte quand le robot en a plusieurs (étages) : la modale montre la carte en cours.
- Les réglages par pièce (puissance, humidité, nombre de passages), le séchage et le vidage manuels de la station, la remise à zéro des consommables.
- Les caméras et la détection d'obstacles en image.

## Comportement attendu

### Scénario : suivre le nettoyage depuis la scène

- **Étant donné** un nettoyage en cours de la cuisine, du séjour, de la salle à manger et du couloir, à 45 %, la cuisine terminée et le séjour en cours, 12 m² et 18 min
- **Quand** je regarde la scène 3D, puis que j'ouvre la modale « Aspirateur » depuis le bouton de l'aspirateur
- **Alors** le bouton affiche l'icône de l'aspirateur et « 45% » ;
- **et** la modale affiche le plan de nettoyage dessiné par l'intégration, avec une étiquette par pièce posée au centre de la pièce : le séjour en couleur et animé, la cuisine cochée en vert, la chambre, la chambre 2, la chambre 3 et l'entrée estompées ;
- **et** elle affiche l'état « Aspiration et lavage » et la pièce « Séjour », la barre de progression à 45 %, « 12 m² » et « 18 min », la batterie dans l'en-tête, le mode de nettoyage, la puissance d'aspiration et la vie restante des consommables (brosse, brosse latérale, filtre, serpillières, capteurs), en rouge sous 20 %.

Hors nettoyage, le bouton n'affiche que l'icône, la modale ne montre plus la progression, et la surface et la durée sont celles du dernier nettoyage.

### Scénario : mettre en pause puis reprendre

- **Étant donné** un nettoyage en cours
- **Quand** j'appuie sur « Pause »
- **Alors** l'état passe à « En pause », et « Pause » laisse la place à « Reprendre » ;
- **quand** j'appuie sur « Reprendre », **alors** l'état revient à « Aspiration et lavage ».

### Scénario : renvoyer l'aspirateur à sa station

- **Étant donné** un nettoyage en cours ou en pause
- **Quand** j'appuie sur « Rentrer »
- **Alors** l'état passe à « Retour à la station » et les boutons disparaissent ;
- **puis**, une fois l'aspirateur sur sa station, l'état passe à « En charge » et le bouton « Tout nettoyer » apparaît.

### Scénario : choisir des pièces sur le plan et lancer leur nettoyage

- **Étant donné** l'aspirateur sur sa station
- **Quand** je touche « Cuisine » et « Couloir » sur le plan (un second appui retire une pièce)
- **Alors** les deux étiquettes passent en couleur avec une coche, et le bouton devient « Nettoyer 2 pièces » ;
- **quand** j'appuie sur « Nettoyer 2 pièces », **alors** le nettoyage de ces deux pièces commence, dans l'ordre où je les ai choisies, et les étiquettes ne se choisissent plus jusqu'à la fin.

Sans pièce choisie, le bouton « Tout nettoyer » lance un nettoyage complet.

### Scénario : changer le mode et la puissance

- **Étant donné** la modale ouverte
- **Quand** j'appuie sur « Laver », puis sur « Turbo »
- **Alors** le mode « Laver » et la puissance « Turbo » sont sélectionnés.

Chacun n'est proposé que lorsque l'intégration le rend disponible : la puissance disparaît, par exemple, en lavage seul.

### Scénario : signaler une erreur ou un aspirateur hors ligne

- **Étant donné** l'entité `error` dans un autre état que `no_error`, avec sa description dans les attributs, ou l'entité `vacuum` indisponible
- **Quand** j'ouvre la modale
- **Alors** une alerte rouge affiche la description de l'erreur (réservoir d'eau propre vide, sac plein, robot coincé…), ou une alerte orange affiche « Aspirateur hors ligne ».

Les alertes se testent en unitaire (`VacuumAlerts.test.tsx`) : le mock de la démo n'a pas d'aspirateur en erreur. La pause, le retour à la station, le mode, la puissance et le choix des pièces ne dépendent que du bouton et de la modale : ils se testent en unitaire sur le mock (`RoomVacuum.test.tsx`). Seul le suivi depuis la scène est un test E2E (`e2e/vacuum.spec.ts`).

## Critères d'acceptation

- [x] L'élément se configure par un seul préfixe d'entités ([ADR 0018](../adr/0018-appareil-configure-par-prefixe.md)).
- [x] Le plan est l'image de l'intégration, et les pièces s'y placent par ses points de calibration ([ADR 0050](../adr/0050-plan-de-l-aspirateur-dessine-par-l-integration.md)).
- [x] Les états du robot, les modes et les puissances de dreame-vacuum s'affichent en français ; une valeur inconnue s'affiche telle quelle.
- [x] Le plan ne se charge qu'à l'ouverture de la modale, ou quand il est posé sur le sol de la vue 3D ([spec](plan-de-l-aspirateur-sur-le-sol.md)).
- [x] La démo et le mock contiennent un aspirateur fictif (`dreame_demo`) dont les boutons, les pièces, le mode et la puissance modifient l'état simulé.
- [ ] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : le bouton est un élément HTML, sans draw call ni programme de plus. Mesure `pnpm bench --compare` à joindre à la PR.

## Impacts

- Configuration des maisons : nouvel élément `vacuum` ([guide](../guides/aspirateur-robot.md)).
- Mock Home Assistant : aspirateur `dreame_demo` et services `vacuum.*` et `dreame_vacuum.vacuum_clean_segment` simulés.
- Images : `public/vacuum/demo_map.svg`, plan fictif de la démo, calqué sur la maison 3D.
- Imprimante 3D : la vitesse passe par le composant commun `SelectToggle`, sans changement visible.
