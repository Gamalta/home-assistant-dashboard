import Stack from '@mui/material/Stack';
import {useHouseContext} from '../../contexts/HouseContext';
import {Modal} from '../Modal';
import {PersonCard} from '../SideBar/PersonCard';
import {PetCard} from '../SideBar/PetCard';
import {Shortcuts} from '../SideBar/Shortcuts';
import {SettingsList} from './SettingsList';

type FoyerSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function FoyerSheet(props: FoyerSheetProps) {
  const {open, onClose} = props;
  const {houseConfig} = useHouseContext();
  const sideBar = houseConfig?.sideBar;

  return (
    <Modal id="foyer" title="Foyer" open={open} onClose={onClose}>
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
    </Modal>
  );
}
