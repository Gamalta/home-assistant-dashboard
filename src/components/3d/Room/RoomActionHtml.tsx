import {HassEntityWithService} from '@hakit/core';
import {useRoomContext} from '../../../contexts/RoomContext';
import {useLongPress} from '../../../hooks/useLongPress';
import {motion} from 'framer-motion';
import Stack from '@mui/material/Stack';
import {Html} from '../Html';
import Fab from '@mui/material/Fab';
import {ThermostatIcon} from '../../Icons/ThermostatIcon';
import {TemperatureModal} from '../../Modal/Type/TemperatureModal';
import {alpha} from '@mui/material/styles';
import {PendantRoundIcon} from '../../Icons/PendantRoundIcon';
import {LightModal} from '../../Modal/Type/LightModal';

type RoomActionHtmlProps = {
  id: string;
  name: string;
  temperature?: HassEntityWithService<'sensor'>;
  mainLight?: HassEntityWithService<'light'>;
  lights?: HassEntityWithService<'light'>[];
};

export function RoomActionHtml(props: RoomActionHtmlProps) {
  const {id, name, temperature, mainLight, lights} = props;
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
    <Html>
      <Stack
        component={motion.div}
        bgcolor="background.default"
        direction="row"
        borderRadius="50px"
        spacing={2}
        p={1}
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
      </Stack>
    </Html>
  );
}
