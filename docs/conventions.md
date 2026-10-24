# Conventions

Les règles qui suivent s'appliquent à tout le code et à toute la documentation du dépôt. Elles reprennent les retours de revue du propriétaire. Une règle discutable se discute dans une issue ou un ADR, pas en la contournant.

## Principe : « ponytail »

Un fichier simple et compréhensible vaut mieux qu'un fichier malin.

- **Diff minimal.** Chaque ligne ajoutée doit pouvoir être défendue en revue. Ce qui n'est pas indispensable est supprimé.
- **Pas de sur-ingénierie.** Pas d'abstraction pour un seul usage, pas d'option sans besoin réel, pas de code « au cas où ».
- **Peu de commentaires.** Le code se lit seul. Un commentaire explique un _pourquoi_ non évident (contrainte GPU, bug d'une bibliothèque), jamais un _quoi_.
- **Le français** pour les commentaires, les messages de commit, la documentation et les textes d'interface. L'anglais pour les identifiants.

## Arborescence

| Dossier                 | Contenu                                                                | Interdit                              |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| `src/components/`       | Composants React uniquement                                            | hooks, utilitaires, code three.js pur |
| `src/hooks/`            | Hooks réutilisables (`useXxx.ts`)                                      | composants                            |
| `src/contexts/`         | Un contexte par fichier, avec son provider et son hook `useXxxContext` | logique métier lourde                 |
| `src/rendering/`        | three.js hors React : backends, shaders, matériaux                     | JSX                                   |
| `src/utils/`            | Fonctions pures                                                        | état, effets                          |
| `src/configs/<maison>/` | `House.ts` et le modèle `.glb` de la maison                            | code applicatif                       |
| `docs/`                 | Documentation, ADR, specs                                              | —                                     |
| `e2e/`                  | Tests Playwright                                                       | —                                     |

## React

- **Un composant par fichier.** Le fichier porte le nom du composant (`RoomLight.tsx`). Un dossier avec un `index.tsx` regroupe un composant et ses sous-composants privés, chacun dans son propre fichier.
- Composants en `function Nom(props: NomProps)`, avec les props déstructurées dans le corps (`const {a, b} = props;`), comme dans le code existant. Export nommé, sauf pour les points d'entrée existants (`App`, `Dashboard`, `House`).
- Le type des props s'appelle `NomProps` et se déclare juste au-dessus du composant.
- Règles des hooks respectées. Un effet ne sert qu'à synchroniser avec l'extérieur (three.js, DOM, timers, stockage) : une valeur calculable pendant le rendu ne passe pas par un effet.
- Pas de `useMemo` ni de `useCallback` par réflexe. On les réserve aux objets three.js coûteux et aux identités qui doivent rester stables.
- Les styles passent par le `sx` de MUI et les tokens du thème (`background.paper`, `theme.spacing`). Pas de CSS global en dehors de `index.css`.
- Les textes d'interface sont en français et écrits en dur : pas d'i18n tant qu'il n'y a qu'une langue.

## Scène 3D

- `frameloop="demand"` : tout changement visuel appelle `invalidate()`. Une boucle `useFrame` qui anime doit s'arrêter d'elle-même (voir [ADR 0002](adr/0002-rendu-3d-a-la-demande.md)).
- `SceneMaterials` est le **seul** composant qui modifie les matériaux du modèle (voir [ADR 0004](adr/0004-scenematerials-proprietaire-unique.md)).
- Un objet three.js créé par un composant est libéré (`dispose`) dans le nettoyage de son effet.
- Changer les `defines` d'un matériau, le nombre de lumières visibles ou le nombre de lumières qui projettent une ombre recompile les shaders. On l'évite pendant une interaction : on préfère un uniform.
- Chaque entité lumière pilote la **première** lumière du modèle dont le nom commence par l'identifiant de l'entité, sans le domaine.
- Le code propre à WebGL ou à WebGPU vit dans `src/rendering/backends/` et `src/rendering/shaders/<Matériau>/{WebGL,WebGPU}/`, derrière l'interface `RenderBackend`.
- Toute modification du rendu se mesure ([guide performance](guides/performance.md)) et respecte le [budget tablette](adr/0009-budget-performance-tablette.md). Joindre la sortie de `pnpm bench --compare` à toute PR qui touche au rendu.

## TypeScript

- `strict`, sans `any`. Un `as` se justifie par une limite de typage d'une bibliothèque.
- `type` plutôt qu'`interface`, sauf pour augmenter un type global.
- Imports nommés, chemins relatifs. Imports de type avec `import type` quand l'import ne sert qu'aux types.
- Formatage par prettier et lint par gts (`pnpm lint`, `pnpm fix`). Une désactivation de règle porte sa raison sur la même ligne.

## Tests

Le détail se trouve dans le [guide des tests](guides/tests.md) et l'[ADR 0010](adr/0010-strategie-de-tests.md).

- Les tests **unitaires** (Vitest) sont colocalisés : `color.ts` → `color.test.ts`. Ils sont obligatoires pour toute logique pure ajoutée ou modifiée.
- Les tests **E2E** (Playwright, dossier `e2e/`) sont obligatoires pour tout comportement visible par l'utilisateur. Ils tournent sur le build de production, avec le mock et la maison `demo`.
- Un test décrit un comportement, en français : `it('borne l’écart de température à 1 °C')`.

## Git et GitHub

- **Branches** : `<type>/<sujet-en-kebab>`, avec `type` parmi `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `chore`, `ci`. Une branche porte un seul sujet et part de `feat/three-js` tant que celle-ci n'est pas fusionnée dans `dev`.
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/fr/) en français (`perf: fusionner les meshes du modèle`). Des commits petits et logiques, chacun qui compile.
- **Identité** : `Gamalta <eliovital@icloud.com>` en config git locale, jamais `--global`.
- **Issue → branche → PR.** Chaque branche a son issue. La PR la ferme (`Closes #n`) et suit le [modèle de PR](../.github/pull_request_template.md).

## Définition de « terminé »

Une fonctionnalité est terminée quand :

1. son issue décrit le besoin ;
2. sa [spec](specs/README.md) décrit le comportement attendu, et chaque scénario est couvert par un test ;
3. un [ADR](adr/README.md) consigne chaque décision structurante (nouvelle dépendance, nouveau motif, compromis de performance) ;
4. la documentation est à jour (guide utilisateur ou développeur, README si besoin) ;
5. les tests unitaires et E2E sont écrits et `pnpm lint`, `pnpm typecheck`, `pnpm test` et `pnpm test:e2e` passent ;
6. l'impact sur le rendu est mesuré si la scène 3D est touchée ;
7. la PR est relue et ne contient rien d'indispensable en moins, ni rien d'inutile en plus.
