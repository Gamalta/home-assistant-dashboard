import {useEntity} from '@hakit/core';
import {useIcon} from '../../../../hooks/useIcon';
import {useRoomContext} from '../../../../contexts/RoomContext';
import {useLongPress} from '../../../../hooks/useLongPress';
import Button from '@mui/material/Button';
import {LightConfigType} from '../../../../configs/house';
import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {LightModal} from '../../../Modal/LightModal';

type RoomLightProps = {
  id: string;
  lightConfig: LightConfigType;
};

export function RoomLight(props: RoomLightProps) {
  const {id, lightConfig} = props;

  const [lightModal, setLightModal] = useState(false);
  const {setLightEntities} = useRoomContext();
  const light = useEntity(lightConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });

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
    () => setLightModal(true),
    () => light?.service.toggle()
  );

  const icon = useIcon(light?.attributes.icon);
  return (
    <>
      <motion.div layoutId={`${id}-light`}>
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
      </motion.div>
      <LightModal
        id={`${id}-light`}
        open={lightModal}
        onClose={() => setLightModal(false)}
        title="Lumière"
      />
    </>
  );
}
