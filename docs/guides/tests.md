# Tests

Deux niveaux de tests, choisis dans l'[ADR 0010](../adr/0010-strategie-de-tests.md) :

| Type      | Outil                                    | Emplacement                              | Commande        |
| --------- | ---------------------------------------- | ---------------------------------------- | --------------- |
| Unitaires | Vitest, Testing Library, jsdom           | `src/`, `scripts/`, à côté du code testé | `pnpm test`     |
| E2E       | Playwright (Chromium, WebGL SwiftShader) | `e2e/*.spec.ts`                          | `pnpm test:e2e` |

La CI (`.github/workflows/ci.yml`) tourne sur chaque pull request et à chaque push sur `dev` et `master`. Deux jobs y tournent en parallèle ([ADR 0040](../adr/0040-tests-plus-rapides.md)) : `check` lance `pnpm lint`, `pnpm typecheck` et `pnpm test`, et `e2e` lance `pnpm test:e2e` sur 4 runners : `e2e/shadows.spec.ts` a le sien, car ses deux tests durent autant qu'un shard entier, et les autres tests se partagent les 3 restants (`--shard=n/3`). Le job `e2e` tourne dans l'image Docker de Playwright, qui contient déjà Chromium : en montant `@playwright/test`, changer aussi le tag de l'image dans `ci.yml`.

## Lancer les tests

```sh
pnpm test                 # tests unitaires, une fois
pnpm test:watch           # tests unitaires relancés à chaque modification
pnpm test src/utils       # seulement les fichiers dont le chemin contient src/utils
pnpm typecheck            # tsc --noEmit (src, e2e et fichiers de config)
pnpm lint                 # gts lint

pnpm exec playwright install chromium   # une seule fois, avant le premier E2E
pnpm test:e2e                           # build + preview + serveur de dev + tests E2E
pnpm test:e2e e2e/scene.spec.ts         # un seul fichier
pnpm test:e2e -g "modale"               # les tests dont le titre contient « modale »
```

`pnpm test:e2e` builde l'application (`vite build`) puis la sert avec `vite preview` sur le port **4317**, avec Home Assistant simulé (`VITE_MOCK_HOME_ASSISTANT=true`), la seule config `demo` (`VITE_HOUSE_CONFIGS='["demo"]'`) et `SENTRY_AUTH_TOKEN` vide pour ne rien uploader. Ces variables sont fixées dans `playwright.config.ts` et priment sur le fichier `.env`.

Les E2E tournent sur le build, car c'est lui qui est déployé. Seul `e2e/dev.spec.ts` (projet Playwright `dev`) tourne sur le serveur de dev (`vite`), lancé sur le port **4318** avec les mêmes variables : il vérifie que la vue 3D survit au double montage de `StrictMode`, qui n'a lieu qu'en dev ([ADR 0013](../adr/0013-react-three-fiber-9-8.md)). Ce projet sert aussi de filet pour les avertissements que React n'affiche qu'en dev.

## Écrire un test unitaire

- Un fichier `Nom.test.ts` (ou `.tsx`) à côté de `Nom.ts`. Vitest ne cherche que dans `src/` et `scripts/`.
- Importer explicitement `describe`, `it`, `expect` et `vi` depuis `vitest` (pas de globales).
- Titres en français, qui décrivent le comportement attendu : `it('borne la saturation au bord de la roue')`.
- Composants : `render` et `screen` de `@testing-library/react`, en cherchant par rôle, texte ou libellé (`getByRole`, `getByText`, `getByLabelText`). Les matchers de `@testing-library/jest-dom` (`toBeInTheDocument`…) sont chargés par `vitest.setup.ts`. N'ajouter le `ThemeProvider` MUI que si le composant lit le thème de l'application.
- Les espions `vi.spyOn` sont restaurés automatiquement après chaque test (`restoreMocks`). Penser à `vi.useRealTimers()` après `vi.useFakeTimers()`.
- Pas de scène React Three Fiber en unitaire : jsdom n'a pas de WebGL. La 3D se teste en E2E, la logique qu'elle utilise (shaders, calculs) en unitaire.
- Un élément de pièce et sa modale se testent sur le mock Home Assistant, qui fait évoluer les états comme dans le navigateur : `render(<HassConnect hassUrl="">…</HassConnect>)` (`src/mock/HassConnectMock.tsx`), comme dans `RoomPrinter3d.test.tsx`. Le mock garde son état d'un test à l'autre : `beforeEach(() => useHass.setState({entities}))`. Le contenu d'une modale n'apparaît qu'à la fin de son animation d'ouverture : l'attendre avec `findBy…`.
- L'option `name` de `getByRole` ne normalise pas les espaces insécables, contrairement à Playwright : « 85 W » se cherche avec `/^85\sW$/`.
- Tester un comportement ou une règle qui peut casser, pas recopier l'implémentation.

## Écrire un test E2E

