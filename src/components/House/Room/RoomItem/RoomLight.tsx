import {useEntity} from '@hakit/core';
import {useIcon} from '../../../../hooks/useIcon';
import {useRoomContext} from '../../../../contexts/RoomContext';
import {useLongPress} from '../../../../hooks/useLongPress';
import {LightConfigType} from '../../../../configs/house';
import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {LightModal} from '../../../Modal/LightModal';
import Button from '@mui/material/Button';
import {lightColor, lightStateLabel} from '../../../../utils/entity/light';
import {readableOn} from '../../../../utils/color';
import {Tile} from '../../../Mobile/Tile';
import type {ItemVariant} from '.';

type RoomLightProps = {
  id: string;
  lightConfig: LightConfigType;
  variant: ItemVariant;
};

export function RoomLight(props: RoomLightProps) {
  const {id, lightConfig, variant} = props;

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
    () => light?.service.toggle(),
  );

  const icon = useIcon(light?.attributes.icon);

  if (!light) return <></>;
  return (
    <>
      <motion.div layoutId={`${id}-light`}>
        {variant === 'tile' ? (
          <Tile
            icon={icon}
            name={light.attributes.friendly_name ?? 'Lumière'}
            state={lightStateLabel(light)}
            active={light.state === 'on'}
            aria-pressed={light.state === 'on'}
            color={`rgb(${lightColor(light).join(',')})`}
            iconColor={readableOn(lightColor(light))}
            unavailable={unavailable}
            {...(!unavailable && lightLongPress)}
          />
        ) : (
          <Button
            variant="contained"
            color="secondary"
            aria-label={light.attributes.friendly_name}
            sx={{
              height: '100%',
              minWidth: 0,
              px: '6px',
              ...(light?.state === 'on' && {
                color: `rgb(${lightColor(light).join(',')})`,
              }),

              cursor: unavailable ? 'not-allowed' : 'pointer',
              opacity: unavailable ? 0.5 : 1,
            }}
            {...(!unavailable && lightLongPress)}
          >
            {icon}
          </Button>
        )}
      </motion.div>
      <LightModal
        id={`${id}-light`}
        open={lightModal}
        originLight={light}
        onClose={() => setLightModal(false)}
        title="Lumière"
      />
    </>
  );
}
