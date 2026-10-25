import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import {useEffect, useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import {ScenarioAction} from './ScenarioAction';

export function QuickMenu() {
  const {houseConfig} = useHouseContext();
  const [open, setOpen] = useState(false);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (!launched) return;
    const timeout = setTimeout(() => setLaunched(false), 1500);
    return () => clearTimeout(timeout);
  }, [launched]);

  const scenarios = houseConfig?.sideBar.scenarios;
  if (!scenarios?.length) return null;

  return (
    <SpeedDial
      ariaLabel="Menu rapide"
      direction="down"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      icon={
        launched ? (
          // data-testid explicite : MUI ne le pose qu'en développement.
          <CheckIcon data-testid="launched" />
        ) : (
          <SpeedDialIcon icon={<AutoAwesomeIcon />} openIcon={<CloseIcon />} />
        )
      }
      sx={{
        position: 'absolute',
        top: theme => theme.spacing(4),
        left: theme => theme.spacing(2),
        // Au-dessus des étiquettes et du chargeur de la vue 3D.
        zIndex: 1,
      }}
    >
      {scenarios.map(scriptEntityId => (
        <ScenarioAction
          key={scriptEntityId}
          scriptEntityId={scriptEntityId}
          onLaunch={() => {
            setOpen(false);
            setLaunched(true);
          }}
        />
      ))}
    </SpeedDial>
  );
}
