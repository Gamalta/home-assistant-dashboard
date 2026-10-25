import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import HouseIcon from '@mui/icons-material/HouseRounded';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import {useEffect, useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import {MortgageModal} from '../Modal/MortgageModal';
import {ScenarioAction} from './ScenarioAction';

export function ScenarioBar() {
  const {houseConfig} = useHouseContext();
  const [open, setOpen] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [mortgageIndex, setMortgageIndex] = useState<number>();

  useEffect(() => {
    if (!launched) return;
    const timeout = setTimeout(() => setLaunched(false), 1500);
    return () => clearTimeout(timeout);
  }, [launched]);

  const scenarios = houseConfig?.sideBar.scenarios ?? [];
  const mortgages = houseConfig?.sideBar.mortgages ?? [];
  if (!scenarios.length && !mortgages.length) return null;

  return (
    <>
      <SpeedDial
        ariaLabel="Scénarios"
        direction="down"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        icon={
          launched ? (
            // data-testid explicite : MUI ne le pose qu'en développement.
            <CheckIcon data-testid="coche" />
          ) : (
            <SpeedDialIcon
              icon={<AutoAwesomeIcon />}
              openIcon={<CloseIcon />}
            />
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
        {mortgages.map((mortgage, index) => (
          <SpeedDialAction
            key={index}
            icon={<HouseIcon />}
            onClick={() => {
              setOpen(false);
              setMortgageIndex(index);
            }}
            slotProps={{
              tooltip: {
                title: mortgage.label ?? 'Crédit',
                open: true,
                placement: 'right',
              },
            }}
          />
        ))}
      </SpeedDial>
      {/* Hors du SpeedDial : les événements d'un portail remontent l'arbre
          React, et le focus d'un bouton de la modale rouvrirait le menu. */}
      {mortgages.map((mortgage, index) => (
        <MortgageModal
          key={index}
          open={index === mortgageIndex}
          onClose={() => setMortgageIndex(undefined)}
          title={mortgage.label ?? 'Crédit'}
          mortgage={mortgage}
        />
      ))}
    </>
  );
}
