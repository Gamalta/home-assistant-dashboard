# Mesurer la performance du rendu

La tablette cible (Adreno 610) est limitée par le GPU, puis par le CPU au-delà de quelques centaines de draw calls. Toute modification de la scène se mesure **avant et après**, sur le **build de production**. En `pnpm dev`, le double montage de StrictMode fausse les mesures.

Les seuils à respecter sont ceux de l'[ADR 0009](../adr/0009-budget-performance-tablette.md). La CI en vérifie les comptes sur la démo (`e2e/budget.spec.ts`) ; `pnpm bench` mesure le reste, en local ([ADR 0029](../adr/0029-budget-performance-automatise.md)).

## Lancer `pnpm bench`

```sh
pnpm bench                          # demo, et apartment si le sous-module est présent
pnpm bench --houses demo            # une seule maison
pnpm bench --options defaut,chaleur # parmi defaut, ombres et chaleur
pnpm bench --cpu 4                  # CPU bridé ×4 pendant les mesures
pnpm bench --url http://localhost:4173/  # un build déjà servi, avec le mock
pnpm bench --ci                     # rendu logiciel SwiftShader, comme les E2E
```

Le script construit l'application avec le mock Home Assistant, la sert sur un port libre et l'ouvre dans le Chrome du système, avec le GPU de la machine, en 1280×800 à DPR 2. Pour chaque maison et chaque jeu d'options (par défaut : `defaut` et `ombres`), il :

1. charge la page et attend le repos : plus aucun draw call ni compilation pendant 1 s ;
2. lance `__dashboardBenchmark(60)` en comptant les draw calls de chaque image ;
3. fait tourner la caméra par un glissé de souris de 300 px, puis attend le retour au repos.

Il imprime un tableau Markdown et écrit le détail dans `bench.json` (`--out` pour un autre fichier). Sans Chrome, ou avec `--ci`, il utilise le Chromium de Playwright (`pnpm exec playwright install chromium`) en SwiftShader, à DPR 1 : les comptes restent justes, pas les durées.

## Comparer deux branches

```sh
git switch dev
pnpm bench --out /tmp/avant.json
git switch ma-branche
pnpm bench --compare /tmp/avant.json
```

Chaque valeur qui change s'affiche « avant → après ». Ce tableau accompagne toute PR qui touche au rendu ([conventions](../conventions.md)).

## Lire le tableau

| Colonne                    | Mesure                                                                | Budget   |
| -------------------------- | --------------------------------------------------------------------- | -------- |
| Draw calls                 | Draw calls d'une image au repos                                       | ≤ 150    |
| Programmes au démarrage    | Programmes WebGL liés entre le chargement et le repos                 | —        |
| Programmes en rotation     | Programmes liés du premier appui au retour au repos, au premier geste | 0        |
| Tâches longues / Tâche max | Tâches de plus de 50 ms pendant la rotation, et la plus longue        | 0 / ≤ 50 |
| CPU / GPU (ms)             | `cpuMs` et `gpuMs` de `__dashboardBenchmark`                          | —        |
| Image p50 / p95 (ms)       | Intervalle entre deux images pendant le glissé                        | —        |

Les valeurs hors budget sont en gras. Ce qui se compare :

- **les comptes** (draw calls, programmes) d'une machine à l'autre, SwiftShader compris. Seule exception : le nombre de lumières qui projettent une ombre est borné par les unités de texture du GPU ;
- **les durées** seulement entre deux lancements sur la même machine, avec le même Chrome et le même `--cpu`. `--compare` prévient quand l'environnement diffère. Elles varient de quelques dixièmes de milliseconde d'un lancement à l'autre : lancer deux fois pour juger du bruit. Aucune ne prédit celles de la tablette ;
- Chrome headless plafonne à 60 images par seconde : sur une machine rapide, p50 et p95 restent à 16,7 ms, sauf avec `--cpu 4` ;
- les programmes au démarrage varient de quelques unités selon l'ordre de chargement (HDR, états des entités).

## Mesurer à la main

```sh
SENTRY_AUTH_TOKEN= pnpm build
pnpm preview
```

