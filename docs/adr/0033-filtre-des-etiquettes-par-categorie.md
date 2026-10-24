# 0033 — Filtre des étiquettes 3D par catégorie, en puces au-dessus de la vue

- Statut : Proposé
- Date : 2026-10-24
- Issue : #59

## Contexte

Chaque élément d'une pièce (`RoomItemConfigType`) affiche une étiquette HTML drei dans la vue 3D : 26 boutons sur 19 étiquettes pour la démo, bien plus sur l'appartement. Le propriétaire veut n'en afficher que certaines. D'autres branches ajoutent des types (prises, médias, imprimante, bandeaux LED, appareils sur pile, détecteur de fumée) : le filtre ne doit pas changer à chaque nouveau type.

Contraintes :

- La tablette (1280 × 800) se pilote au doigt, et la vue 3D occupe environ 880 px de large.
- Le dock de la barre latérale est caché et ne s'ouvre que par un glissement : un réglage qui sert plusieurs fois par jour n'y a pas sa place.
- `frameloop="demand"` ([ADR 0002](0002-rendu-3d-a-la-demande.md)) : masquer une étiquette ne doit lancer ni rendu continu ni recompilation de shader.
- Les étiquettes drei se placent par `transform` : elles ne coûtent pas de layout, mais un recalcul de style et un `useFrame` par image en mouvement.

## Décision

**Une rangée de puces à icônes, en surimpression en haut et au centre de la vue 3D** (`LabelFilter`). Une puce par catégorie présente dans la maison, 44 × 44 px, icône ambre quand la catégorie est affichée et grise quand elle est masquée. Le nom de la catégorie s'affiche dans une infobulle au toucher (`enterTouchDelay: 0` du thème) et sert de nom accessible.

**Une table, seul endroit à compléter** : `labelCategories` dans `src/utils/labelCategories.ts` associe chaque catégorie (identifiant, libellé, icône) à ses types d'items. Plusieurs types partagent une catégorie : `climate` et `temperature` forment « Climat ». Un type absent de la table n'a pas de puce et reste toujours affiché. Ajouter un type revient à ajouter une ligne :

```ts
{id: 'plug', label: 'Prises', icon: PowerIcon, types: ['plug']},
```

ou à compléter les `types` d'une catégorie existante (`types: ['light', 'ledStrip']`).

**Le filtre est une option d'affichage** : `hiddenCategories` rejoint `ConfigurationOptions` dans `AppContext`, donc le même stockage par appareil (`graphics-options`) que les options graphiques. On mémorise les catégories **masquées** : une catégorie ajoutée plus tard s'affiche d'office.

**Les étiquettes de pièce se filtrent aussi.** L'étiquette d'une pièce n'a pas de nom propre : c'est le groupe de ses éléments `roomDisplay` (lumière, température). Chaque élément suit sa catégorie, et l'étiquette de la pièce est démontée quand il ne lui reste rien. Sans cela, la puce « Lumières » serait presque inutile : 12 des 13 lumières de la démo sont dans une étiquette de pièce.

**Seules les étiquettes disparaissent.** `Room3d` filtre la liste passée à `Room` (les étiquettes), pas celle de `RoomItem3d` : les lumières 3D restent pilotées par Home Assistant.

**Une étiquette masquée est démontée**, pas cachée par `display: none` : son `useFrame`, sa racine React et son DOM disparaissent.

## Conséquences

Mesures sur le build de production de la démo (Chrome avec GPU, Mac, 1280 × 800, DPR 2, CPU bridé ×4 pour le mouvement et les appuis) :

| Mesure                                  | Avant      | Après, tout affiché | Après, tout masqué |
| --------------------------------------- | ---------- | ------------------- | ------------------ |
| Draw calls par image au repos           | 46         | 46                  | 46                 |
| Programmes compilés pendant la rotation | 0          | 0                   | 0                  |
| Tâches longues pendant la rotation      | aucune     | aucune              | aucune             |
| Recalcul de style par image en rotation | 0,6–0,8 ms | 0,6–0,7 ms          | 0,1–0,2 ms         |
| Temps de tâche par image en rotation    | 3,1–3,8 ms | 2,7–2,9 ms          | 1,7–2,2 ms         |
| Nœuds DOM                               | 280        | 290                 | 105                |

Les colonnes « Avant » et « Après, tout affiché » ne diffèrent que par le bruit de mesure. Un appui sur une puce compile 0 programme, rend 1 ou 2 images, puis plus aucune. L'interaction dure de 24 à 56 ms (CPU ×4). Masquer ou réafficher les lumières ou le climat démonte ou remonte de 7 à 18 étiquettes : une tâche longue de 50 à 100 ms à CPU ×4, une seule fois, hors rotation. Pour les 6 volets, la tâche reste sous 50 ms.

- Le budget de l'[ADR 0009](0009-budget-performance-tablette.md) est respecté, et masquer des étiquettes allège chaque image en mouvement.
- Les puces occupent 148 × 52 px, à 16 px du haut de la vue 3D. Sur la démo, aucune étiquette n'y passe au repos.
- Une branche qui ajoute un type n'a qu'une ligne à écrire, et rien ne casse si elle l'oublie.
- Les clés des étiquettes d'une pièce sont des index : masquer une catégorie peut remonter les étiquettes voisines de la même pièce. Le coût est compris dans les mesures ci-dessus.
- En mode carte des températures, les puces des autres catégories restent visibles mais sans effet, puisque ce mode n'affiche déjà que le climat.
- `OptionRow` exclut `hiddenCategories`, qui n'est pas un interrupteur. La branche du mode veille fait de même pour `screensaverMinutes` : la fusion des deux donnera `Exclude<…, 'hiddenCategories' | 'screensaverMinutes'>`.

## Alternatives considérées

- **Puces avec icône et libellé** : plus lisibles, mais près de 100 px par puce. Avec les catégories annoncées (prises, médias, imprimante, appareils sur pile, fumée), la rangée occuperait toute la largeur de la vue 3D. L'infobulle donne le libellé au toucher.
- **Filtre dans le dock ou dans la modale Système** : caché derrière un glissement ou un menu, alors que le filtre sert souvent.
- **Colonne verticale sur le bord droit** : elle tient autant de catégories, mais elle empiète sur les pièces du bord droit de la démo. Le haut de la vue est vide.
- **Une puce par type** : « Climatisation » et « Thermomètre » affichent tous deux une température ; les séparer double les puces sans servir l'usage.
- **Mémoriser les catégories affichées** : chaque nouvelle catégorie serait masquée chez ceux qui ont déjà un filtre enregistré.
- **Contexte ou clé de stockage dédiés** : une quarantaine de lignes pour refaire ce que `AppContext` fait déjà pour les options d'affichage.
- **`display: none`** : réafficher serait instantané, mais chaque étiquette cachée garderait son `useFrame` et son DOM. Le démontage supprime ce coût par image et reste un simple rendu conditionnel.
- **Masquer aussi les lumières 3D** : refusé par l'issue, et retirer un `RoomItem3d` éteint sa lumière, ce qui recompile les shaders.
