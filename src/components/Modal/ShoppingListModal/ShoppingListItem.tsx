import CheckIcon from '@mui/icons-material/CheckCircleRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import {motion} from 'framer-motion';
import type {TodoItem} from '../../../hooks/useTodoList';
import {groceryEmoji} from '../../../utils/groceryEmoji';

type ShoppingListItemProps = {
  item: TodoItem;
  onToggle: () => void;
};

export function ShoppingListItem(props: ShoppingListItemProps) {
  const {item, onToggle} = props;
  const completed = item.status === 'completed';

  return (
    <ButtonBase
      // La tuile glisse d'une section à l'autre quand on la coche.
      component={motion.button}
      layoutId={`shopping-list-${item.uid}`}
      role="checkbox"
      aria-checked={completed}
      aria-label={item.summary}
      onClick={onToggle}
      sx={{
        position: 'relative',
        flexDirection: 'column',
        gap: 1,
        height: 104,
        px: 1,
        borderRadius: 1,
        border: 1,
        borderColor: completed ? 'divider' : 'transparent',
        bgcolor: completed ? 'transparent' : 'background.tertiary',
        transition: 'background-color 200ms, border-color 200ms',
      }}
    >
      <Typography
        component="span"
        sx={{fontSize: 40, lineHeight: 1, opacity: completed ? 0.4 : 1}}
      >
        {groceryEmoji(item.summary)}
      </Typography>
      <Typography
        component="span"
        noWrap
        color={completed ? 'textSecondary' : 'textPrimary'}
        sx={{
          maxWidth: '100%',
          textDecoration: completed ? 'line-through' : 'none',
        }}
      >
        {item.summary}
      </Typography>
      {completed && (
        <CheckIcon
          color="primary"
          sx={{position: 'absolute', top: 8, right: 8, fontSize: 20}}
        />
      )}
    </ButtonBase>
  );
}
