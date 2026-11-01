import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import {useHouseContext} from '../../contexts/HouseContext';
import {PersonCard} from '../SideBar/PersonCard';
import {PetCard} from '../SideBar/PetCard';
import {Shortcuts} from '../SideBar/Shortcuts';
import {SettingsList} from './SettingsList';

type FoyerMenuProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

export function FoyerMenu(props: FoyerMenuProps) {
  const {anchorEl, onClose} = props;
  const {houseConfig} = useHouseContext();
  const sideBar = houseConfig?.sideBar;

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      transformOrigin={{vertical: 'top', horizontal: 'right'}}
      marginThreshold={12}
      // Les modales Système et Média s'ouvrent depuis le menu : il passe sous
      // elles (z-index 50) et leur laisse le focus.
      disableEnforceFocus
      sx={{zIndex: 40}}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-label': 'Foyer',
          sx: {
            mt: 1,
            p: 2,
            width: '100%',
            maxWidth: 'calc(100% - 24px)',
            // Sous les avatars (54 px sous la zone sûre, plus 8 px d'écart),
            // à 12 px de la barre d'accueil. Au-delà, le menu défile.
            maxHeight:
              'calc(100% - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 74px)',
            borderRadius: '24px',
          },
        },
      }}
    >
      <Stack spacing={2}>
        {sideBar?.persons && (
          <Stack direction="row" spacing={2}>
            <PersonCard person={sideBar.persons[0]} />
            <PersonCard person={sideBar.persons[1]} />
          </Stack>
        )}
        <PetCard pets={sideBar?.pets} />
        {sideBar?.shortcuts && (
          // Le carrousel prend la hauteur de son parent, comme dans la barre latérale.
          <Stack sx={{height: 220}}>
            <Shortcuts shortcuts={sideBar.shortcuts} />
          </Stack>
        )}
        <SettingsList />
      </Stack>
    </Popover>
  );
}
