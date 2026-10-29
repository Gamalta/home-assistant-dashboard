# Application installable

- Issue : #70
- Statut : Brouillon

## Problème

Sur le téléphone, le dashboard vit dans un onglet du navigateur. Les barres de Safari mangent près de 200 px de haut, et il faut retrouver l'onglet pour allumer une lumière.

## Objectif

Ajouter le dashboard à l'écran d'accueil et l'ouvrir en plein écran, comme une application.

## Hors périmètre

- Le fonctionnement hors ligne : le dashboard pilote Home Assistant en direct.
- Les notifications.
- Une icône différente en thème clair.

## Comportement attendu

### Scénario : le dashboard s'installe sur l'écran d'accueil

- **Étant donné** le dashboard ouvert dans Safari ou Chrome sur un téléphone
- **Quand** l'utilisateur choisit « Sur l'écran d'accueil » (iOS) ou « Installer l'application » (Android)
- **Alors** l'icône de la maison, sur fond sombre, s'ajoute à l'écran d'accueil sous le nom « Elihome »

### Scénario : l'application s'ouvre en plein écran

- **Étant donné** le dashboard installé
- **Quand** l'utilisateur touche son icône
- **Alors** le dashboard s'ouvre sur `/`, sans barre d'adresse, et passe sous la barre d'état et la barre d'accueil

## Critères d'acceptation

- [ ] Un test E2E de `e2e/mobile.spec.ts` vérifie que la page déclare le manifeste, et que celui-ci s'ouvre en `standalone` sur `/` avec des icônes de 192 et 512 px servies en PNG.
- [ ] L'installation est essayée sur un iPhone et sur Android.

## Impacts

- Décision : [ADR 0043](../adr/0043-application-installable-sans-service-worker.md).
- Fichiers : `public/manifest.webmanifest`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, et trois balises dans `index.html`.
- Config, mock, performance : aucun changement.
