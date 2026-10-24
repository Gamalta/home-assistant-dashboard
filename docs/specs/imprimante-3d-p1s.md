# Imprimante 3D Bambu Lab P1S

- Issue : #16
- Statut : Brouillon

## Problème

L'imprimante 3D (Bambu Lab P1S, intégration HACS ha-bambulab, une bobine externe et pas d'AMS) imprime souvent pendant des heures. Pour savoir où en est une impression, quand elle finira ou si elle s'est arrêtée sur une erreur, il faut aujourd'hui ouvrir Home Assistant ou l'application Bambu sur un téléphone. La tablette murale ne montre rien de l'imprimante.

## Objectif

Suivre et piloter l'impression en cours depuis la tablette : un bouton dans la scène 3D, une modale qui montre l'essentiel et permet de mettre en pause, de reprendre ou d'arrêter.

## Hors périmètre

- La caméra de la chambre : une image rafraîchie en continu coûte trop cher à la tablette. À ajouter plus tard, avec une image rafraîchie seulement quand on la demande.
- Le réglage des températures cibles de la buse et du plateau (entités `number`), les ventilateurs, le chargement et le déchargement du filament.
- L'AMS : l'imprimante du propriétaire n'en a pas. Seule la bobine externe est affichée.
- Le lancement d'une impression.

## Comportement attendu

### Scénario : suivre l'impression depuis la scène

- **Étant donné** une impression en cours, à 42 %, couche 126 sur 300, avec 1 h 15 restante
- **Quand** je regarde la scène 3D, puis que j'ouvre la modale « Imprimante 3D » depuis le bouton de l'imprimante
- **Alors** le bouton affiche l'icône de l'imprimante et « 42% » ;
- **et** la modale affiche l'image de la P1S, l'aperçu de l'impression sur le plateau, le nom de la tâche, l'état « En cours » et l'étape « Impression », la barre de progression à 42 %, « Couche 126 / 300 », « Reste 1 h 15 », « Fin vers HH:MM » (ou « Fin demain vers HH:MM »), les températures « Buse 219 / 220 °C » et « Plateau 55 / 55 °C », ainsi que le type et la couleur de la bobine.

Hors impression (terminée, interrompue, inactive), le bouton n'affiche que l'icône, et la modale ne montre plus ni l'étape, ni les couches, ni les temps, ni les boutons de pilotage.

### Scénario : piloter la lumière de la chambre et la vitesse

- **Étant donné** la modale ouverte pendant une impression, lumière de la chambre allumée et vitesse « Standard »
- **Quand** j'appuie sur le bouton de la lumière, puis sur « Sport »
- **Alors** la lumière s'éteint, l'image passe à la chambre éteinte, et la vitesse « Sport » est sélectionnée.

La vitesse n'est proposée que lorsque l'intégration la rend disponible, c'est-à-dire pendant l'impression et hors pause.

### Scénario : mettre en pause puis reprendre

- **Étant donné** une impression en cours
- **Quand** j'appuie sur « Pause »
- **Alors** l'état passe à « En pause », l'étape à « Demandée par l'utilisateur », et « Pause » laisse la place à « Reprendre » ;
- **quand** j'appuie sur « Reprendre », **alors** l'état revient à « En cours ».

### Scénario : arrêter après confirmation

- **Étant donné** une impression en cours ou en pause
- **Quand** j'appuie sur « Arrêter »
- **Alors** la modale demande « Arrêter l'impression ? » sans rien envoyer à l'imprimante ;
- **quand** j'appuie sur « Annuler », l'impression continue ;
- **quand** j'appuie sur « Oui, arrêter », l'impression s'arrête : l'état passe à « Interrompue » et le bouton de la scène ne montre plus de pourcentage.

### Scénario : signaler une erreur d'impression

- **Étant donné** l'entité `print_error` active, avec le texte de l'erreur dans ses attributs
- **Quand** j'ouvre la modale
- **Alors** une alerte rouge affiche « Erreur d'impression : » suivi de ce texte.

### Scénario : signaler une erreur HMS

- **Étant donné** l'entité `hms_errors` active
- **Quand** j'ouvre la modale
- **Alors** une alerte rouge affiche « Erreur HMS : » suivi du texte de la première erreur.

### Scénario : signaler une imprimante hors ligne

- **Étant donné** l'entité `online` inactive
- **Quand** j'ouvre la modale
- **Alors** une alerte orange affiche « Imprimante hors ligne ».

Les trois alertes se testent en unitaire (`PrinterAlerts.test.tsx`) : le mock de la démo n'a pas d'imprimante en erreur.

## Critères d'acceptation

- [x] L'élément se configure par un seul préfixe d'entités ([ADR 0018](../adr/0018-appareil-configure-par-prefixe.md)).
- [x] Les états et les étapes d'impression de ha-bambulab s'affichent en français ; une valeur inconnue s'affiche telle quelle.
- [x] Les images de la modale ne se chargent qu'à son ouverture, et aucune ne se rafraîchit en continu.
- [x] La démo et le mock contiennent une imprimante fictive (`p1s_demo`) dont les boutons et la vitesse modifient l'état simulé.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : le bouton est un élément HTML, sans draw call ni programme de plus.

## Impacts

- Configuration des maisons : nouvel élément `printer3d` ([guide](../guides/imprimante-3d.md)).
- Mock Home Assistant : imprimante `p1s_demo` et services `button.press` et `select.select_option` simulés.
- Images : `public/printer3d/` (P1S éclairée et éteinte, aperçu fictif de la démo).
- Performance : aucun changement mesuré sur la démo (46 draw calls au repos, 0 programme compilé pendant le benchmark, aucune tâche longue en rotation).
