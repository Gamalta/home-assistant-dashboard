import {act, renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {type TodoItem, useTodoList} from './useTodoList';

const {connection, callService} = vi.hoisted(() => ({
  connection: {subscribeMessage: vi.fn()},
  callService: vi.fn(),
}));

vi.mock('@hakit/core', () => ({
  useHass: (selector: (state: object) => unknown) => selector({connection}),
}));
vi.mock('home-assistant-js-websocket', () => ({callService}));

const milk: TodoItem = {uid: '1', summary: 'Lait', status: 'needs_action'};

describe('useTodoList', () => {
  let push: (message: {items: TodoItem[]}) => void;
  const stop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    connection.subscribeMessage.mockImplementation(async callback => {
      push = callback;
      return stop;
    });
  });

  it('suit les articles poussés par l’abonnement Home Assistant', () => {
    const {result} = renderHook(() => useTodoList('todo.courses'));

    expect(connection.subscribeMessage).toHaveBeenCalledWith(
      expect.any(Function),
      {type: 'todo/item/subscribe', entity_id: 'todo.courses'},
    );
    act(() => push({items: [milk]}));
    expect(result.current.items).toEqual([milk]);
  });

  it('se désabonne au démontage', async () => {
    const {unmount} = renderHook(() => useTodoList('todo.courses'));
    unmount();
    await vi.waitFor(() => expect(stop).toHaveBeenCalled());
  });

  it('appelle les services todo de la liste', () => {
    const {result} = renderHook(() => useTodoList('todo.courses'));
    const target = {entity_id: 'todo.courses'};

    result.current.addItem('Pain');
    result.current.setCompleted(milk, true);
    result.current.setCompleted(milk, false);
    result.current.removeCompleted();

    expect(callService.mock.calls).toEqual([
      [connection, 'todo', 'add_item', {item: 'Pain'}, target],
      [
        connection,
        'todo',
        'update_item',
        {item: '1', status: 'completed'},
        target,
      ],
      [
        connection,
        'todo',
        'update_item',
        {item: '1', status: 'needs_action'},
        target,
      ],
      [connection, 'todo', 'remove_completed_items', undefined, target],
    ]);
  });
});
