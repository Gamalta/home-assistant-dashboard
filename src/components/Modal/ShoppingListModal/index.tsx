import AddIcon from '@mui/icons-material/AddRounded';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {type FormEvent, useState} from 'react';
import {Modal, ModalProps} from '..';
import type {useTodoList} from '../../../hooks/useTodoList';
import {ShoppingListItem} from './ShoppingListItem';

type ShoppingListModalProps = Omit<ModalProps, 'children'> & {
  todo: ReturnType<typeof useTodoList>;
};

export function ShoppingListModal(props: ShoppingListModalProps) {
  const {todo, ...modalProps} = props;
  const [summary, setSummary] = useState('');
  const pending = todo.items.filter(item => item.status === 'needs_action');
  const completed = todo.items.filter(item => item.status === 'completed');

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!summary.trim()) return;
    todo.addItem(summary.trim());
    setSummary('');
  };

  return (
    <Modal {...modalProps}>
      <Stack spacing={2} sx={{width: 360, maxWidth: '100%'}}>
        <Stack component="form" direction="row" spacing={1} onSubmit={add}>
          <TextField
            size="small"
            fullWidth
            placeholder="Ajouter un article"
            value={summary}
            onChange={event => setSummary(event.target.value)}
            slotProps={{htmlInput: {'aria-label': 'Nouvel article'}}}
          />
          <IconButton type="submit" aria-label="Ajouter">
            <AddIcon />
          </IconButton>
        </Stack>
        {todo.items.length ? (
          <List dense disablePadding sx={{maxHeight: 360, overflowY: 'auto'}}>
            {[...pending, ...completed].map(item => (
              <ShoppingListItem
                key={item.uid}
                item={item}
                onToggle={() =>
                  todo.setCompleted(item, item.status === 'needs_action')
                }
              />
            ))}
          </List>
        ) : (
          <Typography color="textSecondary">La liste est vide.</Typography>
        )}
        {completed.length > 0 && (
          <Button onClick={todo.removeCompleted}>
            Retirer les articles cochés
          </Button>
        )}
      </Stack>
    </Modal>
  );
}
