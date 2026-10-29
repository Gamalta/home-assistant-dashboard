# 0043 — Application installable, sans service worker

- Statut : Proposé
- Date : 2026-10-28
- Issue : #70

## Contexte

Sur le téléphone, le dashboard s'ouvre dans un onglet du navigateur. Les barres de Safari prennent près de 200 px de haut : il reste 659 px visibles sur un iPhone 15 Pro, et l'adresse change d'onglet en onglet. Le propriétaire veut l'ajouter à l'écran d'accueil comme une application.

Le dashboard est déjà une application d'une seule page : il ramène toute adresse sur `/`. Il ne sert à rien hors ligne, puisqu'il pilote Home Assistant en direct par WebSocket.

## Décision

Le dashboard devient installable par un manifeste statique, `public/manifest.webmanifest`, sans service worker.

- `display: standalone` : l'application s'ouvre en plein écran, sans barre d'adresse, et `start_url` est `/`.
- La barre d'état de l'iPhone passe en `black-translucent` : la page passe dessous, comme dans Safari en paysage, et l'en-tête suit déjà `env(safe-area-inset-top)` ([ADR 0038](0038-disposition-mobile-a-deux-vues.md)).
- Les icônes PNG (180, 192 et 512 px) reprennent `icon.svg` sur le fond sombre du thème (`#1C1C1E`), avec la marge d'une icône `maskable`. iOS ignore les icônes SVG.

## Conséquences

- Aucune dépendance ajoutée, aucun code exécuté : trois balises dans `index.html`, un manifeste et trois images.
- iOS installe par « Partager → Sur l'écran d'accueil », Android par le menu de Chrome.
- L'application installée a son propre stockage sur iPhone : il faut s'y connecter une fois à Home Assistant, et le thème choisi dans Safari n'y est pas repris.
- Hors réseau, l'application affiche la même erreur que le site.
- En `black-translucent`, l'heure de l'iPhone reste blanche : en thème clair, seul le voile de l'en-tête la garde lisible.
- Une icône modifiée se régénère à la main depuis `icon.svg`.

## Alternatives considérées

- **`vite-plugin-pwa` et un service worker** : une dépendance et un cache à invalider à chaque déploiement, pour un dashboard inutilisable hors ligne. Chrome n'exige plus de service worker pour proposer l'installation.
- **`apple-mobile-web-app-capable`** : iOS lit `display` dans le manifeste depuis iOS 16.4, et Chrome signale la balise comme obsolète.
- **Barre d'état `default`** : opaque, elle prend 59 px de plus à la 3D.
