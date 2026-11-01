# 0010 — Stratégie de tests unitaires, E2E et CI

- Statut : Proposé, en partie remplacé par [0040](0040-tests-plus-rapides.md)
- Date : 2026-10-24

## Contexte

Le dépôt n'avait aucun test. La seule vérification automatique était `lint.yml`, qui lançait `pnpm lint` à chaque push et échouait déjà (prettier et `react-hooks/static-components`).

Le cœur de l'application est une scène React Three Fiber, avec des patchs de shaders de three.js (`shadowSampling.ts`) qui peuvent casser sans bruit à la montée de version. Plusieurs points pèsent sur le choix des outils :

- Home Assistant est simulé par `VITE_MOCK_HOME_ASSISTANT=true`, et la config `demo` est publique ; la config `apartment` est un sous-module privé, absent de la CI.
- En dev, le double montage de `StrictMode` coupe la vue 3D au bout d'environ 2 s (corrigé sur une autre branche).
- `vite.config.ts` exécute `git rev-parse` et charge le plugin Sentry, qui uploade les sourcemaps dès que `SENTRY_AUTH_TOKEN` est défini.
- L'application envoie des données à Sentry (traces à 100 %) et à Matomo dès son chargement.
- Les scripts `pretest` / `posttest` hérités de `gts init` lançaient `tsc` avant et `gts lint` après chaque `npm test`.

## Décision

**Tests unitaires** : Vitest, avec Testing Library (`@testing-library/react` et `jest-dom`) sur jsdom.

- Les fichiers `*.test.ts(x)` sont colocalisés dans `src/`, à côté du code testé.
- La configuration est un `vitest.config.ts` qui fait `mergeConfig(viteConfig, …)`, plutôt qu'un bloc `test` dans `vite.config.ts`. `vite.config.ts` reste la configuration de build et de déploiement, inchangée, et les réglages propres aux tests (jsdom, fichier de setup, `server.deps.inline` pour `@hakit/core`) restent à part. Les tests héritent malgré tout des mêmes plugins et `define` que l'application, sans duplication.
- Seuls la logique pure et les petits composants d'affichage sont testés en unitaire. jsdom n'a pas de WebGL : les scènes R3F se testent en E2E.

**Tests E2E** : Playwright, sur Chromium uniquement, contre `vite build` puis `vite preview` sur le port 4317, avec le mock Home Assistant et la seule config `demo`.

- Chromium tourne avec `--use-angle=swiftshader --enable-unsafe-swiftshader` : le WebGL est rendu en logiciel, de la même façon en local et en CI, sans GPU.
- `window.__dashboardBenchmark`, exposé quand la scène est montée, sert de signal « scène prête ». Le rendu 3D est vérifié par le nombre de couleurs distinctes d'une capture du canvas, boutons des pièces masqués, plutôt que par une comparaison d'images.
- Une fixture commune intercepte Sentry et Matomo, et fait échouer le test sur toute erreur console hors d'une liste blanche courte et explicite. Elle contient aujourd'hui deux erreurs connues, corrigées ailleurs.
- Pas de `retries` : un test instable se corrige, il ne se masque pas. Un seul worker en CI.

**Scripts** : `test` (`vitest run`), `test:watch`, `test:e2e` (`playwright test`) et `typecheck` (`tsc --noEmit`). `tsconfig.json` couvre désormais `e2e/` et les fichiers de config. Les hooks `pretest` / `posttest` sont supprimés :

- ils relançaient `tsc` et `gts lint` autour de chaque `pnpm test`, alors que la CI les lance déjà comme étapes séparées : le travail était fait deux fois ;
- un échec de lint apparaissait comme un échec de tests ;
- ils ne s'appliquaient pas à `test:watch`.

`prepare` (`tsc` à l'installation) n'est pas modifié.

**CI** : un seul workflow, `ci.yml`, sur `push` et `pull_request`. Il contient un seul job qui enchaîne installation, `lint`, `typecheck`, `test`, installation de Chromium (`playwright install --with-deps chromium`) et `test:e2e`. Le rapport Playwright est publié en artefact en cas d'échec. Les sous-modules ne sont pas récupérés. `lint.yml` est supprimé, car son étape est reprise dans `ci.yml` : le garder aurait lancé le lint deux fois, avec une seconde installation. Un groupe `concurrency` annule les runs devenus obsolètes sur une même ref.

## Conséquences

- Chaque push et chaque pull request vérifient le lint, les types, la logique (heatmap, roue des couleurs, météo, affichage des distances) et le parcours principal du dashboard dans un vrai navigateur. Une montée de version de three qui casserait le patch des ombres fait échouer `pnpm test`.
- La suite E2E dure de 20 à 35 s en local, build compris. Sur un runner GitHub, SwiftShader est plusieurs fois plus lent : la suite y prend de 1 min 05 à 1 min 25, et le job complet environ 2 min 30 avec l'installation de Chromium. D'où des délais larges, 60 s par test et 15 s par assertion. Une option lourde comme « Debug » y rend la page inutilisable, et les tests l'évitent.
- Les E2E dépendent des données du mock et de la config `demo` (noms, températures, ordre des pièces). Modifier le mock peut demander d'adapter les tests.
- Plusieurs éléments n'ont pas de nom accessible : le bouton de fermeture des modales, les interrupteurs des options et le dock. Certains locators passent donc par la structure du DOM ; ajouter des `aria-label` les simplifierait.
- Le moteur WebGPU n'est pas couvert, car Chromium headless n'expose pas d'adaptateur. Le bug `StrictMode` du mode dev ne l'est pas non plus, puisque les E2E tournent sur le build.
- Vitest charge `vite.config.ts`, donc le plugin Sentry : sans jeton, il n'uploade rien, mais il envoie sa télémétrie anonyme, comme `vite dev` et `vite build`.
- `pnpm build` (`tsc && vite build`) vérifie aussi les types des tests.
- Une branche qui a une pull request ouverte déclenche deux runs, un pour `push` et un pour `pull_request`.

## Alternatives considérées

- **Bloc `test` dans `vite.config.ts`** : un fichier de moins, mais la configuration de déploiement se mêle à celle des tests, et `vite.config.ts` (sans lint, avec `/* eslint-disable */`) devient le point de passage de tous les réglages.
- **`vitest.config.ts` indépendant, sans `vite.config.ts`** : il éviterait Sentry et `git rev-parse` dans les tests, mais dupliquerait plugins et `define`, au risque de diverger du build.
- **happy-dom** : plus rapide, mais moins complet que jsdom, qui reste la référence de Testing Library. Le gain est nul sur une suite aussi courte.
- **E2E sur `vite dev`** : ce n'est pas ce qui est déployé, et la vue 3D y meurt aujourd'hui au bout de 2 s.
- **Comparaison de captures (`toHaveScreenshot`)** : les références dépendent du système (macOS en local, Linux en CI) et demandent de l'entretien à chaque changement visuel. Le comptage de couleurs suffit pour vérifier que la scène est rendue.
- **Firefox et WebKit en plus de Chromium** : la CI serait trois fois plus longue et le rendu WebGL logiciel y est moins prévisible. Chromium suffit comme premier filet.
- **Garder `lint.yml` à côté de `ci.yml`** : retour un peu plus rapide sur le lint, au prix d'une installation et d'un lint en double.
- **`retries` en CI** : des runs verts plus souvent, mais l'instabilité serait masquée au lieu d'être corrigée.
