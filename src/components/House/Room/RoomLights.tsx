import {HouseConfig} from '../config';
import {motion} from 'framer-motion';
import Fab from '@mui/material/Fab';
import {alpha} from '@mui/material/styles';
import {PendantRoundIcon} from '../../Icons/PendantRoundIcon';
import {LightModal} from '../../Modal/Type/LightModal';
import {useRoomContext} from '../../../contexts/RoomContext';
import {useLongPress} from '../../../hooks/useLongPress';
import {HassEntityWithService} from '@hakit/core';

type RoomLightsProps = {
  id: string;
  room: (typeof HouseConfig)['rooms'][0];
  mainLight?: HassEntityWithService<'light'>;
  lights?: HassEntityWithService<'light'>[];
};

export function RoomLights(props: RoomLightsProps) {
  const {id, room, mainLight, lights} = props;
  const {lightModalOpen, setLightModalOpen} = useRoomContext();

  const lightLongPress = useLongPress(
    () => setLightModalOpen(true),
    () => mainLight?.service.toggle()
  );

  if (!mainLight) return;

  return (
    <>
      <motion.div layoutId={`${id}-light`}>
        <Fab
          variant="extended"
          size="small"
          sx={{
            bgcolor:
              mainLight.state === 'on' ? mainLight.custom.hexColor : undefined,
            '&:hover': {
              bgcolor:
                mainLight.state === 'on'
                  ? alpha(mainLight.custom.hexColor, 0.8)
                  : undefined,
            },
          }}
          {...lightLongPress}
        >
          <PendantRoundIcon />
        </Fab>
      </motion.div>
      <LightModal
        id={`${id}-light`}
        open={lightModalOpen}
        onClose={() => setLightModalOpen(false)}
        mainEntity={mainLight}
        entities={lights}
        title={`Lumière ${room.name}`}
      />
    </>
  );
}