Ouvrir la page, attendre la fin du chargement, puis dans la console :

```js
await __dashboardBenchmark(60); // rendu seul : ms/image, CPU, GPU, DPR
await __dashboardBenchmark(60, 1); // idem, avec un DPR forcé à 1
await __dashboardMotionBenchmark(); // rotation réelle : img/s, pire image
```

La modale **Système** (dock en bas de la barre latérale) lance les mêmes mesures depuis la tablette.

## Lire les chiffres

| Mesure                                            | Ce qu'elle révèle                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `cpuMs` élevé                                     | Trop de draw calls ou de changements d'état : fusionner les meshes, réduire les matériaux |
| `gpuMs` élevé                                     | Fill rate : DPR, lectures d'ombres, transparence et overdraw                              |
| `browserFps` bien inférieur à `fps`               | Coût hors rendu : React, étiquettes HTML, layout                                          |
| `worstMs` élevé dans `__dashboardMotionBenchmark` | Saccade : recompilation de shader ou tâche longue                                         |
| Programmes en rotation                            | Un `define`, ou un nombre de lumières ou d'ombres, qui change pendant le geste            |

`pnpm bench` compte les draw calls et les compilations. Pour savoir lesquels, enregistrer une trace dans l'onglet Performance de Chrome, ou utiliser Spector.js. `e2e/shadows.spec.ts` montre comment compter les programmes liés (`linkProgram`) pendant une vraie rotation à la souris. `pnpm test` vérifie le poids et le nombre de primitives des modèles `.glb`, que `pnpm optimize-model` fusionne pour tenir le budget de draw calls ([ADR 0011](../adr/0011-fusion-des-meshes-des-modeles.md)).

## Ombres

Les ombres ne sont lues qu'au repos ([ADR 0005](../adr/0005-qualite-adaptative-en-mouvement.md)). Pendant un geste, `LightShadows` coupe l'uniform `receiveShadow` des meshes, sans toucher aux lumières ([ADR 0012](../adr/0012-suspendre-les-ombres-par-receiveshadow.md)). Pendant une interaction, changer `castShadow`, `gl.shadowMap` ou le nombre de lumières visibles recompile tous les matériaux.

## Mesurer le démarrage

Au chargement, la scène reste masquée par le chargeur jusqu'à la fin de la compilation des shaders, faite en arrière-plan ([ADR 0015](../adr/0015-compilation-asynchrone.md)). Pour vérifier qu'aucune tâche longue ne fige l'écran, observer les entrées `longtask` (`PerformanceObserver`) depuis la navigation, ou enregistrer le chargement dans l'onglet Performance.

Chrome et le pilote gardent les programmes compilés en cache : un second chargement ne dit rien du premier lancement sur la tablette. Mesurer avec un profil neuf, et rendre chaque shader unique (par exemple, un uniform inutilisé ajouté par un script d'initialisation) pour contourner le cache du pilote.

## Éclairage

Le ciel et le soleil sont deux lumières fixes : l'heure ne change que leurs uniforms ([ADR 0030](../adr/0030-eclairage-ciel-soleil-sans-reflets.md)). Ajouter ou retirer une lumière, ou la rendre invisible, change la clé des programmes et recompile tous les matériaux : le ciel et le soleil ne varient donc que par leur intensité. Les lampes des pièces, elles, sont rendues invisibles quand elles sont éteintes pour épargner le GPU ([ADR 0005](../adr/0005-qualite-adaptative-en-mouvement.md)) : allumer ou éteindre une lampe recompile.

## Simuler la tablette

`pnpm bench --cpu 4`, ou dans les DevTools, onglet Performance, **CPU : 4× slowdown**. Ce réglage reproduit l'ordre de grandeur du CPU de la tablette, mais pas celui de son GPU. Les coûts GPU se vérifient sur la tablette elle-même, avec la modale Système.

## Moteur de rendu

Le benchmark mesure le moteur actif. WebGL est le moteur par défaut ([ADR 0017](../adr/0017-webgl-par-defaut.md)). Pour comparer avec WebGPU, l'activer dans la modale Système, puis refaire la même mesure.
