import {useEntity} from '@hakit/core';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type ConsumablesProps = {
  entityId: `vacuum.${string}`;
};

// Attributs de l'entité vacuum, en % de vie restante.
const CONSUMABLES = [
  ['main_brush_left', 'Brosse'],
  ['side_brush_left', 'Brosse latérale'],
  ['filter_left', 'Filtre'],
  ['mop_pad_left', 'Serpillières'],
  ['sensor_dirty_left', 'Capteurs'],
] as const;
const LOW_LEFT = 20;

export function Consumables(props: ConsumablesProps) {
  const {entityId} = props;
  const vacuum = useEntity(entityId, {returnNullIfNotFound: true});

  if (!vacuum) return null;
  return (
    <Stack direction="row" sx={{justifyContent: 'space-around'}}>
      {CONSUMABLES.map(([key, label]) => {
        const left: number | undefined = vacuum.attributes[key];
        if (left === undefined) return null;
        return (
          <Stack key={key} spacing={0.5} sx={{alignItems: 'center', width: 64}}>
            <Box sx={{position: 'relative', display: 'flex'}}>
              <CircularProgress
                variant="determinate"
                enableTrackSlot
                value={left}
                size={48}
                thickness={5}
                color={left < LOW_LEFT ? 'error' : 'primary'}
                aria-label={label}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {left}%
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="textSecondary"
              align="center"
              sx={{lineHeight: 1.2}}
            >
              {label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
