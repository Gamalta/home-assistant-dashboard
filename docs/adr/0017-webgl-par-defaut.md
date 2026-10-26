# 0017 — WebGL par défaut, WebGPU en option

- Statut : Proposé
- Date : 2026-10-24
- Issue : #40

## Contexte

L'[ADR 0003](0003-backends-webgl-webgpu.md) rend les deux moteurs interchangeables et active WebGPU dès que le navigateur le propose. Les mesures d'octobre 2026 vont toutes contre ce choix par défaut :

- sur le modèle de l'appartement non fusionné, WebGPU coûte deux fois plus de CPU par image que WebGL (6,7 ms contre 3,4 ms) ;
- avec les ombres, `receiveShadow` fait partie de la clé des objets de rendu WebGPU : chaque début et fin de mouvement reconstruit les pipelines, soit des tâches longues de 0,6 à 2,5 s par geste (ADR 0012, PR #39) ;
- la compilation des matériaux à nœuds est plus longue au démarrage ;
- aucun gain n'a été mesuré sur la tablette (Adreno 610), et les tests E2E ne couvrent pas WebGPU, que Chromium headless n'expose pas.

## Décision

WebGL est le moteur par défaut. WebGPU reste disponible dans la modale Système pour les appareils où il serait plus rapide : le choix est enregistré, puis ignoré si WebGPU n'est plus disponible.

## Conséquences

- Le moteur par défaut est celui que mesurent le benchmark, la CI et le budget de l'[ADR 0009](0009-budget-performance-tablette.md).
- Un appareil déjà utilisé garde l'option enregistrée : sur la tablette, il faut désactiver WebGPU une fois dans la modale Système. Pas de migration des options enregistrées : elle ne servirait qu'une fois.
- Les matériaux WebGPU restent maintenus (ADR 0003), mais ils sont moins testés que leurs équivalents WebGL.

## Alternatives considérées

- **Garder WebGPU par défaut et corriger les ombres sur WebGPU** (ne pas les suspendre en mouvement) : ça règle un des problèmes, pas le surcoût CPU ni la compilation.
- **Choisir le moteur selon le GPU détecté** : il faudrait des mesures sur plusieurs appareils pour établir une règle, et nous n'en avons que sur un.
- **Supprimer WebGPU** : ça ferme la porte aux appareils où il serait plus rapide, pour une maintenance que l'ADR 0003 a déjà payée.
