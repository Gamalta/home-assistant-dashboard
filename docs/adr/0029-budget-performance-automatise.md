# 0029 — Budget de performance : des comptes en CI, des durées en local

- Statut : Proposé
- Date : 2026-10-24
- Issue : #14

## Contexte

L'[ADR 0009](0009-budget-performance-tablette.md) fixe le budget de la tablette : au plus 150 draw calls par image au repos, aucun programme compilé et aucune tâche longue de plus de 50 ms pendant une rotation, des modèles d'au plus 2 Mo. Rien ne le vérifie. Les mesures se font à la main dans la console, ou avec des scripts jetables, et ne se comparent pas d'une PR à l'autre.

Les indicateurs ne sont pas tous fiables partout :

- un **compte** (draw calls d'une image, programmes liés par `linkProgram`) ne dépend que du code et de la scène. Il est le même sous SwiftShader, sur un Mac et sur la tablette, à une exception près : le nombre de lumières qui projettent une ombre est borné par les unités de texture du GPU ;
- une **durée** (CPU, GPU, intervalle entre images, tâche longue) dépend de la machine, du navigateur et de leur charge. Sous SwiftShader, une image de la démo prend de 50 à 150 ms, contre 4 ms avec le GPU d'un Mac. Un seuil de durée serait faux en CI, ou instable ;
- sur la base, `__dashboardMotionBenchmark` déplace la caméra sans passer par OrbitControls. Il ne déclenche donc ni la baisse du DPR ni la suspension des ombres, alors que c'est là que se produit la recompilation constatée par l'audit. Un vrai geste à la souris, lui, les déclenche.

## Décision

Un seul code de mesure, `scripts/bench/measure.ts`, sert à deux outils. Il ne s'appuie que sur l'API publique du benchmark (`window.__dashboardBenchmark`), sur des compteurs WebGL installés avant le chargement de la page (`addInitScript`) et sur de vrais gestes de souris. Il ne dépend pas de l'organisation interne de la scène, que d'autres PR modifient (#39, #45).

- **Au repos** : plus aucun draw call ni compilation pendant 1 s, ce qui revient à attendre que `frameloop="demand"` ne dessine plus rien.
- **Draw calls au repos** : les draw calls de chaque image affichée pendant `__dashboardBenchmark`. On retient la valeur la plus fréquente, celle d'un seul rendu, car le benchmark rend parfois plusieurs fois dans une même image.
- **Rotation** : un glissé de 300 px sur le canvas, du premier appui jusqu'au retour au repos. L'inertie et la fin du mouvement (retour du DPR plein, ombres rétablies) font partie du geste. C'est le premier geste après le chargement, le seul qui compile tant que les variantes de shaders ne sont pas en cache : c'est le pire cas, celui que l'on veut voir.

**En CI, seulement des comptes** : `e2e/budget.spec.ts`, sur la démo, avec les autres E2E sous SwiftShader ([ADR 0010](0010-strategie-de-tests.md)).

| Budget de l'ADR 0009                   | En CI | Remarque                                                 |
| -------------------------------------- | ----- | -------------------------------------------------------- |
| ≤ 150 draw calls par image au repos    | oui   | options par défaut                                       |
| 0 programme compilé pendant 1 rotation | oui   | par défaut ; avec les ombres, en `test.fail` jusqu'à #39 |
| Aucune tâche longue > 50 ms            | non   | c'est une durée                                          |
| Modèle ≤ 2 Mo                          | oui   | taille de `Demo.glb`                                     |

Les tests de rotation ont un délai triplé (`test.slow()`) : l'inertie de la caméra se compte en images, et une image est lente en rendu logiciel. Aucun test ne pose de seuil de durée.

**En local, tout le reste** : `pnpm bench` construit et sert le build de production (ou mesure une URL donnée), parcourt une matrice de maisons et d'options dans le Chrome du système, avec le GPU, et imprime un tableau Markdown, avec les valeurs hors budget en gras, ainsi qu'un JSON. `--compare <ancien.json>` affiche chaque écart sous la forme « avant → après ». `--cpu 4` bride le CPU pendant les mesures. Sans Chrome, ou avec `--ci`, le bench passe en SwiftShader, à DPR 1. La sortie de `pnpm bench --compare` accompagne toute PR qui touche au rendu ([conventions](../conventions.md)).

**Sur la tablette seulement** : le coût GPU réel de l'Adreno 610, avec la modale Système. `--cpu 4` reproduit l'ordre de grandeur de son CPU, pas celui de son GPU.

## Conséquences

- Une PR qui dépasse 150 draw calls ou recompile pendant un geste sur la démo échoue en CI, avant d'atteindre la tablette.
- Le défaut connu des ombres (10 programmes au premier geste, 5 au début et 5 à la fin) reste visible dans `e2e/budget.spec.ts`, en `test.fail`. Une fois #39 fusionnée, le test passe et Playwright le signale : il faut alors retirer `test.fail`.
- Les E2E durent plus longtemps : les trois tests de budget ajoutent environ une minute en local et deux en CI.
- Une durée ne se compare qu'à une autre durée mesurée sur la même machine, avec le même Chrome et le même `--cpu`. La sortie de `--compare` le rappelle quand l'environnement diffère. D'un lancement à l'autre, une durée varie de quelques dixièmes de milliseconde : seul un écart net compte. Les programmes au démarrage varient aussi de quelques unités, selon l'ordre de chargement (HDR, états des entités) : ils n'ont pas de budget.
- `apartment` ne se mesure qu'en local, quand le sous-module est présent.
- Les compteurs couvrent `drawArrays`, `drawElements` et leurs variantes instanciées, en WebGL seulement : le bench force `webGPU: false`, et un `BatchedMesh` (extension `WEBGL_multi_draw`) ne serait pas compté.
- Le script est en TypeScript, exécuté directement par Node 24 : il est typé, linté et testé comme le reste. Il n'ajoute aucune dépendance (`@playwright/test` et l'API JavaScript de Vite).

## Alternatives considérées

- **Des seuils de durée en CI** (ms par image, p95) : instables sous SwiftShader, et sans rapport avec la tablette.
- **`pnpm bench --ci` dans le workflow** : plusieurs minutes de plus pour des durées sans valeur, alors que les comptes sont déjà vérifiés par les E2E.
- **`renderer.info` de three.js** : il faut atteindre l'état interne de React Three Fiber, que #45 réorganise. Les compteurs WebGL ne dépendent que du navigateur.
- **`__dashboardMotionBenchmark` pour la rotation** : sur la base, il ne passe pas par OrbitControls et ne montre donc pas la recompilation des ombres. #39 lui fait émettre `start` et `end`, mais un vrai geste reste plus proche de l'usage et ne dépend d'aucune PR.
- **Spector.js ou une trace de l'onglet Performance** : manuels, sans comparaison automatique.
- **Lighthouse ou tachometer** : nouvelle dépendance, qui ne compte ni les draw calls ni les compilations.
