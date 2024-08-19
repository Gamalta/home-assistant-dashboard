import {HassEntityWithService} from '@hakit/core';
import {LightConfig} from '../config';
import Stack from '@mui/material/Stack';
import {FloatingAction} from '../FloatingAction';
import {useIcon} from '../../../hooks/useIcon';
import {useRoomContext} from '../../../contexts/RoomContext';
import {useLongPress} from '../../../hooks/useLongPress';

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
    <FloatingAction pos={config?.position ?? {x: 0, y: 0}}>
      <Stack
        m="4px"
        width="32px"
        height="32px"
        justifyContent="center"
        alignItems="center"
        borderRadius="50%"
        border="1px solid white"
        boxShadow="0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)"
        bgcolor="rgba(255, 255, 255, 0.3)"
        sx={{
          cursor: unavailable ? 'not-allowed' : 'pointer',
          opacity: unavailable ? 0.5 : 1,
          '&:hover': {
            border: '2px solid white',
          },

          '& .MuiSvgIcon-root': {
            color: `rgb(${(light?.attributes.rgb_color ?? [255, 255, 255]).join(
              ','
            )})`,
          },
        }}
        {...(!unavailable && lightLongPress)}
      >
        {icon}
      </Stack>
    </FloatingAction>
  );
}
