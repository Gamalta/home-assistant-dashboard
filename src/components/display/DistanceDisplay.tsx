import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenterRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import {DistanceIcon} from '../Icons/DistanceIcon';

type DistanceDisplayProps = {
  type?: 'icon' | 'text';
  distance: number;
  atHome?: boolean;
  atWork?: boolean;
};

export function DistanceDisplay(props: DistanceDisplayProps) {
  const {type = 'icon', distance, atHome = false, atWork = false} = props;

  const getDistanceIcon = () => {
    if (atHome) {
      return <HomeIcon />;
    } else if (atWork) {
      return <BusinessCenterIcon />;
    } else {
      return <DistanceIcon />;
    }
  };

  const getDistanceText = () => {
    if (atHome) {
      return 'A la maison';
    } else if (atWork) {
      return 'Au travail';
    } else {
      return `${distance} Km`;
    }
  };

  if (type === 'icon') {
    return <Tooltip title={getDistanceText()}>{getDistanceIcon()}</Tooltip>;
  }

  if (type === 'text') {
    return (
      <Stack direction="row" justifyContent="center" spacing={0.5}>
        {getDistanceIcon()}
        <Typography mt="2px">{getDistanceText()}</Typography>
      </Stack>
    );
  }
  return null;
}
