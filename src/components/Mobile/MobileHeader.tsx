import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import {FoyerSheet} from './FoyerSheet';
import {HeaderAvatar} from './HeaderAvatar';
import {MobileView, ViewToggle} from './ViewToggle';

type MobileHeaderProps = {
  view: MobileView;
  onViewChange: (view: MobileView) => void;
};

export function MobileHeader(props: MobileHeaderProps) {
  const {view, onViewChange} = props;
  const {houseConfig} = useHouseContext();
  const persons = houseConfig?.sideBar.persons;
  const [foyer, setFoyer] = useState(false);

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
        p: 1,
        borderRadius: 3,
        // Translucide : la maison reste devinable sous l'en-tête.
        bgcolor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.primary} 90%, transparent)`,
      })}
    >
      <ViewToggle value={view} onChange={onViewChange} />
      {persons && (
        <motion.div layoutId="foyer">
          <ButtonBase
            aria-label="Foyer"
            onClick={() => setFoyer(true)}
            sx={{p: 0.5, borderRadius: 5}}
          >
            {persons.map((person, index) => (
              <HeaderAvatar
                key={person.personEntityId}
                person={person}
                overlap={index > 0}
              />
            ))}
          </ButtonBase>
        </motion.div>
      )}
      <FoyerSheet open={foyer} onClose={() => setFoyer(false)} />
    </Stack>
  );
}
