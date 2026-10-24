import {useHass} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {getPendingUpdates} from '../../../utils/system';

// Lecture seule : l'installation se fait depuis Home Assistant, pas depuis la tablette.
export function UpdatesInfo() {
  const entities = useHass(state => state.entities);
  const updates = getPendingUpdates(entities);

  return (
    <Stack spacing={0.5}>
      <Stack
        direction="row"
        sx={{justifyContent: 'space-between', alignItems: 'center'}}
      >
        <Typography>Mises à jour</Typography>
        <Typography color="text.secondary">
          {updates.length === 0
            ? 'Aucune'
            : `${updates.length} disponible${updates.length > 1 ? 's' : ''}`}
        </Typography>
      </Stack>
      {updates.map(update => (
        <Typography
          key={update.entity_id}
          variant="body2"
          color="text.secondary"
        >
          {update.attributes.friendly_name} :{' '}
          {update.attributes.installed_version} →{' '}
          {update.attributes.latest_version}
        </Typography>
      ))}
    </Stack>
  );
}
