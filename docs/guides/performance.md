# Mesurer la performance du rendu

La tablette cible (Adreno 610) est limitée par le GPU, puis par le CPU au-delà de quelques centaines de draw calls. Toute modification de la scène se mesure **avant et après**, sur le **build de production**. En `pnpm dev`, le double montage de StrictMode fausse les mesures.

## Lancer une mesure

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

Pour compter les draw calls et les compilations, enregistrer une trace dans l'onglet Performance de Chrome, ou utiliser Spector.js. Les seuils à respecter sont ceux de l'[ADR 0009](../adr/0009-budget-performance-tablette.md). `pnpm test` vérifie le poids et le nombre de primitives des modèles `.glb`, que `pnpm optimize-model` fusionne pour tenir le budget de draw calls ([ADR 0011](../adr/0011-fusion-des-meshes-des-modeles.md)).

## Simuler la tablette

Dans les DevTools, onglet Performance, régler **CPU : 4× slowdown**. Ce réglage reproduit l'ordre de grandeur du CPU de la tablette, mais pas celui de son GPU. Les coûts GPU se vérifient sur la tablette elle-même, avec la modale Système.
