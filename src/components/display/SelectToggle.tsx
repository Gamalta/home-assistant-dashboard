import {useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

type SelectToggleProps = {
  entityId: `select.${string}`;
  label: string;
  optionLabel: (option: string) => string;
};

export function SelectToggle(props: SelectToggleProps) {
  const {entityId, label, optionLabel} = props;
  const select = useEntity(entityId, {returnNullIfNotFound: true});

  // L'intégration la rend indisponible quand elle ne s'applique pas
  // (vitesse hors impression, puissance pendant un lavage seul).
  if (!select || select.state === 'unavailable') return null;
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" color="textSecondary">
        {label}
      </Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        aria-label={label}
        value={select.state}
        onChange={(_, option: string | null) =>
          option && select.service.selectOption({serviceData: {option}})
        }
      >
        {(select.attributes.options ?? []).map(option => (
          <ToggleButton
            key={option}
            value={option}
            sx={{px: 0.5, textTransform: 'none'}}
          >
            {optionLabel(option)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}