- Un fichier `e2e/<sujet>.spec.ts`, seulement pour ce qui passe par la scène 3D, le rendu, la mise en page, une animation ou un vrai pointeur : chaque test recharge la scène, soit une dizaine de secondes en local et davantage en CI. Ce qui ne dépend que d'un composant et de sa modale se teste en unitaire ([ADR 0040](../adr/0040-tests-plus-rapides.md)).
- Les tests d'un même fichier tournent en parallèle (`fullyParallel`) : un test ne dépend jamais d'un autre.
- Importer `test` et `expect` depuis `./fixtures`, pas depuis `@playwright/test`. Ces fixtures :
  - interceptent Sentry et Matomo, pour ne pas polluer leurs données ;
  - font échouer le test sur toute erreur console ou exception non rattrapée. Une erreur se corrige, elle ne se masque pas : seul un avertissement sans effet visible peut être toléré, par le test qui le déclare dans `consoleErrorsAllowed` avec sa raison (voir `e2e/dev.spec.ts`).
- `waitForScene(page)` attend que la scène 3D soit montée et ses shaders compilés (`window.__dashboardBenchmark` défini, retiré pendant la compilation qui suit un changement d'option). L'appeler avant d'interagir avec la scène ou d'ouvrir une modale : tant que la scène charge, la page est trop occupée et les animations prennent du retard.
- Locators par rôle ou par texte. Quand l'élément n'a pas de nom accessible (bouton de fermeture des modales, interrupteurs des options), passer par un voisin nommé et l'expliquer en commentaire.
- Les données viennent du mock (`src/mock/mocks/mockEntities.ts`) et de la config `src/configs/demo/House.ts` : un changement de mock peut demander d'adapter un test.
- Pour simuler un événement (détecteur qui se déclenche, tablette débranchée), changer l'état d'une entité du mock depuis la page : `await page.evaluate(() => window.__mockSetState?.('binary_sensor.x', 'on'))`.
- Un élément qui vient d'apparaître avec une animation framer-motion peut bouger après le clic : attendre la fin de l'animation (par exemple `toHaveCSS('opacity', '1')`) avant de cliquer.
- En CI, le rendu logiciel est plusieurs fois plus lent qu'en local. Éviter d'activer les options graphiques lourdes (« Debug », ombres) : la page y devient trop lente pour être pilotée. Seuls `e2e/shadows.spec.ts` et un test de `e2e/budget.spec.ts` activent les ombres. `e2e/shadows.spec.ts` le fait dans une fenêtre de 640 × 360, avec `test.slow()`, et il attend le repos en comptant les images sans rendu plutôt qu'en mesurant une durée.
- Pour vérifier une animation image par image, le rendu logiciel saute trop d'images : piloter l'horloge (`page.clock.install()` avant `goto`, puis `pauseAt` et `runFor(16)` entre deux mesures), comme le test d'ouverture de `e2e/light-shutter-modals.spec.ts`.
- Les tests de budget (`e2e/budget.spec.ts`) mesurent avec `scripts/bench/measure.ts`, comme `pnpm bench`. Ils ne vérifient que des comptes, jamais une durée ([ADR 0029](../adr/0029-budget-performance-automatise.md)).

## Déboguer un E2E

- `pnpm test:e2e --ui` : interface de Playwright, pour rejouer un test pas à pas et inspecter le DOM.
- `pnpm test:e2e --headed` : voir le navigateur ; `--debug` met en pause avant chaque action.
- Après un échec, la trace est gardée dans `test-results/` : `pnpm exec playwright show-trace test-results/<test>/trace.zip` (DOM, réseau, console et captures à chaque étape).
- `pnpm exec playwright show-report` ouvre le rapport HTML du dernier lancement (`playwright-report/`).
- En CI, chaque job E2E qui échoue publie son rapport comme artefact `playwright-report-<n>`, numéroté à partir de 0 dans l'ordre de la matrice : le télécharger depuis la page du run, le décompresser, puis `pnpm exec playwright show-report <dossier>`. Les arguments du job, par exemple `pnpm test:e2e --shard=2/3 --grep-invert shadows.spec`, rejouent les mêmes tests en local.
- En local, un serveur déjà lancé sur le port 4317 (ou 4318) est réutilisé tel quel : s'il sert un ancien build, l'arrêter avant de relancer les tests. Pour lancer deux suites en parallèle (deux worktrees, par exemple), donner à chacune son port : `E2E_PORT=4330 pnpm test:e2e` sert le build sur 4330 et le dev sur 4331. Mieux vaut pourtant une seule suite à la fois : deux suites se disputent le processeur, et les tests dépassent leurs délais. Sinon, réduire les workers de chacune (`--workers=2`).
- Pour regarder l'application telle que les E2E la voient :

  ```sh
  VITE_MOCK_HOME_ASSISTANT=true VITE_HOUSE_CONFIGS='["demo"]' SENTRY_AUTH_TOKEN= pnpm exec vite build
  pnpm exec vite preview --port 4317
  ```
