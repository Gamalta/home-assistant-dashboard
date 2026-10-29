# 0040 — Tests plus rapides : CI en parallèle, scénarios de modale en unitaire

- Statut : Proposé
- Date : 2026-10-25

## Contexte

Mesures du 25 octobre 2026 :

- Un run de CI dure environ 11 min, dont 8,5 à 10,5 min d'E2E. Lint, typecheck et tests unitaires prennent moins de 30 s.
- `playwright install --with-deps chromium` prend 25 s en général, mais a pris 10 min 22 s puis 5 min 2 s le même jour : le miroir apt livrait les dépendances système à 41,7 kB/s.
- Chaque test E2E recharge la page et attend la scène 3D, rendue en logiciel par SwiftShader : 9 à 14 s par test sur un Mac au repos, environ 14 s en moyenne en CI (38 tests, 1 worker). Ce chargement fait l'essentiel du temps, quel que soit le scénario testé.
- Six scénarios E2E ne dépendaient que d'un composant de pièce et de sa modale : la lumière et la vitesse, la pause et l'arrêt de l'imprimante ; l'appui court, l'illustration et l'onglet Consommation de la prise. Or le mock Home Assistant (`HassConnect` de `src/mock/HassConnectMock.tsx`) tourne dans jsdom et fait évoluer les états comme dans le navigateur.
- Vitest recréait jsdom pour chacun des 20 fichiers : 59 % de la durée des tests unitaires.
- `push` et `pull_request` lancent deux runs identiques à chaque push sur une branche qui a une pull request ([ADR 0010](0010-strategie-de-tests.md)).
- En local, Playwright prend 5 workers. Deux suites E2E lancées en même temps, depuis deux worktrees, saturent la machine (charge de 22 à 36 sur 10 cœurs) : 7 tests ont échoué par dépassement de délai.

## Décision

**Un scénario de spec qui ne dépend que d'un composant et de sa modale se teste en unitaire**, sur le mock Home Assistant. Restent en E2E les scénarios qui passent par la scène 3D, le rendu, la mise en page, une animation ou un vrai pointeur, et pour chaque élément de pièce celui qui ouvre sa modale depuis la scène. Cette règle remplace « un test E2E par scénario visible » des ADR [0008](0008-specs-et-definition-de-termine.md) et [0010](0010-strategie-de-tests.md).

**La CI tourne en parallèle** :

- un job `check` (lint, typecheck, unitaires) et un job `e2e` sur 4 runners : un pour `e2e/shadows.spec.ts`, et 3 shards (`--shard=n/3`) pour les autres tests ;
- `fullyParallel: true` répartit les tests, et non les fichiers, entre les shards. Playwright découpe en tranches contiguës d'un même nombre de tests, sans tenir compte de leur durée : en CI, les deux tests d'ombres, voisins, durent autant qu'un shard entier, et le shard qui les portait mettait 210 s contre 95 s pour les autres ;
- le job `e2e` tourne dans l'image `mcr.microsoft.com/playwright`, qui contient Chromium et ses dépendances, à la même version que `@playwright/test` ;
- `push` ne lance la CI que sur `dev` et `master`. Les autres branches sont vérifiées par leur pull request.

**Vitest utilise `pool: 'vmThreads'`** : un jsdom par worker, chaque fichier gardant ses propres modules.

Le nombre de workers en local ne change pas.

## Conséquences

- Unitaires, sur un Mac au repos : 4,7 s → 2,2 s pour les mêmes 110 tests, puis 4,0 s avec les 6 scénarios venus de l'E2E. Ces tests chargent tout le mock et attendent l'ouverture de la modale (0,55 s) : 0,1 à 1 s chacun, contre 20 à 60 s en E2E.
- E2E en local : 2,7 min pour 38 tests → 1,9 min pour 32 tests.
- En CI, un run vert dure 3 min 18 s, contre 13 min 54 s pour le dernier run vert de l'ancienne CI, dont 5 min d'installation de Chromium. Les tests E2E de chaque job durent de 92 à 126 s ; avec les ombres dans le shard 2, ce shard en mettait 210 et le run 4 min 45 à 5 min 11. Il faut 5 runners au lieu d'un, gratuits sur un dépôt public, et chaque job E2E démarre l'image (25 à 40 s) et refait l'installation (10 à 20 s).
- Le mock garde son état en mémoire : chaque test unitaire qui l'utilise repart des entités initiales (`useHass.setState({entities})`).
- jsdom ne calcule ni couleurs, ni positions, ni animations : un scénario qui en dépend reste en E2E.
- Monter Playwright demande de changer aussi le tag de l'image dans `ci.yml` : sinon le navigateur attendu n'est pas dans l'image et les E2E échouent au lancement.
- Une branche sans pull request n'a plus de CI. On ouvre une PR, en brouillon au besoin.
- Un échec E2E publie le rapport de son job (`playwright-report-<n>`).
- Une seule suite E2E à la fois sur une machine : en parallèle, les tests se disputent le processeur et dépassent leurs délais.

## Alternatives considérées

- **4 shards, sans job pour les ombres** : les deux tests d'ombres resteraient dans la même tranche.
- **Poids des shards** (`PWTEST_SHARD_WEIGHTS`) : une variable interne de Playwright, non documentée.
- **Plusieurs workers sur un seul runner CI** : un Chromium SwiftShader occupe déjà 3 à 4 cœurs, et un runner public en a 4.
- **Cache des navigateurs et `--only-shell`** : l'étape apt de `--with-deps`, responsable des 10 min, resterait.
- **Une page partagée par fichier** (`mode: 'serial'`) : un chargement de scène par fichier, mais chaque test dépendrait de l'état laissé par le précédent (lumière allumée, impression arrêtée), et un échec ferait tomber les suivants.
- **Moins de workers en local** : 3,3 min avec 3 workers contre 2,7 min avec 5, machine libre.
- **`isolate: false` pour Vitest** : un peu plus lent que `vmThreads` (7,2 s contre 5,6 s, mesurés sous charge) et les fichiers partageraient leurs modules, dont l'état du mock.
- **Environnement `node` pour les tests sans DOM** : `vitest.setup.ts` charge quand même Testing Library, et deux fichiers échouent sans jsdom.
- **Rapport Playwright fusionné** (`blob` puis `merge-reports`) : un job de plus pour un rapport qui ne sert qu'en cas d'échec.
