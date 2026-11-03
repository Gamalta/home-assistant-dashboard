# 0053 — Les réglages de l'appareil dans une modale Configuration, la modale Système pour le serveur

- Statut : Proposé
- Date : 2026-11-02
- Issue : à créer

## Contexte

La modale Système mêlait deux sujets : l'état du serveur Home Assistant (graphes, uptime, alimentation, internet, mises à jour, sauvegardes, tablette) et les réglages de l'écran (options graphiques, veille, essai de l'éclairage, mesure des performances). Elle n'apparaissait que si la maison configure un bloc `system` : sans lui, aucun réglage n'était accessible.

Le filtre des étiquettes vivait dans une rangée de puces en haut de la vue 3D ([ADR 0033](0033-filtre-des-etiquettes-par-categorie.md)). Le propriétaire le veut avec les autres réglages, pour configurer quels éléments la vue affiche : une catégorie par type d'élément (dix aujourd'hui), les appareils passifs masqués par défaut, et une option qui n'affiche que les piles. Une rangée de puces à icônes ne tient pas dix catégories sur la vue 3D, et le choix se fait rarement.

## Décision

**Une modale Configuration**, ouverte depuis le dock (bouton « Configuration ») et depuis le Foyer sur téléphone, toujours présente. Elle reprend les réglages de l'appareil (colonne « Affichage ») et le filtre des étiquettes (colonne « Étiquettes »). La modale Système ne garde que le serveur et la tablette murale. Le bouton du dock qui choisit la maison s'appelle désormais « Maison », comme sur téléphone.

**Le filtre devient une liste d'interrupteurs**, un par catégorie présente dans la maison, avec son icône. Toutes les catégories d'éléments ont une ligne dans `labelCategories`. La rangée de puces disparaît de la vue 3D.

**Une catégorie peut être passive** (`passive: true`) : ses étiquettes sont masquées tant que l'utilisateur ne les affiche pas. Seuls les appareils sur pile (`battery`) le sont : le détecteur de fumée reste affiché pour son alarme.

**Le stockage retient les choix, pas les catégories masquées** : `shownCategories` associe une catégorie au choix de l'utilisateur, et une catégorie sans choix suit sa valeur par défaut. Une nouvelle catégorie s'affiche d'office, une catégorie passive reste masquée, y compris sur un appareil qui a déjà des options enregistrées.

**« Batteries uniquement »** (`batteriesOnly`) remplace les étiquettes par le niveau de pile de chaque élément qui en donne un (`batteryEntityId`), quelle que soit sa catégorie. Le composant de l'élément reçoit la variante `battery` : il affiche sa pile, et un appui ouvre sa modale habituelle.

## Conséquences

- Les réglages sont accessibles dans toutes les maisons, même sans bloc `system`.
- La vue 3D n'a plus de surimpression en haut : rien ne gêne les étiquettes, ni l'en-tête du téléphone.
- Masquer une catégorie demande d'ouvrir le dock puis la modale : deux appuis au lieu d'un.
- L'ancienne clé `hiddenCategories` est ignorée : un filtre enregistré avant ce changement est perdu, une seule fois.
- Le coût de rendu reste celui mesuré par l'ADR 0033 : une étiquette masquée est démontée, aucun shader n'est recompilé, et les lumières 3D restent pilotées.
- L'aspirateur donne sa pile dans un attribut, pas dans un `sensor` : il n'apparaît pas en mode « Batteries uniquement ».

## Alternatives considérées

- **Garder les puces sur la vue 3D** : dix puces de 44 px couvrent la moitié de la largeur de la vue sur tablette, et l'en-tête du téléphone oblige déjà à les décaler.
- **Ajouter les réglages à la modale Système** : elle devient une modale fourre-tout, invisible sans bloc `system`.
- **Garder `hiddenCategories` avec `['battery']` par défaut** : tout appareil qui a déjà enregistré ses options garde une liste vide et afficherait les appareils sur pile.
- **Une modale de pile commune en mode « Batteries uniquement »** : la modale des interrupteurs dessine un interrupteur, fausse pour un thermomètre ou un détecteur ; chaque élément montre déjà sa pile dans sa propre modale.
- **Le choix de la maison dans la modale Configuration** : il reste dans le dock et le Foyer, où il est déjà, sous le nom « Maison ».
