# 0005 — Qualité réduite pendant le mouvement, ombres figées

- Statut : Accepté
- Date : 2026-10-24 (décision antérieure, itérations tablette 1 à 7)

## Contexte

Sur l'Adreno 610, une image au DPR natif avec les ombres de toutes les lumières coûte jusqu'à 300 ms de GPU. Au repos, ce coût est acceptable puisqu'une seule image est rendue. En rotation, il rend la caméra inutilisable.

## Décision

- Pendant un mouvement de caméra, `Camera` abaisse le DPR entre 0,5 et 1, selon le facteur de `PerformanceMonitor`. Il le rétablit 250 ms après la dernière modification.
- Les cartes d'ombre ne sont calculées qu'une fois (`shadow.autoUpdate = false`), puisque la géométrie ne bouge pas.
- Les ombres ne sont dessinées qu'au repos : `LightShadows` les suspend pendant le mouvement.
- Le filtrage PCF de three est remplacé par une seule lecture matérielle (`shadowSampling.ts`), soit cinq fois moins de lectures de texture.
- Les matériaux passent en Lambert quand les reflets sont désactivés, et les lumières éteintes sont rendues invisibles.

## Conséquences

- Les images en mouvement sont crénelées ; l'image au repos est nette.
- Aujourd'hui, la suspension des ombres bascule `light.castShadow`, ce qui change la clé de programme et **recompile tous les shaders à chaque geste** (voir l'[état des lieux](../etat-des-lieux.md)). La suspension doit passer par l'uniform `receiveShadow`.
- Le patch de `shadowSampling.ts` dépend du code source de three. Un test vérifie qu'il s'applique toujours après une montée de version.

## Alternatives considérées

- **Ombres limitées à quelques lumières** : refusé, le propriétaire veut les ombres de toutes les lumières.
- **Ombres précalculées dans les textures (baking)** : les lumières changent d'état et de couleur, donc le résultat serait faux.
