# Tests

Deux niveaux de tests, choisis dans l'[ADR 0010](../adr/0010-strategie-de-tests.md) :

| Type      | Outil                                    | Emplacement                              | Commande        |
| --------- | ---------------------------------------- | ---------------------------------------- | --------------- |
| Unitaires | Vitest, Testing Library, jsdom           | `src/`, `scripts/`, à côté du code testé | `pnpm test`     |
| E2E       | Playwright (Chromium, WebGL SwiftShader) | `e2e/*.spec.ts`                          | `pnpm test:e2e` |

La CI (`.github/workflows/ci.yml`) lance, dans l'ordre, `pnpm lint`, `pnpm typecheck`, `pnpm test` et `pnpm test:e2e`, à chaque push et sur chaque pull request.

## Lancer les tests

```sh
pnpm test                 # tests unitaires, une fois
pnpm test:watch           # tests unitaires relancés à chaque modification
pnpm test src/utils       # seulement les fichiers dont le chemin contient src/utils
pnpm typecheck            # tsc --noEmit (src, e2e et fichiers de config)
pnpm lint                 # gts lint

pnpm exec playwright install chromium   # une seule fois, avant le premier E2E
pnpm test:e2e                           # build + preview + tests E2E
pnpm test:e2e e2e/scene.spec.ts         # un seul fichier
pnpm test:e2e -g "modale"               # les tests dont le titre contient « modale »
```

`pnpm test:e2e` builde l'application (`vite build`) puis la sert avec `vite preview` sur le port **4317**, avec Home Assistant simulé (`VITE_MOCK_HOME_ASSISTANT=true`), la seule config `demo` (`VITE_HOUSE_CONFIGS='["demo"]'`) et `SENTRY_AUTH_TOKEN` vide pour ne rien uploader. Ces variables sont fixées dans `playwright.config.ts` et priment sur le fichier `.env`.

Les E2E ne tournent pas sur `vite dev` : c'est le build qui est déployé, et en dev le double montage de `StrictMode` coupe aujourd'hui la vue 3D au bout de 2 s environ.

## Écrire un test unitaire

- Un fichier `Nom.test.ts` (ou `.tsx`) à côté de `Nom.ts`. Vitest ne cherche que dans `src/` et `scripts/`.
- Importer explicitement `describe`, `it`, `expect` et `vi` depuis `vitest` (pas de globales).
- Titres en français, qui décrivent le comportement attendu : `it('borne la saturation au bord de la roue')`.
- Composants : `render` et `screen` de `@testing-library/react`, en cherchant par rôle, texte ou libellé (`getByRole`, `getByText`, `getByLabelText`). Les matchers de `@testing-library/jest-dom` (`toBeInTheDocument`…) sont chargés par `vitest.setup.ts`. N'ajouter le `ThemeProvider` MUI que si le composant lit le thème de l'application.
- Les espions `vi.spyOn` sont restaurés automatiquement après chaque test (`restoreMocks`). Penser à `vi.useRealTimers()` après `vi.useFakeTimers()`.
- Pas de scène React Three Fiber en unitaire : jsdom n'a pas de WebGL. La 3D se teste en E2E, la logique qu'elle utilise (shaders, calculs) en unitaire.
- Tester un comportement ou une règle qui peut casser, pas recopier l'implémentation.

## Écrire un test E2E

- Un fichier `e2e/<sujet>.spec.ts`.
- Importer `test` et `expect` depuis `./fixtures`, pas depuis `@playwright/test`. Ces fixtures :
  - interceptent Sentry et Matomo, pour ne pas polluer leurs données ;
  - font échouer le test sur toute erreur console ou exception non rattrapée, sauf celles de `KNOWN_ERRORS`. Cette liste doit rester courte : retirer une entrée dès que l'erreur est corrigée.
- `waitForScene(page)` attend que la scène 3D soit montée (`window.__dashboardBenchmark` défini). L'appeler avant d'interagir avec la scène ou d'ouvrir une modale : tant que la scène charge, la page est trop occupée et les animations prennent du retard.
- Locators par rôle ou par texte. Quand l'élément n'a pas de nom accessible (bouton de fermeture des modales, interrupteurs des options), passer par un voisin nommé et l'expliquer en commentaire.
- Les données viennent du mock (`src/mock/mocks/mockEntities.ts`) et de la config `src/configs/demo/House.ts` : un changement de mock peut demander d'adapter un test.
- Un élément qui vient d'apparaître avec une animation framer-motion peut bouger après le clic : attendre la fin de l'animation (par exemple `toHaveCSS('opacity', '1')`) avant de cliquer.
- En CI, le rendu logiciel est plusieurs fois plus lent qu'en local. Éviter d'activer les options graphiques lourdes (« Debug », ombres, reflets) : la page y devient trop lente pour être pilotée.
- Les tests de budget (`e2e/budget.spec.ts`) mesurent avec `scripts/bench/measure.ts`, comme `pnpm bench`. Ils ne vérifient que des comptes, jamais une durée ([ADR 0029](../adr/0029-budget-performance-automatise.md)).

## Déboguer un E2E

- `pnpm test:e2e --ui` : interface de Playwright, pour rejouer un test pas à pas et inspecter le DOM.
- `pnpm test:e2e --headed` : voir le navigateur ; `--debug` met en pause avant chaque action.
- Après un échec, la trace est gardée dans `test-results/` : `pnpm exec playwright show-trace test-results/<test>/trace.zip` (DOM, réseau, console et captures à chaque étape).
- `pnpm exec playwright show-report` ouvre le rapport HTML du dernier lancement (`playwright-report/`).
- En CI, le rapport est publié comme artefact `playwright-report` quand le job échoue : le télécharger depuis la page du run, le décompresser, puis `pnpm exec playwright show-report <dossier>`.
- En local, un serveur déjà lancé sur le port 4317 est réutilisé tel quel : s'il sert un ancien build, l'arrêter avant de relancer les tests. Pour lancer deux suites en parallèle (deux worktrees, par exemple), donner à chacune son port : `E2E_PORT=4330 pnpm test:e2e`.
- Pour regarder l'application telle que les E2E la voient :

  ```sh
  VITE_MOCK_HOME_ASSISTANT=true VITE_HOUSE_CONFIGS='["demo"]' SENTRY_AUTH_TOKEN= pnpm exec vite build
  pnpm exec vite preview --port 4317
  ```
