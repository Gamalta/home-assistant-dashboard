import {useEntity} from '@hakit/core';
import {FloatingAction} from '../../FloatingAction';
import {useIcon} from '../../../../hooks/useIcon';
import {useRoomContext} from '../../../../contexts/RoomContext';
import {useLongPress} from '../../../../hooks/useLongPress';
import Button from '@mui/material/Button';
import {LightConfigType} from '../../../../configs/house';
import {useEffect} from 'react';

type RoomLightProps = {
  lightConfig: LightConfigType;
};

export function RoomLight(props: RoomLightProps) {
  const {lightConfig} = props;

  const {setLightModalOpen, setLightEntities} = useRoomContext();
  const light = useEntity(lightConfig.entity_id, {returnNullIfNotFound: true});

  useEffect(() => {
    if (!light) return;
    setLightEntities(prev => {
      const index = prev.findIndex(li => li.entity_id === light.entity_id);
      if (index !== -1) {
        return prev.map((li, i) => (i === index ? light : li));
      }
      return [...prev, light];
    });
  }, [light, setLightEntities]);

  const unavailable = light?.state === 'unavailable';

  const lightLongPress = useLongPress(
    () => setLightModalOpen(true),
    () => light?.service.toggle()
  );

  const icon = useIcon(light?.attributes.icon);
  return (
    <FloatingAction
      pos={lightConfig?.position ?? {x: 0, y: 0}}
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
