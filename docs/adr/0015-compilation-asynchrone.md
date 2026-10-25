# 0015 — Compiler les shaders en arrière-plan avant d'afficher la scène

- Statut : Proposé
- Date : 2026-10-24
- Issue : #12

## Contexte

Au chargement et à chaque changement d'option graphique, l'écran se fige. Les mesures sont faites sur le build de production, avec Chrome et le GPU d'un Mac (Apple M4, ANGLE Metal), une fenêtre de 1280×800 et un DPR de 2.

Chrome et Metal gardent les programmes compilés en cache. Pour mesurer un premier lancement, comme sur une tablette qui découvre une nouvelle version, un script d'initialisation ajoute à chaque shader un uniform unique, qui contourne ces caches (mesures « à froid »).

Le profil CPU du démarrage (CDP Profiler) attribue le temps du thread principal ainsi :

| demo, à froid    | Thread actif | Compilation | dont PMREM | GLB (meshopt) |   HDR |  React |
| ---------------- | -----------: | ----------: | ---------: | ------------: | ----: | -----: |
| défaut           |     2 854 ms |    2 160 ms |          — |          9 ms | 42 ms | 218 ms |
| reflets          |     6 648 ms |    6 147 ms |     411 ms |          9 ms | 36 ms | 145 ms |
| ombres + reflets |    12 790 ms |   12 207 ms |     255 ms |         11 ms | 28 ms | 174 ms |

Le temps de compilation se passe presque entièrement dans `WebGLProgram.getUniforms` → `getProgramInfoLog`, à la première image : le thread principal y attend la fin du link des programmes. Trois défauts l'aggravent :

1. **Une combinaison de lumières par lumière allumée.** Au démarrage, chaque lumière allumée de `RoomLight3d` devient visible puis appelle `compileAsync` avec le nombre de lumières visibles à cet instant. La démo compile ainsi 4 jeux de programmes, soit 20 programmes, dont un seul jeu de 5 sert.
2. **Des ombres réinitialisées par chaque rendu du `<Canvas>`.** Sans prop `shadows`, R3F remet `gl.shadowMap.enabled` à `false` et le type à `PCFSoftShadowMap` à chaque rendu du composant. Au premier rendu d'ombre, three remplace ce type obsolète par `PCFShadowMap`, ce qui change la clé des programmes. Le même défaut éteint les ombres quand on change une autre option, comme les murs transparents.
3. **Une compilation synchrone au changement d'option.** `SceneMaterials` recrée les matériaux, et l'image suivante les compile de façon synchrone (ADR 0004).

## Décision

La scène n'est dessinée qu'une fois compilée pour les options en cours. La compilation se fait en arrière-plan, sur le moteur choisi.

- **`RenderBackend.compile(renderer, scene, camera)`** (ADR 0003). Sur WebGL, la méthode appelle `compileAsync`, qui profite de `KHR_parallel_shader_compile`. Elle lit ensuite les uniforms de chaque programme, tant que la file du GPU est vide. À la première image, chaque lecture attendrait sinon les dessins précédents, création de leurs pipelines comprise. Sur WebGPU, elle appelle `compileAsync`.
- **`Precompile`**, dernier enfant du `<Canvas>`. Son effet passe après ceux qui préparent la scène. Il compile, puis prévient `HouseScene`.
- **`HouseScene`** garde le `<Canvas>` en `frameloop="never"` tant que les 4 options qui changent les shaders (murs, carte des températures, reflets, ombres) ne sont pas compilées. Il repasse ensuite en `demand` et demande une image.
  - Au démarrage, le chargeur couvre la vue 3D. Une fois les fichiers téléchargés, il tourne sans pourcentage.
  - Au changement d'option, la dernière image reste affichée, sans chargeur.
  - `Benchmark` n'est monté que sur une scène compilée : `window.__dashboardBenchmark` signifie « scène prête ».
- **`RoomLight3d`** cherche sa lumière dans le modèle pendant le rendu, et non plus dans un effet suivi d'un rendu. Elle prend donc son état dès le premier commit, avant la précompilation. Sa propre compilation attend une microtâche, le temps que les autres lumières du même commit changent d'état : il ne reste qu'une combinaison à compiler.
- **Le `<Canvas>` reçoit `shadows={configuration.shadows && 'percentage'}`** : R3F applique alors toujours le bon état et le type PCF, celui que three finissait par utiliser.
- `House` remonte `HouseScene` à chaque changement de maison ou de moteur (`key`), ce qui remet son état à zéro.

## Conséquences

Démarrage. La valeur retenue est la médiane de 3 lancements (7 pour « défaut », cache chaud), chacun dans un navigateur neuf, avant et après en alternance. Le tableau donne la pire tâche longue, puis l'heure de la première image depuis la navigation.

