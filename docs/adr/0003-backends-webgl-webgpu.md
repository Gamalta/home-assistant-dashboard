# 0003 — Backends WebGL et WebGPU interchangeables, chargés à la demande

- Statut : Accepté
- Date : 2026-10-24 (décision antérieure, consignée a posteriori)

## Contexte

three.js propose deux moteurs : `WebGLRenderer`, avec ses matériaux GLSL et `onBeforeCompile`, et `WebGPURenderer`, avec ses matériaux à nœuds TSL. Les matériaux personnalisés (murs qui s'effacent, carte des températures) s'écrivent différemment dans les deux. Le code WebGPU de three pèse environ 600 Ko minifiés.

## Décision

Le code propre à chaque moteur vit derrière l'interface `RenderBackend` (`src/rendering/backends/types.ts`) : création du renderer, fabriques de matériaux, informations GPU et attente du GPU pour le benchmark. `loadRenderBackend` importe dynamiquement le seul backend choisi par l'option « WebGPU ». Les shaders sont rangés par matériau puis par moteur : `src/rendering/shaders/<Matériau>/{WebGL,WebGPU}/`.

## Conséquences

- Le reste de la scène ignore le moteur utilisé.
- Chaque matériau personnalisé existe en deux versions, qu'il faut garder équivalentes.
- Si WebGPU plante, l'`ErrorBoundary` de `House` repasse sur WebGL.
- Aujourd'hui, WebGPU est activé par défaut dès qu'il est disponible. Sur le modèle non fusionné, il coûte pourtant deux fois plus de CPU que WebGL (voir l'[état des lieux](../etat-des-lieux.md)). Ce choix par défaut est à réévaluer.

## Alternatives considérées

- **WebGL seul** : plus simple, mais ferme la porte à WebGPU sur les appareils où il serait plus rapide.
- **WebGPU seul, avec son repli WebGL2 intégré** : les matériaux TSL tournent alors sur WebGL2, mais plus lentement que les matériaux GLSL natifs.
