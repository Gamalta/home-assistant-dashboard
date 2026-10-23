# État des lieux — octobre 2026

Photographie du projet sur la branche `feat/three-js` (commit `6e12129`), avant le chantier qualité. Ce document est daté : il n'est pas maintenu au fil de l'eau, les décisions vivent dans les [ADR](adr/README.md).

## Le produit

Un dashboard Home Assistant pensé pour une **tablette murale**. L'écran se compose de deux panneaux redimensionnables :

- **la barre latérale** : date et heure, météo, deux personnes (zone, distance, batterie, mode concentration), deux animaux, puis un dock caché (thème, choix de la maison, modale Système) ;
- **la maison en 3D** : modèle glTF exporté de Blender, avec des étiquettes HTML posées dans l'espace pour les lumières, la climatisation, les thermomètres, les volets et les ordinateurs. Un appui ouvre une modale animée (framer-motion `layoutId`).

La tablette cible a un GPU **Qualcomm Adreno 610**. Le rendu y est limité par le GPU : de 40 à 300 ms par image selon le DPR et les ombres, d'après les mesures des itérations « tablette » 1 à 7.

## Architecture

```
main.tsx          Sentry, StrictMode
└ app.tsx         AppProvider (options graphiques) → ThemeProvider (MUI) → HassConnect (réel ou mock)
  └ Dashboard     HouseProvider (config de maison) → panneaux react-resizable-panels
    ├ SideBar     cartes MUI, entités via @hakit/core
    └ House       choix du backend → <Canvas frameloop="demand">
      └ HouseScene
        ├ Scene / SceneMaterials / LightShadows / EnvironmentLighting / AmbientLight
        ├ Camera  OrbitControls + DPR réduit en mouvement
        ├ Benchmark  window.__dashboardBenchmark / __dashboardMotionBenchmark
        └ Room3d  étiquettes <Html> (drei) + RoomLight3d (pilote les SpotLight du modèle)
```

| Dossier           | Rôle                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| `src/components/` | Composants React uniquement (UI, scène 3D, modales)                                                     |
| `src/contexts/`   | `AppContext` (options graphiques persistées), `HouseContext`, `RoomContext`, `LightModalContext`, thème |
| `src/hooks/`      | Hooks transverses (`useHeatmapPoints`, `useModelCamera`, `useLongPress`…)                               |
| `src/rendering/`  | Code three.js hors React : backends WebGL/WebGPU, shaders GLSL et TSL                                   |
| `src/configs/`    | Une config par maison (`demo` dans le dépôt, `apartment` en sous-module privé)                          |
| `src/mock/`       | Faux Home Assistant complet (entités, services, historique, météo)                                      |
| `scripts/`        | `optimize-model.sh` (compression des modèles glTF)                                                      |

Les décisions structurantes déjà prises sont consignées a posteriori dans les ADR [0002](adr/0002-rendu-3d-a-la-demande.md) à [0009](adr/0009-budget-performance-tablette.md).

## Santé de l'outillage

| Point  | Constat                                                                                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tests  | Aucun : ni unitaires ni E2E                                                                                                                                               |
| CI     | Un seul workflow `lint.yml`, **en échec** (5 erreurs : 4 prettier, 1 règle react-hooks sur `Html.tsx`)                                                                    |
| Typage | `tsc` passe                                                                                                                                                               |
| README | Gabarit Create React App obsolète                                                                                                                                         |
| Docs   | Aucune, en dehors des commentaires de code                                                                                                                                |
| Dev    | En `pnpm dev`, la vue 3D meurt au bout de 2 s : le double montage de `StrictMode` fait appeler `forceContextLoss` par R3F. **Toute mesure faite en dev est donc fausse.** |

## Audit de performance

Mesures du 24/10/2026 sur le build de production (Chrome headless, Mac M-series, viewport 1280×800, DPR 2), avec le benchmark intégré et un compteur de draw calls. Un Mac n'est pas la tablette : ces chiffres servent à comparer les configurations entre elles, pas à prédire les images par seconde de l'Adreno.

### Rendu (`__dashboardBenchmark`, 60 images)