| Maison, options             | À froid, avant      | À froid, après        | Cache chaud, avant | Cache chaud, après |
| --------------------------- | ------------------- | --------------------- | ------------------ | ------------------ |
| demo, défaut                | 2 739 ms · 3,99 s   | **151 ms** · 2,11 s   | 133 ms · 1,45 s    | 125 ms · 1,42 s    |
| demo, reflets               | 6 427 ms · 8,27 s   | **425 ms** · 2,89 s   | 246 ms · 1,84 s    | 123 ms · 1,53 s    |
| demo, ombres                | 6 604 ms · 7,90 s   | **198 ms** · 2,77 s   | 158 ms · 1,47 s    | 127 ms · 1,47 s    |
| demo, ombres + reflets      | 11 340 ms · 13,14 s | **509 ms** · 4,32 s   | 345 ms · 1,73 s    | 130 ms · 1,54 s    |
| apartment, défaut           | 3 674 ms · 7,45 s   | **193 ms** · 3,39 s   | 167 ms · 1,63 s    | 126 ms · 1,59 s    |
| apartment, reflets          | 6 203 ms · 12,71 s  | **673 ms** · 4,04 s   | 302 ms · 1,54 s    | 106 ms · 1,35 s    |
| apartment, ombres           | 3 694 ms · 9,02 s   | **147 ms** · 2,54 s   | 166 ms · 1,42 s    | 123 ms · 1,49 s    |
| apartment, ombres + reflets | 9 413 ms · 11,76 s  | **1 200 ms** · 5,15 s | 358 ms · 1,63 s    | 118 ms · 1,47 s    |

La tâche de 120 ms qui reste, cache chaud, est l'évaluation du JavaScript au chargement de la page : elle existe aussi avant.

Bascule d'option depuis la modale Système, depuis les options par défaut : pire écart entre deux images du navigateur, soit le gel de l'interface.

| Bascule           | demo, à froid      | apartment, à froid | demo, cache chaud | apartment, cache chaud |
| ----------------- | ------------------ | ------------------ | ----------------- | ---------------------- |
| reflets activés   | 3 383 → **467** ms | 3 433 → **400** ms | 167 → **33** ms   | 250 → **100** ms       |
| ombres activées   | 1 517 → **17** ms  | 1 433 → **300** ms | 67 → **17** ms    | 167 → **83** ms        |
| murs transparents | 33 → 17 ms         | 67 → 50 ms         | 17 → 17 ms        | 100 → 50 ms            |

Sur WebGPU (cache chaud), la pire tâche longue passe de 551 à 168 ms sur apartment, et de 2 251 à 604 ms avec les reflets.

- Les images sont identiques au pixel près avant et après : défaut, reflets, ombres, murs opaques et carte des températures, sur les deux maisons. Il y a deux exceptions.
  - Ombres et reflets sur demo : 4 156 pixels des vitres diffèrent. La passe de transmission, qui dessine la scène vue à travers les vitres, perdait ses ombres après un rendu du `<Canvas>`. Elle les garde maintenant.
  - WebGPU : l'image d'avant variait d'un lancement à l'autre, faute de pipelines prêts. Elle est désormais stable.
- Ce qui reste synchrone : la génération de la carte d'environnement (PMREM) avec les reflets, soit 0,4 à 0,7 s à froid, et les programmes des cartes d'ombre, compilés par three au premier rendu des ombres. three n'offre pas d'API publique pour les précompiler.
- Pendant la compilation qui suit un changement d'option, la scène ne se redessine pas. Une rotation de la caméra n'apparaît qu'à la fin.
- Si la carte des températures reçoit ses premiers capteurs après la compilation, les nouveaux matériaux se compilent encore à l'image suivante.
- En CI, SwiftShader n'a pas `KHR_parallel_shader_compile` : la compilation y reste bloquante, comme avant. Les E2E vérifient le comportement (chargeur, scène redessinée), pas les durées.

## Alternatives considérées

- **Dessiner une première image cachée derrière le chargeur** : la compilation reste synchrone, l'interface et le chargeur gèlent.
- **Suspendre le rendu avec `<Suspense>`** jusqu'à la fin de la compilation : la scène doit être montée et ses effets passés pour être compilée.
- **`compileAsync` sans retenir les images** : la moindre demande d'image avant la fin, par un effet ou par la caméra, compile alors de façon synchrone.
- **Afficher le chargeur à chaque changement d'option** : sur un appareil rapide, il clignoterait. La dernière image suffit à montrer que la page vit.
- **Faire attendre à `Precompile` un rendu de plus**, au lieu de chercher la lumière pendant le rendu dans `RoomLight3d` : moins de fichiers touchés, mais `Precompile` dépendrait du nombre de rendus de `RoomLight3d`.
- **Précompiler les shaders du PMREM et des ombres** : leurs matériaux sont privés à three (`PMREMGenerator`, `WebGLShadowMap`).
