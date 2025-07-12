import {useEntity} from '@hakit/core';
import {useIcon} from '../../../../hooks/useIcon';
import {useRoomContext} from '../../../../contexts/RoomContext';
import {useLongPress} from '../../../../hooks/useLongPress';
import {LightConfigType} from '../../../../configs/house';
import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {LightModal} from '../../../Modal/LightModal';
import Button from '@mui/material/Button';
import {RoomLightImage} from '../RoomLightImage';
import {createPortal} from 'react-dom';
import {useHouseContext} from '../../../../contexts/HouseContext';

type RoomLightProps = {
  id: string;
  lightConfig: LightConfigType;
};

export function RoomLight(props: RoomLightProps) {
  const {id, lightConfig} = props;

  const [lightModal, setLightModal] = useState(false);
  const {houseRef} = useHouseContext();
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
          variant="contained"
          color="secondary"
          sx={{
            height: '100%',
            minWidth: 0,
            px: '6px',
            ...(light?.state === 'on' && {
              color: `rgb(${(
                light?.attributes.rgb_color ?? [255, 255, 255]
              ).join(',')})`,
            }),

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
        originLight={light}
        onClose={() => setLightModal(false)}
        title="Lumière"
      />
      {houseRef?.current &&
        createPortal(
          <RoomLightImage
            lightConfig={lightConfig}
            light={light}
            key={`${id}-light-image`}
          />,
          houseRef?.current
        )}
    </>
  );
}
