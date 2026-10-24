import CartIcon from '@mui/icons-material/ShoppingCartRounded';
import {useState} from 'react';
import type {ShoppingListShortcutConfigType} from '../../../configs/sidebar';
import {useTodoList} from '../../../hooks/useTodoList';
import {ShoppingListModal} from '../../Modal/ShoppingListModal';
import {ShortcutTile} from './ShortcutTile';

type ShoppingListShortcutProps = {
  id: string;
  shortcutConfig: ShoppingListShortcutConfigType;
};

export function ShoppingListShortcut(props: ShoppingListShortcutProps) {
  const {id, shortcutConfig} = props;
  const [open, setOpen] = useState(false);
  const todo = useTodoList(shortcutConfig.todoEntityId);
  const label = shortcutConfig.label ?? 'Courses';
  const count = todo.items.filter(
    item => item.status === 'needs_action',
  ).length;

  return (
    <>
      <ShortcutTile
        id={id}
        icon={<CartIcon />}
        label={label}
        value={count ? `${count} article${count > 1 ? 's' : ''}` : 'Liste vide'}
        onClick={() => setOpen(true)}
      />
      <ShoppingListModal
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        todo={todo}
      />
    </>
  );
}
