# 0009 — Budget de performance de la tablette

- Statut : Proposé
- Date : 2026-10-24

## Contexte

Les sept itérations « tablette » ont été mesurées à la main sur l'Adreno 610. Rien n'empêche aujourd'hui une PR de doubler le nombre de draw calls ou d'ajouter une recompilation de shaders par geste : l'audit du 24/10/2026 a justement trouvé ces deux régressions. Une tablette ne tourne pas en CI. En revanche, les indicateurs qui la font souffrir se mesurent partout.

## Décision

Toute PR qui touche au rendu respecte ce budget sur la maison `demo` et, en local, sur `apartment` :

| Indicateur                               | Budget         | Pourquoi                                                 |
| ---------------------------------------- | -------------- | -------------------------------------------------------- |
| Draw calls par image au repos            | ≤ 150          | Le CPU de la tablette sature vers 900 draw calls (17 ms) |
| Programmes compilés pendant une rotation | 0              | Une recompilation fige l'écran 100 à 300 ms              |
| Tâche longue pendant une rotation        | aucune > 50 ms | Saccade visible                                          |
| Taille d'un modèle `.glb`                | ≤ 2 Mo         | Chargement sur le Wi-Fi de la tablette                   |

Ces chiffres se mesurent avec le benchmark intégré (`window.__dashboardBenchmark`) et le [guide performance](../guides/performance.md). Ils sont destinés à être vérifiés automatiquement.

## Conséquences

- Une régression se voit avant la tablette.
- Le budget de draw calls impose de fusionner les meshes des modèles (voir l'état des lieux, constat 1).
- Les seuils sont des ordres de grandeur, à réviser avec de nouvelles mesures sur la tablette.

## Alternatives considérées

- **Budget en images par seconde** : il dépend de la machine de mesure, donc il n'est pas comparable entre la CI, un Mac et la tablette.
- **Pas de budget** : les régressions ne se découvrent que sur la tablette, plusieurs PR plus tard.
