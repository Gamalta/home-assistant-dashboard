import Stack from '@mui/material/Stack';
import {batteryLevel, isBatteryLow} from '../../utils/entity/battery';
import {BatteryIcon} from '../Icons/BatteryIcon';

type BatteryLevelDisplayProps = {
  state?: string;
};

export function BatteryLevelDisplay(props: BatteryLevelDisplayProps) {
  const {state} = props;
  const level = batteryLevel(state);

  return (
    <Stack
      component="span"
      direction="row"
      sx={{
        alignItems: 'center',
        color: isBatteryLow(level) ? 'error.main' : undefined,
      }}
    >
      <BatteryIcon level={level} />
      {level === null ? '--' : `${level}%`}
    </Stack>
  );
}
