import Button from '@mui/material/Button';
import {alpha} from '@mui/material/styles';
import {PendantRoundIcon} from '../../Icons/PendantRoundIcon';
import {HassEntityWithService} from '@hakit/core';
import {useLongPress} from '../../../hooks/useLongPress';
import {useRoomContext} from '../../../contexts/RoomContext';

type RoomLightHtmlProps = {
  light: HassEntityWithService<'light'>;
};

export function RoomLightHtml(props: RoomLightHtmlProps) {
  const {light} = props;

  const {setLightModalOpen} = useRoomContext();
  const lightLongPress = useLongPress(
    () => setLightModalOpen(true),
    () => light?.service.toggle()
  );

  return (
    <Button
      sx={{
        bgcolor: light.state === 'on' ? light.custom.hexColor : undefined,
        '&:hover': {
          bgcolor:
            light.state === 'on'
              ? alpha(light.custom.hexColor, 0.8)
              : undefined,
        },
      }}
      {...lightLongPress}
    >
      <PendantRoundIcon />
    </Button>
  );
}
