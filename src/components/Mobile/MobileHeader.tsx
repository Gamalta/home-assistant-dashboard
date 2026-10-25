import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import {useNow} from '../../hooks/useNow';
import {FoyerSheet} from './FoyerSheet';
import {HeaderAvatar} from './HeaderAvatar';
import {MobileWeather} from './MobileWeather';

export function MobileHeader() {
  const {houseConfig} = useHouseContext();
  const sideBar = houseConfig?.sideBar;
  const now = useNow();
  const [foyer, setFoyer] = useState(false);

  const date = now.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const time = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Stack
      component="header"
      direction="row"
      sx={theme => ({
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        zIndex: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.75,
        py: 1.25,
        borderRadius: 3,
        // Translucide : la maison reste devinable sous l'en-tête.
        bgcolor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.primary} 90%, transparent)`,
      })}
    >
      <Stack>
        <Typography variant="h5" component="p" sx={{fontWeight: 500}}>
          {time}
        </Typography>
        <Typography variant="body2" color="primary">
          {date.charAt(0).toUpperCase() + date.slice(1)}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
        {sideBar?.weatherEntityId && (
          <MobileWeather weather={sideBar.weatherEntityId} />
        )}
        {sideBar?.persons && (
          <motion.div layoutId="foyer">
            <ButtonBase
              aria-label="Foyer"
              onClick={() => setFoyer(true)}
              sx={{p: 0.5, borderRadius: 5}}
            >
              {sideBar.persons.map((person, index) => (
                <HeaderAvatar
                  key={person.personEntityId}
                  person={person}
                  overlap={index > 0}
                />
              ))}
            </ButtonBase>
          </motion.div>
        )}
      </Stack>
      <FoyerSheet open={foyer} onClose={() => setFoyer(false)} />
    </Stack>
  );
}
