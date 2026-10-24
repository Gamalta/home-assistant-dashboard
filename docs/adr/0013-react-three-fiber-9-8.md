# 0013 — Monter React Three Fiber en 9.8.2 et tester le serveur de dev

- Statut : Proposé
- Date : 2026-10-24
- Issue : #10

## Contexte

En `pnpm dev`, la vue 3D meurt environ 2 s après le chargement : icône « contexte perdu », étiquettes HTML orphelines, benchmark à 0 ms. Le build de production n'est pas touché.

La cause est prouvée par une trace des appels à `getContext`, `loseContext` et des événements `webglcontextlost`. React 19 `StrictMode` démonte puis remonte chaque composant au premier montage. Dans `@react-three/fiber` 9.6.1, le nettoyage de l'effet du `<Canvas>` appelle `unmountComponentAtNode`, qui programme `forceContextLoss()` dans un `setTimeout` de 500 ms. Le remontage réutilise la même racine et le même contexte WebGL sans annuler ce minuteur. La perte de contexte est définitive.

- Sans `StrictMode`, le problème disparaît.
- Une fabrique `gl` synchrone n'y change rien : le minuteur part du démontage, pas de la création du renderer.
- R3F 9.8.0 corrige ce cycle (« unmount roots deterministically instead of after a 500ms timer ») : le minuteur laisse place à une transition d'état à jeton (`transitionRoot`), et un remontage annule le démontage en attente. 9.8.2 (14/10/2026) est la dernière version de la branche 9. Ses dépendances pairs sont `react >=19 <19.4` et `three >=0.156`, et le dépôt utilise React 19.2.6 et three 0.184.

Le bug ne se voyait dans aucun test : les E2E tournent sur le build ([ADR 0010](0010-strategie-de-tests.md)), où `StrictMode` ne double pas les effets.

## Décision

`@react-three/fiber` passe de 9.6.1 à **9.8.2**, en version exacte comme les autres dépendances. `@react-three/drei` reste en 10.7.7 : il demande `@react-three/fiber ^9.0.0`.

Un projet Playwright `dev` vérifie la correction sur le serveur de dev, la seule configuration où le bug existe :

- `playwright.config.ts` lance un second `webServer`, `vite` sur le port `E2E_PORT + 1`, avec le même mock et la même maison `demo` que le build ;
- le projet `dev` ne joue que `e2e/dev.spec.ts`, et le projet `chromium` l'ignore ;
- le test attend la scène, laisse passer 2 s, bien au-delà du minuteur de 500 ms, puis vérifie que le contexte WebGL du canvas n'est pas perdu. Il échoue avec 9.6.1 et passe avec 9.8.2.

Le projet `dev` passe par les fixtures communes, donc il échoue sur toute erreur console, y compris les avertissements que React n'émet qu'en dev. Il en a trouvé un : `useGLTF` démarrait le chargement du modèle pendant le rendu de `HouseScene`, et `useProgress` mettait alors à jour `ModelLoader` (« Cannot update a component while rendering a different component »). `House` précharge désormais le modèle dans un effet (`useGLTF.preload`), hors du rendu.

## Conséquences

- La vue 3D reste vivante en dev, avec WebGL comme avec WebGPU. Les mesures et le débogage en dev redeviennent possibles, même si les mesures de référence restent faites sur le build ([guide performance](../guides/performance.md)).
- `pnpm test:e2e` lance deux serveurs (build et dev) et un test de plus. La CI n'a pas changé : le projet `dev` fait partie de la même commande.
- Le test repose sur une attente fixe de 2 s : c'est le délai du bug lui-même, pas une synchronisation.
- R3F 9.8 libère désormais le renderer qu'il crée (`dispose()`) quand le `<Canvas>` est démonté, au changement de maison ou de moteur.
- Il ne réapplique plus les options inchangées à chaque rendu du `<Canvas>`. Avec 9.6.1, chaque nouveau rendu de `HouseScene` remettait `gl.shadowMap.enabled` à `false` : basculer une autre option graphique, ombres actives, coupait les ombres. Elles restent désormais allumées.
- Le bundle principal grossit d'environ 25 Ko minifiés (7,5 Ko gzip). Les mesures du rendu sur le build sont inchangées : 46 draw calls au repos, aucun programme compilé pendant la rotation.
- En dev seulement, basculer le moteur WebGL / WebGPU à chaud affiche un avertissement React : « Attempted to synchronously unmount a root while React was already rendering ». R3F 9.8 monte la nouvelle scène dans l'effet de layout du `<Canvas>`, ce qui finit de démonter l'ancienne pendant le commit de React DOM, et `<Html>` de drei démonte alors sa racine React DOM de façon synchrone. C'est sans effet visible, et drei 10.7.9 a le même code. Aucun test ne bascule le moteur, donc rien n'échoue.
- La dépendance pair `react <19.4` bloque une future montée de React tant que R3F n'a pas suivi.

## Alternatives considérées

- **Retirer `StrictMode`** : le symptôme disparaît, mais on perd la détection des effets mal nettoyés pour toute l'application.
- **Fabrique `gl` synchrone** : essayée, sans effet.
- **Patcher R3F 9.6.1 (`pnpm patch`)** : un correctif à maintenir à chaque montée de version, alors que la version officielle le contient.
- **R3F 10 (alpha)** : réécriture majeure, instable, avec des changements d'API.
- **Test de non-régression unitaire** : jsdom n'a pas de WebGL et le bug dépend du cycle de vie réel du `<Canvas>`.
- **Config Playwright séparée (`playwright.dev.config.ts`) et script dédié** : un fichier, un script et une étape de CI de plus, pour un seul test.
