import {HassEntityWithService} from '@hakit/core';
import {useRoomContext} from '../../../contexts/RoomContext';
import {useLongPress} from '../../../hooks/useLongPress';
import {motion} from 'framer-motion';
import Fab from '@mui/material/Fab';
import {ThermostatIcon} from '../../Icons/ThermostatIcon';
import {TemperatureModal} from '../../Modal/Type/TemperatureModal';
import {alpha} from '@mui/material/styles';
import {PendantRoundIcon} from '../../Icons/PendantRoundIcon';
import {LightModal} from '../../Modal/Type/LightModal';
import {FloatingAction} from '../FloatingAction';

type RoomActionProps = {
  id: string;
  name: string;
  position: {x: number; y: number};
  temperature?: HassEntityWithService<'sensor'>;
  mainLight?: HassEntityWithService<'light'>;
  lights?: HassEntityWithService<'light'>[];
};

export function RoomAction(props: RoomActionProps) {
  const {id, name, position, temperature, mainLight, lights} = props;
  const {lightModalOpen, setLightModalOpen, tempModalOpen, setTempModalOpen} =
    useRoomContext();

  const lightLongPress = useLongPress(
    () => setLightModalOpen(true),
    () => mainLight?.service.toggle()
  );
  const tempLongPress = useLongPress(
    () => setTempModalOpen(true),
    () => {}
  );

  return (
    <FloatingAction
      component={motion.div}
      pos={position}
      bgcolor="background.default"
      direction="row"
      borderRadius="50px"
      spacing={2}
      p={1}
      zIndex={10}
    >
      {temperature && (
        <>
          <motion.div layoutId={`${id}-temp`}>
            <Fab variant="extended" {...tempLongPress}>
              <ThermostatIcon />
              {`${temperature.state}°C`}
            </Fab>
          </motion.div>
          <TemperatureModal
            id={`${id}-temp`}
            open={tempModalOpen}
            onClose={() => setTempModalOpen(false)}
            entity={temperature}
          />
        </>
      )}
      {mainLight && (
        <>
          <motion.div layoutId={`${id}-light`}>
            <Fab
              variant="extended"
              sx={{
                bgcolor:
                  mainLight.state === 'on'
                    ? mainLight.custom.hexColor
                    : undefined,
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
            title={name}
          />
        </>
      )}
    </FloatingAction>
  );
}
