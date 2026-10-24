import {useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import {printSpeedLabel} from '../../../utils/entity/printer3d';

type PrintSpeedProps = {
  entityId: `select.${string}`;
};

export function PrintSpeed(props: PrintSpeedProps) {
  const {entityId} = props;
  const speed = useEntity(entityId, {returnNullIfNotFound: true});

  // ha-bambulab ne la rend disponible que pendant l'impression, hors pause.
  if (!speed || speed.state === 'unavailable') return null;
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" color="textSecondary">
        Vitesse
      </Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        aria-label="Vitesse d'impression"
        value={speed.state}
        onChange={(_, option: string | null) =>
          option && speed.service.selectOption({serviceData: {option}})
        }
      >
        {(speed.attributes.options ?? []).map(option => (
          <ToggleButton
            key={option}
            value={option}
            sx={{px: 0.5, textTransform: 'none'}}
          >
            {printSpeedLabel(option)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}
