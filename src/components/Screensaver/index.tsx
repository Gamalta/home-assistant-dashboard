import Stack from '@mui/material/Stack';
import {AnimatePresence, motion} from 'framer-motion';
import {useAppContext} from '../../contexts/AppContext';
import {useIdle} from '../../hooks/useIdle';
import {ScreensaverClock} from './ScreensaverClock';

export function Screensaver() {
  const {configuration} = useAppContext();
  const [idle, wake] = useIdle(configuration.screensaverMinutes * 60_000);

  return (
    <AnimatePresence>
      {idle && (
        // Réveil au clic, pas au pointerdown : l'écran de veille reste sous le
        // doigt jusqu'au relâcher, et l'appui n'actionne rien en dessous.
        <Stack
          component={motion.div}
          role="button"
          aria-label="Réveiller l'écran"
          onClick={wake}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 1}}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: theme => theme.zIndex.tooltip + 1,
            bgcolor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <ScreensaverClock />
        </Stack>
      )}
    </AnimatePresence>
  );
}
