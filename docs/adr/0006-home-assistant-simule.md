# 0006 — Home Assistant simulé pour le développement, la démo et les tests

- Statut : Accepté
- Date : 2026-10-24 (décision antérieure, consignée a posteriori)

## Contexte

Le dashboard dépend d'une instance Home Assistant (WebSocket, services, historique, météo). Développer sans maison, publier une démo publique ou lancer des tests en CI est impossible avec une vraie instance.

## Décision

Avec `VITE_MOCK_HOME_ASSISTANT=true`, `app.tsx` charge `src/mock/HassConnectMock.tsx` à la place du `HassConnect` de `@hakit/core`. Le mock fournit des entités (`src/mock/mocks/`), des services qui modifient ces entités, de l'historique et des prévisions météo. Les hooks `useEntity` et `useEntities` fonctionnent sans modification.

## Conséquences

- Les tests E2E et la démo s'appuient sur le même faux Home Assistant.
- Toute nouvelle entité utilisée par l'interface doit exister dans le mock, sinon la démo et les tests ne la voient pas.
- Le mock suit l'API interne de `@hakit/core` : une montée de version majeure peut le casser.

## Alternatives considérées

- **Instance Home Assistant en conteneur pour la CI** : lourde, lente, et l'état est difficile à rendre déterministe.
- **Intercepter le WebSocket** : il faudrait réimplémenter le protocole Home Assistant.
