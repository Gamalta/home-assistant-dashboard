import Stack from '@mui/material/Stack';
import {AnimatePresence, motion} from 'framer-motion';
import {useAppContext} from '../../contexts/AppContext';
import {useHouseContext} from '../../contexts/HouseContext';
import {useIdle} from '../../hooks/useIdle';
import {ScreensaverAlerts} from './ScreensaverAlerts';
import {ScreensaverClock} from './ScreensaverClock';
import {ScreensaverSky} from './ScreensaverSky';
import {ScreensaverTrains} from './ScreensaverTrains';
import {ScreensaverWeather} from './ScreensaverWeather';

export function Screensaver() {
  const {configuration} = useAppContext();
  const {houseConfig} = useHouseContext();
  const sideBar = houseConfig?.sideBar;
  const [idle, wake] = useIdle(configuration.screensaverMinutes * 60_000);

  return (
    <AnimatePresence>
      {idle && (
        <Stack
          component={motion.div}
          role="button"
          aria-label="Réveiller l'écran"
          className="dark"
          onClick={wake}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 1}}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: theme => theme.zIndex.tooltip + 1,
            color: 'text.primary',
            cursor: 'pointer',
          }}
        >
          <ScreensaverSky>
            <ScreensaverClock />
            <Stack
              direction="row"
              useFlexGap
              spacing={3}
              sx={{
                justifyContent: 'center',
                alignItems: 'stretch',
              }}
            >
              {sideBar?.shortcuts?.map(
                (shortcut, index) =>
                  shortcut.type === 'trains' && (
                    <ScreensaverTrains key={index} trains={shortcut} />
                  ),
              )}
              {sideBar && (
                <ScreensaverWeather weather={sideBar.weatherEntityId} />
              )}
              {sideBar?.alerts && <ScreensaverAlerts alerts={sideBar.alerts} />}
            </Stack>
          </ScreensaverSky>
        </Stack>
      )}
    </AnimatePresence>
  );
}
