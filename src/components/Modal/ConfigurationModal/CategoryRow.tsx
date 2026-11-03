import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {useAppContext} from '../../../contexts/AppContext';
import {
  isCategoryShown,
  type LabelCategory,
} from '../../../utils/labelCategories';

type CategoryRowProps = {
  category: LabelCategory;
  disabled?: boolean;
};

export function CategoryRow(props: CategoryRowProps) {
  const {category, disabled} = props;
  const {id, label, icon: Icon} = category;
  const {configuration, setConfiguration} = useAppContext();

  return (
    <Stack
      direction="row"
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          color: disabled ? 'text.disabled' : undefined,
        }}
      >
        <Icon fontSize="small" />
        <Typography>{label}</Typography>
      </Stack>
      <Switch
        checked={isCategoryShown(category, configuration.shownCategories)}
        disabled={disabled}
        slotProps={{input: {'aria-label': label}}}
        onChange={event =>
          setConfiguration(prev => ({
            ...prev,
            shownCategories: {
              ...prev.shownCategories,
              [id]: event.target.checked,
            },
          }))
        }
      />
    </Stack>
  );
}
