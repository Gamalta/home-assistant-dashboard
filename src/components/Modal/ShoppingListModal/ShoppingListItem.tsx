import Checkbox from '@mui/material/Checkbox';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import type {TodoItem} from '../../../hooks/useTodoList';

type ShoppingListItemProps = {
  item: TodoItem;
  onToggle: () => void;
};

export function ShoppingListItem(props: ShoppingListItemProps) {
  const {item, onToggle} = props;
  const completed = item.status === 'completed';

  return (
    <ListItemButton onClick={onToggle} sx={{borderRadius: 1}}>
      <ListItemIcon sx={{minWidth: 40}}>
        <Checkbox
          edge="start"
          checked={completed}
          tabIndex={-1}
          disableRipple
          slotProps={{input: {'aria-label': item.summary}}}
        />
      </ListItemIcon>
      <ListItemText
        primary={item.summary}
        sx={{
          textDecoration: completed ? 'line-through' : 'none',
          color: completed ? 'text.secondary' : 'text.primary',
        }}
      />
    </ListItemButton>
  );
}
