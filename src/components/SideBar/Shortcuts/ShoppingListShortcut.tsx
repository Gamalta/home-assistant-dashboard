import CircleIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CartIcon from '@mui/icons-material/ShoppingCartRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {ShoppingListShortcutConfigType} from '../../../configs/sidebar';
import {useTodoList} from '../../../hooks/useTodoList';
import {ShoppingListModal} from '../../Modal/ShoppingListModal';
import {ShortcutCard} from './ShortcutCard';

type ShoppingListShortcutProps = {
  id: string;
  shortcutConfig: ShoppingListShortcutConfigType;
};

export function ShoppingListShortcut(props: ShoppingListShortcutProps) {
  const {id, shortcutConfig} = props;
  const [open, setOpen] = useState(false);
  const todo = useTodoList(shortcutConfig.todoEntityId);
  const label = shortcutConfig.label ?? 'Courses';
  const pending = todo.items.filter(item => item.status === 'needs_action');
  const count = pending.length;

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<CartIcon />}
        label={label}
        onClick={() => setOpen(true)}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" component="span">
            {count ? `${count} article${count > 1 ? 's' : ''}` : 'Liste vide'}
          </Typography>
          {pending.slice(0, 3).map(item => (
            <Stack
              key={item.uid}
              direction="row"
              spacing={1}
              sx={{alignItems: 'center', color: 'text.secondary'}}
            >
              <CircleIcon sx={{fontSize: 16}} />
              <Typography component="span" noWrap>
                {item.summary}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </ShortcutCard>
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
