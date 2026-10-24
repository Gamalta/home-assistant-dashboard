# 0012 — Suspendre les ombres par `receiveShadow`

- Statut : Proposé
- Date : 2026-10-24
- Issue : #9

## Contexte

L'[ADR 0005](0005-qualite-adaptative-en-mouvement.md) ne dessine les ombres qu'au repos. `LightShadows` les suspendait en basculant `light.castShadow` au début et à la fin de chaque mouvement de caméra. Or le nombre de lumières qui projettent une ombre (`NUM_SPOT_LIGHT_SHADOWS`, `USE_SHADOWMAP`) fait partie de la clé de programme de three.

Mesures sur `apartment`, ombres activées, build de production :

- Le premier geste après le chargement, après un changement d'option ou après l'allumage d'une lumière compile 5 programmes. Avec le CPU bridé ×4, il en résulte des tâches longues de 120 ms à 1,5 s. Les gestes suivants ne compilent plus rien, car three garde les deux variantes de chaque matériau.
- **Ombres absentes après un rechargement.** R3F réapplique la prop `shadows` du `<Canvas>` à chaque rendu de celui-ci : au chargement, à chaque changement d'option, au redimensionnement. Sa valeur par défaut, `false`, coupe `gl.shadowMap.enabled` et impose `PCFSoftShadowMap`, un type obsolète dans three r184, d'où l'avertissement `PCFSoftShadowMap has been deprecated`. Avec l'option enregistrée, aucune image n'était dessinée avec des ombres.
- **Va-et-vient au relâcher.** OrbitControls ne signale un déplacement qu'au-delà d'un seuil, garde le reste de l'inertie et l'applique à chaque image rendue. L'image du repos reprenait donc ce reste, signalait un déplacement et relançait le mode « mouvement ». Après chaque geste, on mesure 8 allers-retours du DPR, et le retour au repos n'intervient qu'environ 4 s après le relâcher. Selon l'ordre des images, les ombres disparaissent et reviennent avec lui : c'est le clignotement remarqué au relâcher.

## Décision

Les lumières gardent `castShadow` tant que l'option est active, dans la limite des unités de texture. Pendant un mouvement, `LightShadows` passe `receiveShadow` à `false` sur tous les meshes de la scène, y compris les calques de fondu des murs ajoutés par `SceneMaterials`. Dans three, `receiveShadow` est un uniform : le shader saute la lecture des ombres sans être recompilé.

- La carte d'ombre se règle sur le `<Canvas>` : `shadows={{enabled, type: PCFShadowMap}}`. Le type est explicite, et c'est le même pour WebGL et WebGPU.
- `Camera` constate la fin de l'inertie sur la première image rendue sans déplacement, hors d'un geste. Le repos arrive ensuite 250 ms après le dernier déplacement, délai qui couvre les crans successifs de la molette. Auparavant, un minuteur de 250 ms partait de chaque déplacement, si bien qu'une image plus lente que 250 ms déclenchait un faux repos en pleine inertie.
- Une fois l'inertie finie, les restes qu'OrbitControls applique encore sous son seuil ne relancent plus le mouvement : seul un geste (événement `start`) le peut. `__dashboardMotionBenchmark` émet donc `start` et `end`, comme un vrai geste.

## Conséquences

- Mesures sur `apartment` : 0 programme compilé par geste, au lieu de 5 au premier geste. Les ombres et le DPR changent une seule fois, au premier déplacement puis 250 ms après le dernier. Le retour au repos arrive 2,1 s après le relâcher, contre 4 s auparavant. L'E2E `e2e/ombres.spec.ts` vérifie ces trois points sur la démo.
- L'ADR 0005 reste valable, à un détail près : le délai de 250 ms court désormais à partir de la fin réelle de l'inertie.
- Chaque matériau n'a plus qu'un programme par état des lumières, au lieu de deux.
- En mouvement, le shader garde le code des ombres : les cartes restent liées et le vertex shader calcule encore leurs coordonnées. Seules les lectures sont sautées, par une branche sur l'uniform. Sous SwiftShader, une image en mouvement coûte autant qu'avec l'ancienne suspension. Le GPU du Mac est trop rapide pour départager les deux versions : la mesure reste à faire sur l'Adreno 610. Si son compilateur évaluait les deux branches de `( directLight.visible && receiveShadow ) ? getShadow(…) : 1.0`, il faudrait ajouter dans `shadowSampling.ts` un `if ( receiveShadow )` autour de la lecture.
- Sur WebGPU, `receiveShadow` fait partie de la clé des objets de rendu, et three libère un pipeline dès qu'il ne sert plus. Chaque transition reconstruit donc les matériaux, comme le faisait `castShadow` : on mesure des tâches longues de 0,6 à 2,5 s par geste, contre 0,6 à 3,6 s auparavant. Ce point est à traiter à part.
- Le reste de l'inertie, de l'ordre du pixel, s'applique en qualité de repos.
- Le mécanisme dépend du code de three : l'uniform `receiveShadow` et la clé de programme. Si l'un ou l'autre change, l'E2E échoue.

## Alternatives considérées

- **Basculer `castShadow`** (situation d'origine) : recompile les matériaux.
- **Basculer `gl.shadowMap.enabled`** : `USE_SHADOWMAP` fait aussi partie de la clé de programme.
- **`shadow.intensity = 0` pendant le mouvement** : c'est un uniform, mais three lit la carte d'ombre avant d'appliquer l'intensité, donc le GPU ne gagne rien.
- **Précompiler les deux variantes au chargement** : il y aurait deux fois plus de programmes à compiler au démarrage, qui gèle déjà (#12), et le va-et-vient au relâcher resterait.
- **Appliquer d'un coup le reste de l'inertie au repos** (`enableDamping = false`, puis `update()`, dans le minuteur du repos) : l'appel émet lui-même un `change` qu'il faut neutraliser. C'est plus de code pour le même résultat.
