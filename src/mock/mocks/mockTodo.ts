import type {TodoItem} from '../../hooks/useTodoList';

type Listener = (message: {items: TodoItem[]}) => void;

let nextUid = 1;
const item = (summary: string, completed = false): TodoItem => ({
  uid: String(nextUid++),
  summary,
  status: completed ? 'completed' : 'needs_action',
});

const lists: Record<string, TodoItem[]> = {
  'todo.shopping_list': [
    item('Lait'),
    item('Pain'),
    item('Pommes'),
    item('Café', true),
  ],
};
const listeners: Record<string, Listener[]> = {};

const notify = (entityId: string) =>
  (listeners[entityId] ?? []).forEach(listener =>
    listener({items: lists[entityId] ?? []}),
  );

/** Simule `todo/item/subscribe` : envoie la liste, puis chaque changement. */
export function subscribeTodo(entityId: string, listener: Listener) {
  listeners[entityId] = [...(listeners[entityId] ?? []), listener];
  listener({items: lists[entityId] ?? []});
  return () => {
    listeners[entityId] = listeners[entityId].filter(l => l !== listener);
  };
}

/** Simule les services `todo.*` utilisés par le dashboard. */
export function callTodoService(
  entityId: string,
  service: string,
  data: {item?: string; status?: TodoItem['status']},
) {
  const list = lists[entityId] ?? [];
  switch (service) {
    case 'add_item':
      lists[entityId] = [...list, item(data.item ?? '')];
      break;
    case 'update_item':
      lists[entityId] = list.map(entry =>
        entry.uid === data.item && data.status
          ? {...entry, status: data.status}
          : entry,
      );
      break;
    case 'remove_completed_items':
      lists[entityId] = list.filter(entry => entry.status !== 'completed');
      break;
  }
  notify(entityId);
}
