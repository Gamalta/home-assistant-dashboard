import {HassEntityWithService} from '@hakit/core';
import {LightConfig} from '../config';
import {FloatingAction} from '../FloatingAction';
import {useIcon} from '../../../hooks/useIcon';
import {useRoomContext} from '../../../contexts/RoomContext';
import {useLongPress} from '../../../hooks/useLongPress';
import Button from '@mui/material/Button';

type RoomLightProps = {
  parameters: {
    light: HassEntityWithService<'light'> | null;
    config?: LightConfig;
  };
};

export function RoomLight(props: RoomLightProps) {
  const {
    parameters: {light, config},
  } = props;

  const {setLightModalOpen} = useRoomContext();
  const unavailable = light?.state === 'unavailable';

  const lightLongPress = useLongPress(
    () => setLightModalOpen(true),
    () => light?.service.toggle()
  );

  const icon = useIcon(light?.attributes.icon);
  return (
    <FloatingAction
      pos={config?.position ?? {x: 0, y: 0}}
      bgcolor="background.paper"
      borderRadius="50%"
    >
      <Button
        variant="text"
        sx={{
          minWidth: 0,
          bgcolor: 'transparent',
          color:
            light?.state === 'on'
              ? `rgb(${(light?.attributes.rgb_color ?? [255, 255, 255]).join(
                  ','
                )})`
              : 'text.secondary',

          cursor: unavailable ? 'not-allowed' : 'pointer',
          opacity: unavailable ? 0.5 : 1,
        }}
        {...(!unavailable && lightLongPress)}
      >
        {icon}
      </Button>
    </FloatingAction>
  );
}
