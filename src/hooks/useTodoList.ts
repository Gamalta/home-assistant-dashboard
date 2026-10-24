import {useHass} from '@hakit/core';
import {callService} from 'home-assistant-js-websocket';
import {useEffect, useState} from 'react';

export type TodoItem = {
  uid: string;
  summary: string;
  status: 'needs_action' | 'completed';
};

/**
 * Articles d'une liste `todo` de Home Assistant, tenus à jour par l'abonnement
 * `todo/item/subscribe` (celui du frontend de Home Assistant).
 */
export function useTodoList(entityId: string) {
  const connection = useHass(state => state.connection);
  const [items, setItems] = useState<TodoItem[]>([]);

  useEffect(() => {
    if (!connection) return;
    const unsubscribe = connection.subscribeMessage<{items: TodoItem[]}>(
      message => setItems(message.items),
      {type: 'todo/item/subscribe', entity_id: entityId},
    );
    return () => {
      unsubscribe.then(stop => stop());
    };
  }, [connection, entityId]);

  const call = (service: string, serviceData?: object) => {
    if (connection) {
      callService(connection, 'todo', service, serviceData, {
        entity_id: entityId,
      });
    }
  };

  return {
    items,
    addItem: (summary: string) => call('add_item', {item: summary}),
    setCompleted: (item: TodoItem, completed: boolean) =>
      call('update_item', {
        item: item.uid,
        status: completed ? 'completed' : 'needs_action',
      }),
    removeCompleted: () => call('remove_completed_items'),
  };
}