| Maison    | Options                | Draw calls / image | CPU rendu |     GPU |
| --------- | ---------------------- | -----------------: | --------: | ------: |
| demo      | défaut                 |                 46 |    0,4 ms |  5,0 ms |
| demo      | carte des températures |                 46 |    0,4 ms | 13,4 ms |
| apartment | défaut (WebGL)         |            **929** |    3,4 ms |  6,0 ms |
| apartment | défaut (WebGPU)        |                  — |    6,7 ms | 10,1 ms |
| apartment | ombres                 |              1 045 |   13,7 ms |  8,5 ms |
| apartment | ombres + reflets       |              1 223 |   15,5 ms | 10,5 ms |

### Interaction réelle (rotation à la souris, CPU bridé ×4)

| apartment, défaut                |     p50 |         p95 |
| -------------------------------- | ------: | ----------: |
| modèle actuel                    | 16,7 ms |     33,4 ms |
| modèle fusionné (voir constat 1) | 16,7 ms | **16,7 ms** |

Le profil CPU de la rotation attribue environ 90 % du temps à la boucle de rendu three.js (`renderBufferDirect`, `bindVertexArray`, uniforms, `updateMatrixWorld`). Les étiquettes HTML, React et OrbitControls pèsent peu.

### Constats

1. **Le modèle de l'appartement n'est pas optimisé.** Il compte 909 primitives, 140 matériaux (dont des doublons), aucune instance, et sa géométrie n'est pas compressée (4,9 Mo). Le modèle démo, lui, a été fusionné en un seul mesh. `optimize-model.sh` compresse sans fusionner. En essai, `dedup → flatten → join → weld → simplify → meshopt` donne **93 primitives et 1,2 Mo**, en conservant les noms de matériaux (`wall_*`, `room_*`) et les lumières.
2. **Les ombres recompilent tous les shaders à chaque interaction.** Basculer `light.castShadow` au début et à la fin du mouvement change `NUM_SPOT_LIGHT_SHADOWS`, donc la clé de programme. Mesure : 5 programmes relinkés et une tâche longue de 130 ms par geste. `receiveShadow` est un uniform : le couper sur les meshes pendant le mouvement aurait le même gain GPU sans aucune recompilation.
3. **Démarrage bloquant.** Des tâches longues de 1 à 6 s apparaissent au chargement (compilation synchrone des shaders, plus PMREM avec les reflets).
4. **HDR téléchargé pour rien.** Sans les reflets, les 1,7 Mo de `dikhololo_night_1k.hdr` ne servent qu'à calculer 9 coefficients d'harmoniques sphériques, qui pourraient être précalculés.
5. **WebGPU activé par défaut quand il est disponible,** alors qu'il coûte deux fois plus de CPU que WebGL sur le modèle actuel. Après fusion du modèle, les deux sont équivalents.
6. **La carte des températures** multiplie le temps GPU par 2,7 sur la démo : toute la maison devient translucide, donc l'overdraw explose.
7. **Inertie de la caméra :** le DPR plein ne revient qu'à l'arrêt de l'amortissement d'OrbitControls, soit 1,5 à 4 s après le relâcher. L'amortissement se compte en images : plus la tablette est lente, plus la caméra glisse.

### Artefacts et erreurs observés

- Vue 3D morte en dev (icône « contexte perdu »), avec les étiquettes HTML qui restent affichées.
- `WindowIcon.tsx` : chemin SVG invalide (`…Zm0280h480-480Z`), ce qui provoque une erreur console à chaque rendu de volet.
- 8 lumières de la config `apartment` n'ont pas de lumière 3D correspondante dans le modèle (avertissement « Aucune lumière 3D trouvée »).
- `Ombres limitées à 14/15 lumières sur 19` : les unités de texture sont épuisées.
- `PCFSoftShadowMap has been deprecated` : le type d'ombre n'est pas fixé explicitement.
- Arêtes crénelées en mouvement : c'est attendu, à DPR réduit sans antialiasing.
- Lumière qui traverse les murs quand les ombres sont désactivées : c'est inhérent à un éclairage sans ombres.
- Les 404 de `/_vercel/insights` et `/_vercel/speed-insights` hors Vercel sont sans conséquence.

## Pistes produit

- La barre latérale contient une carte vide sous les personnes : c'est un emplacement libre.
- Le mock fournit déjà des scènes, automatisations, calendriers, lecteurs multimédia, aspirateurs, caméras et alarmes, qui ne sont pas encore affichés.
- Rien ne signale une perte de connexion à Home Assistant ou une entité indisponible à l'échelle de la maison.
- Sur une tablette murale, il manque un mode veille (arrêt du rendu, écran assombri) et le maintien de l'écran allumé.
