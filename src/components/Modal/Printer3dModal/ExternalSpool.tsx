import {useEntity} from '@hakit/core';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type ExternalSpoolProps = {
  entityId: `sensor.${string}`;
};

export function ExternalSpool(props: ExternalSpoolProps) {
  const {entityId} = props;
  const spool = useEntity(entityId, {returnNullIfNotFound: true});

  if (!spool || spool.attributes.empty) return null;
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{alignItems: 'center'}}
      title={spool.state}
    >
      {/* Couleur au format #RRGGBBAA, directement lisible en CSS. */}
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          bgcolor: spool.attributes.color,
          border: theme => `1px solid ${theme.palette.divider}`,
        }}
      />
      <Typography variant="body2">{spool.attributes.type}</Typography>
    </Stack>
  );
}
