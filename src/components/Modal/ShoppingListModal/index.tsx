import AddIcon from '@mui/icons-material/AddRounded';
import ClearAllIcon from '@mui/icons-material/ClearAllRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {type FormEvent, useState} from 'react';
import {Modal, ModalProps} from '..';
import {useTodoList} from '../../../hooks/useTodoList';
import {ShoppingListItem} from './ShoppingListItem';

type ShoppingListModalProps = Omit<ModalProps, 'children'> & {
  todoEntityId: string;
};

export function ShoppingListModal(props: ShoppingListModalProps) {
  const {todoEntityId, ...modalProps} = props;
  const todo = useTodoList(todoEntityId);
  const [summary, setSummary] = useState('');
  const pending = todo.items.filter(item => item.status === 'needs_action');
  const completed = todo.items.filter(item => item.status === 'completed');
  const sections = [
    {title: 'À acheter', items: pending},
    {title: 'Dans le panier', items: completed},
  ].filter(section => section.items.length);

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!summary.trim()) return;
    todo.addItem(summary.trim());
    setSummary('');
  };

  return (
    <Modal {...modalProps}>
      <Stack spacing={2} sx={{width: 440, maxWidth: '100%', height: 440}}>
        <Stack component="form" direction="row" spacing={1} onSubmit={add}>
          <TextField
            size="small"
            fullWidth
            placeholder="Ajouter un article"
            value={summary}
            onChange={event => setSummary(event.target.value)}
            slotProps={{htmlInput: {'aria-label': 'Nouvel article'}}}
          />
          <Fab size="small" color="primary" type="submit" aria-label="Ajouter">
            <AddIcon />
          </Fab>
        </Stack>
        <Stack
          component="section"
          aria-label="Articles"
          spacing={2}
          sx={{flex: 1, minHeight: 0, overflowY: 'auto'}}
        >
          {sections.length ? (
            sections.map(section => (
              <Stack key={section.title} spacing={1}>
                <Typography variant="overline" color="textSecondary">
                  {section.title} · {section.items.length}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                  }}
                >
                  {section.items.map(item => (
                    <ShoppingListItem
                      key={item.uid}
                      item={item}
                      onToggle={() =>
                        todo.setCompleted(item, item.status === 'needs_action')
                      }
                    />
                  ))}
                </Box>
              </Stack>
            ))
          ) : (
            <Stack
              sx={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography sx={{fontSize: 56}}>🛒</Typography>
              <Typography>La liste est vide.</Typography>
            </Stack>
          )}
        </Stack>
        {completed.length > 0 && (
          <Button startIcon={<ClearAllIcon />} onClick={todo.removeCompleted}>
            Retirer les articles cochés
          </Button>
        )}
      </Stack>
    </Modal>
  );
}
