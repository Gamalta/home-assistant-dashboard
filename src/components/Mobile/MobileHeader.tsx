import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import {FoyerMenu} from './FoyerMenu';
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
  const [foyer, setFoyer] = useState<HTMLElement | null>(null);

  return (
    <Stack
      component="header"
      direction="row"
      sx={theme => ({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        // Deux îlots, sous l'encoche et l'heure du téléphone.
        pt: 'calc(env(safe-area-inset-top) + 8px)',
        px: 1.5,
        pb: 1,
        // Voile : l'heure reste lisible sur la 3D, et la liste s'efface sous
        // les îlots.
        background: `linear-gradient(color-mix(in srgb, ${(theme.vars ?? theme).palette.background.default} 90%, transparent) env(safe-area-inset-top), transparent)`,
        // Entre les îlots, les gestes vont à la scène 3D.
        pointerEvents: 'none',
        '& > *': {pointerEvents: 'auto'},
      })}
    >
      <ViewToggle value={view} onChange={onViewChange} />
      {persons && (
        <ButtonBase
          aria-label="Foyer"
          onClick={event => setFoyer(event.currentTarget)}
          sx={{p: 0.5, borderRadius: 50, bgcolor: 'background.paper'}}
        >
          {persons.map((person, index) => (
            <HeaderAvatar
              key={person.personEntityId}
              person={person}
              overlap={index > 0}
            />
          ))}
        </ButtonBase>
      )}
      <FoyerMenu anchorEl={foyer} onClose={() => setFoyer(null)} />
    </Stack>
  );
}
