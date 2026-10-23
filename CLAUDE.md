# Dashboard Home Assistant 3D

Lire `docs/conventions.md` avant toute modification, et `docs/adr/README.md` avant de toucher à la scène 3D.

- Code « ponytail » : simple, diff minimal, peu de commentaires (en français), 1 composant par fichier.
- Branches depuis `feat/three-js`, commits conventionnels en français, identité git locale `Elio-Swello <elio@swello.com>`.
- Chaque fonctionnalité livre spec, ADR si décision, doc, tests unitaires et E2E (ADR 0008).
- Mesurer le rendu sur le build de production, jamais en `pnpm dev` (guide `docs/guides/performance.md`).
