# Modales de la lumière et du volet sans bug visuel

- Issue : #58
- Statut : Livrée

## Problème

Sur la tablette, plusieurs défauts visuels gâchent les modales de la lumière et du volet roulant :

- fermée pendant la course du volet, la modale se replie sur son bouton puis réapparaît vide au centre de l'écran, sans fond flouté, pendant une demi-seconde ;
- juste après la fermeture d'une modale, un appui sur un bouton du dashboard est ignoré tant que le fond flouté s'efface ;
- la luminosité affichée reste celle de l'ouverture : « 0 % » pour une lumière qu'on vient d'allumer ;
- en mode clair, la jauge de luminosité est blanche sur fond blanc ;
- sur la roue des températures, les curseurs des autres lumières restent collés en haut de la roue.

## Objectif

Les deux modales s'ouvrent, se ferment et se rouvrent proprement, et leurs contrôles reflètent l'état réel des appareils dans les deux thèmes.

## Hors périmètre

- Le rebond d'ouverture des modales hautes, qui déborde brièvement de l'écran : c'est un choix d'animation commun à toutes les modales.
- Les lumières sans couleur : l'onglet Effets et le mock `turn_off` sont repris par la branche des bandeaux LED, l'écart de 5 % du curseur de température par `fix/bugs-affichage`.

## Comportement attendu

### Scénario : fermer la modale pendant l'animation du volet

- **Étant donné** la modale du volet ouverte et le volet en train de descendre
- **Quand** l'utilisateur ferme la modale
- **Alors** elle se replie sur son bouton et disparaît sans réapparaître

### Scénario : rouvrir la modale juste après sa fermeture

- **Étant donné** la modale du volet qui vient d'être fermée et se replie encore
- **Quand** l'utilisateur appuie de nouveau sur le bouton du volet
- **Alors** la modale se rouvre

### Scénario : allumer la lumière met à jour sa luminosité

- **Étant donné** la modale de la lumière ouverte sur une lumière éteinte, affichée à 0 %
- **Quand** l'utilisateur allume cette lumière
- **Alors** la luminosité affichée passe à 100 %

### Scénario : la jauge de luminosité se voit en mode clair

- **Étant donné** le mode clair et la modale de la lumière ouverte
- **Quand** la lumière active passe de 0 à 100 %
- **Alors** la jauge se remplit d'un dégradé sombre, visible sur le fond clair

### Scénario : les curseurs des autres lumières suivent leur température

- **Étant donné** la modale de la lumière ouverte, avec une autre lumière allumée à 3993 K
- **Quand** l'utilisateur passe sur l'onglet des températures
- **Alors** le curseur de cette lumière se place vers le tiers haut de la roue, sur sa teinte

## Critères d'acceptation

- [x] Chaque scénario est couvert par un test E2E (`e2e/modales-lumiere-volet.spec.ts`) qui échoue sans son correctif.
- [x] Le mode sombre garde le rendu actuel de la jauge.

## Impacts

La base des modales change pour toutes : une modale fermée ignore les rendus de son parent, et son fond flouté laisse passer les appuis pendant qu'il s'efface. Aucun impact sur la scène 3D, le mock ou les configurations.
