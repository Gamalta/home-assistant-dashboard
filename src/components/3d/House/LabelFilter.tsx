import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import type {HouseConfigType} from '../../../configs/house';
import {useAppContext} from '../../../contexts/AppContext';
import {houseLabelCategories} from '../../../utils/labelCategories';

type LabelFilterProps = {
  rooms: HouseConfigType['rooms'];
};

export function LabelFilter(props: LabelFilterProps) {
  const {rooms} = props;
  const {configuration, setConfiguration} = useAppContext();
  const categories = houseLabelCategories(rooms);

  if (categories.length === 0) return null;

  const toggle = (id: string) =>
    setConfiguration(prev => ({
      ...prev,
      hiddenCategories: prev.hiddenCategories.includes(id)
        ? prev.hiddenCategories.filter(hidden => hidden !== id)
        : [...prev.hiddenCategories, id],
    }));

  return (
    <Stack
      direction="row"
      sx={{
        position: 'absolute',
        top: theme => theme.spacing(2),
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1,
        gap: 0.5,
        p: 0.5,
        bgcolor: 'background.paper',
        borderRadius: '50px',
        boxShadow: 3,
      }}
    >
      {categories.map(({id, label, icon: Icon}) => (
        <Tooltip key={id} title={label}>
          <ToggleButton
            value={id}
            selected={!configuration.hiddenCategories.includes(id)}
            onChange={() => toggle(id)}
            sx={{
              width: 44,
              height: 44,
              border: 0,
              color: 'text.disabled',
              '&.Mui-selected, &.Mui-selected:hover': {
                color: 'primary.main',
                bgcolor: 'background.tertiary',
              },
            }}
          >
            <Icon />
          </ToggleButton>
        </Tooltip>
      ))}
    </Stack>
  );
}
