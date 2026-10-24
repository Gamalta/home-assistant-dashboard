# Modales de la lumière et du volet sans bug visuel

- Issue : #58
- Statut : Livrée

## Problème

Sur la tablette, plusieurs défauts visuels gâchent les modales de la lumière et du volet roulant :

- fermée pendant la course du volet, la modale se replie sur son bouton puis réapparaît vide au centre de l'écran, sans fond flouté, pendant une demi-seconde ;
- juste après la fermeture d'une modale, un appui sur un bouton du dashboard est ignoré tant que le fond flouté s'efface ;
- la luminosité affichée reste celle de l'ouverture : « 0 % » pour une lumière qu'on vient d'allumer ;
- en mode clair, la jauge de luminosité est blanche sur fond blanc ;
- sur la roue des températures, les curseurs des autres lumières restent collés en haut de la roue ;
- une lumière variable sans couleur ni effet perd son interrupteur et sa luminosité ;
- une lumière tout-ou-rien allumée s'affiche presque noire, sur sa carte comme sur son bouton ;
- à l'ouverture, le rebond fait sortir de l'écran la modale de la lumière et étire son contenu.

## Objectif

Les deux modales s'ouvrent, se ferment et se rouvrent proprement, et leurs contrôles reflètent l'état réel des appareils dans les deux thèmes.

## Hors périmètre

- L'onglet Effets et le `turn_off` du mock, repris par la PR des bandeaux LED (#43), et l'écart de 5 % du curseur de température vers les bords, corrigé par #35.

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

### Scénario : une lumière variable sans couleur garde interrupteur et luminosité

- **Étant donné** une lumière variable sans couleur ni effet, seule dans sa pièce, allumée à 50 %
- **Quand** l'utilisateur ouvre sa modale
- **Alors** l'interrupteur général et la jauge de luminosité, à 50 %, sont présents

### Scénario : une lumière tout-ou-rien allumée s'affiche en couleur

- **Étant donné** une lumière tout-ou-rien allumée
- **Quand** l'utilisateur regarde son bouton puis sa carte dans la modale
- **Alors** l'icône et la carte sont d'un blanc chaud, comme une lumière variable, et non presque noires

### Scénario : elle s'ouvre sans sortir de l'écran ni s'étirer

- **Étant donné** l'écran de la tablette (1280 × 800)
- **Quand** l'utilisateur ouvre la modale de la lumière, la plus haute
- **Alors** à chaque image, la modale reste dans l'écran et ni son titre ni son contenu ne sont étirés : le conteneur rebondit et dévoile le contenu à sa taille

## Critères d'acceptation

- [x] Chaque scénario est couvert par un test E2E (`e2e/modales-lumiere-volet.spec.ts`) qui échoue sans son correctif.
- [x] Le mode sombre garde le rendu actuel de la jauge.

## Impacts

- La base des modales change pour toutes : une modale fermée ignore les rendus de son parent, son fond flouté laisse passer les appuis pendant qu'il s'efface, et son ouverture rebondit moins fort, sans étirer l'en-tête ni le contenu.
- Une lumière tout-ou-rien allumée prend le même blanc chaud sur sa carte, sur son bouton et dans la scène 3D.
- Le mock et la démo gagnent deux lumières fictives, chacune dans sa pièce : `light.hallway_dimmer` (variable, sans couleur, « Entrée ») et `light.storage_switch` (tout-ou-rien, « Débarras »). Elles n'ont pas de lumière dans le modèle 3D de la démo.
- Le bouton d'une lumière prend son nom comme libellé accessible.
