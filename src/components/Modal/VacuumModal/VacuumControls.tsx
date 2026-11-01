import {useEntity, useHass, type CallServiceArgs} from '@hakit/core';
import HomeIcon from '@mui/icons-material/HomeRounded';
import PauseIcon from '@mui/icons-material/PauseRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type {VacuumEntityIds} from '../../../utils/entity/vacuum';

type VacuumControlsProps = {
  ids: VacuumEntityIds;
  rooms: number[];
  onClean: () => void;
};

export function VacuumControls(props: VacuumControlsProps) {
  const {ids, rooms, onClean} = props;
  const vacuum = useEntity(ids.vacuum, {returnNullIfNotFound: true});
  const callService = useHass(state => state.helpers.callService);

  if (!vacuum || vacuum.state === 'returning') return null;
  const {state} = vacuum;

  const clean = () => {
    // dreame_vacuum est absent des types de @hakit/core.
    if (rooms.length)
      callService({
        domain: 'dreame_vacuum',
        service: 'vacuum_clean_segment',
        serviceData: {segments: rooms},
        target: ids.vacuum,
      } as unknown as CallServiceArgs<'vacuum', 'start', false>);
    else vacuum.service.start();
    onClean();
  };

  return (
    <Stack direction="row" spacing={1}>
      {state === 'cleaning' && (
        <Button
          variant="contained"
          startIcon={<PauseIcon />}
          sx={{flex: 1}}
          onClick={() => vacuum.service.pause()}
        >
          Pause
        </Button>
      )}
      {state === 'paused' && (
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          sx={{flex: 1}}
          onClick={() => vacuum.service.start()}
        >
          Reprendre
        </Button>
      )}
      {state !== 'cleaning' && state !== 'paused' && (
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          sx={{flex: 2}}
          onClick={clean}
        >
          {rooms.length
            ? `Nettoyer ${rooms.length} pièce${rooms.length > 1 ? 's' : ''}`
            : 'Tout nettoyer'}
        </Button>
      )}
      {state !== 'docked' && (
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          sx={{flex: 1}}
          onClick={() => vacuum.service.returnToBase()}
        >
          Rentrer
        </Button>
      )}
    </Stack>
  );
}
