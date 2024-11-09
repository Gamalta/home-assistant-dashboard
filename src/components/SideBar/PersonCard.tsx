import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import {useEntity} from '@hakit/core';
import Tooltip from '@mui/material/Tooltip';
import NightlightIcon from '@mui/icons-material/NightlightRound';
import {BatteryDisplay} from '../display/BatteryDisplay';
import {DistanceDisplay} from '../display/DistanceDisplay';
import {PersonConfigType} from '../../configs/house';

type PersonCardProps = {
  person?: PersonConfigType;
};

export function PersonCard(props: PersonCardProps) {
  const {person} = props;
  const focused = useEntity(person?.focus ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const homeDistance = useEntity(person?.home_distance ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const batteryLevel = useEntity(person?.battery_level ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const batteryState = useEntity(person?.battery_state ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const homeZone = useEntity(person?.home_zone ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const workZone = useEntity(person?.work_zone ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  const toLocalTime = (date: string) => {
    const time = new Date(date);
    return time.toLocaleTimeString('FR-fr', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Stack
      alignItems="center"
      width="100%"
      borderRadius={1}
      bgcolor="background.tertiary"
      p={theme => theme.spacing(1, 2)}
    >
      <Stack position="relative">
        <Box
          p={0.5}
          component="img"
          src={person?.avatar}
          height="80px"
          width="80px"
          sx={{objectFit: 'contain'}}
        />
        {focused?.state === 'on' && (
          <Tooltip title={`depuis ${toLocalTime(focused.last_changed)}`}>
            <NightlightIcon
              sx={{
                position: 'absolute',
                fontSize: '1.7em',
                top: 5,
                right: -5,
                rotate: '-40deg',
                bgcolor: 'background.paper',
                borderRadius: '50%',
                color: '#5F19EB',
                padding: 0.5,
              }}
            />
          </Tooltip>
        )}
      </Stack>
      <Typography variant="h6" color="primary.main">
        {person?.name}
      </Typography>
      {homeDistance && (
        <DistanceDisplay
          type="text"
          distance={Number(homeDistance.state)}
          atHome={homeZone?.attributes.persons?.includes(person?.entity)}
          atWork={workZone?.attributes.persons?.includes(person?.entity)}
        />
      )}
      {batteryLevel && (
        <BatteryDisplay
          type="text"
          batteryLevel={Number(batteryLevel.state)}
          batteryState={batteryState?.state}
        />
      )}
    </Stack>
  );
}
