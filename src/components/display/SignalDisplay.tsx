import WifiIcon from '@mui/icons-material/Wifi';
import Wifi2BarIcon from '@mui/icons-material/Wifi2Bar';
import Wifi1BarIcon from '@mui/icons-material/Wifi1Bar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

type SignalDisplayProps = {
  type?: 'icon' | 'text';
  signal: number;
};

export function SignalDisplay(props: SignalDisplayProps) {
  const {type = 'icon', signal} = props;
  const getSignalIcon = () => {
    if (signal > -60) {
      return <WifiIcon sx={{position: 'absolute'}} />; // good signal (<= -50 dBm)
    } else if (signal > -80) {
      return <Wifi2BarIcon sx={{position: 'absolute'}} />; // medium signal (> -50, <= -70 dBm)
    } else {
      return <Wifi1BarIcon sx={{position: 'absolute'}} />; // bad signal (> -70)
    }
  };

  if (type === 'icon')
    return (
      <Stack position="relative">
        <WifiIcon sx={{opacity: 0.3}} />
        <Tooltip title={`${signal} dBm`}>{getSignalIcon()}</Tooltip>
      </Stack>
    );
  if (type === 'text')
    return (
      <Stack direction="row" justifyContent="center">
        <Stack position="relative">
          <WifiIcon sx={{opacity: 0.3}} />
          {getSignalIcon()}
        </Stack>
        <Typography mt="2px">{signal} dBm</Typography>
      </Stack>
    );
  return null;
}
