import Stack from '@mui/material/Stack';
import Battery20Icon from '@mui/icons-material/Battery20Rounded';
import Battery30Icon from '@mui/icons-material/Battery30Rounded';
import Battery50Icon from '@mui/icons-material/Battery20Rounded';
import Battery60Icon from '@mui/icons-material/Battery60Rounded';
import Battery80Icon from '@mui/icons-material/Battery80Rounded';
import Battery90Icon from '@mui/icons-material/Battery90Rounded';
import BatteryFullIcon from '@mui/icons-material/BatteryFullRounded';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlertRounded';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20Rounded';
import BatteryCharging30Icon from '@mui/icons-material/BatteryCharging30Rounded';
import BatteryCharging50Icon from '@mui/icons-material/BatteryCharging50Rounded';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60Rounded';
import BatteryCharging80Icon from '@mui/icons-material/BatteryCharging80Rounded';
import BatteryCharging90Icon from '@mui/icons-material/BatteryCharging90Rounded';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFullRounded';
import BatteryUnknownIcon from '@mui/icons-material/BatteryUnknownRounded';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

type BatteryDisplayProps = {
  type?: 'icon' | 'text';
  batteryLevel: number;
  batteryState?: string;
};

export function BatteryDisplay(props: BatteryDisplayProps) {
  const {type = 'icon', batteryLevel, batteryState = 'Not Charging'} = props;

  const getBatteryIcon = () => {
    if (batteryState === 'Not Charging') {
      if (batteryLevel >= 90) return <BatteryFullIcon />;
      if (batteryLevel >= 80) return <Battery90Icon />;
      if (batteryLevel >= 60) return <Battery80Icon />;
      if (batteryLevel >= 50) return <Battery60Icon />;
      if (batteryLevel >= 30) return <Battery50Icon />;
      if (batteryLevel >= 20) return <Battery30Icon />;
      if (batteryLevel >= 10) return <Battery20Icon />;
      return <BatteryAlertIcon />;
    } else if (batteryLevel && batteryState === 'Charging') {
      if (batteryLevel >= 90) return <BatteryChargingFullIcon />;
      if (batteryLevel >= 80) return <BatteryCharging90Icon />;
      if (batteryLevel >= 60) return <BatteryCharging80Icon />;
      if (batteryLevel >= 50) return <BatteryCharging60Icon />;
      if (batteryLevel >= 30) return <BatteryCharging50Icon />;
      if (batteryLevel >= 20) return <BatteryCharging30Icon />;
      return <BatteryCharging20Icon />;
    } else {
      return <BatteryUnknownIcon />;
    }
  };

  if (type === 'icon')
    return <Tooltip title={`${batteryLevel}%`}>{getBatteryIcon()}</Tooltip>;

  if (type === 'text') {
    return (
      <Stack direction="row" justifyContent="center">
        {getBatteryIcon()}
        <Typography mt="2px">{batteryLevel}%</Typography>
      </Stack>
    );
  }
  return null;
}
