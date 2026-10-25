# 0023 — Listes `todo` par abonnement WebSocket

- Statut : Proposé
- Date : 2026-10-24
- Issue : #21

## Contexte

@hakit/core ne connaît pas le domaine `todo` : il n'a ni hook, ni type d'entité, ni service typé. L'état d'une entité `todo` donne seulement le nombre d'articles à faire. Retirer les articles cochés ne change pas cet état, donc écouter l'entité ne suffit pas pour savoir quand relire la liste.

## Décision

Le hook `useTodoList` s'abonne à `todo/item/subscribe`, comme le frontend de Home Assistant. Home Assistant pousse la liste complète à chaque changement, quelle que soit son origine. Les actions appellent les services `todo.add_item`, `todo.update_item` et `todo.remove_completed_items` via `callService` de home-assistant-js-websocket, qui accepte tous les domaines.

## Conséquences

- La modale est à jour en temps réel, sans relecture ni minuteur.
- La modale reste montée, fermée, tant que la liste est configurée, et son abonnement reste ouvert : c'est négligeable pour une liste de courses.
- Le mock doit simuler cet abonnement et ces services (`src/mock/mocks/mockTodo.ts`).
- Le jour où @hakit prendra en charge `todo`, le hook pourra être remplacé sans toucher aux composants.

## Alternatives considérées

- **`todo.get_items` avec réponse, relu à chaque changement de l'entité** : la liste reste fausse après le retrait des articles cochés, puisque l'état ne change pas.
- **Relecture après chaque action** : un service sans réponse ne dit pas quand il a fini, il faudrait un minuteur.
