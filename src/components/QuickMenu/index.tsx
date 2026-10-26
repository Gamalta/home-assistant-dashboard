import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import HouseIcon from '@mui/icons-material/HouseRounded';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {useEffect, useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import {MortgageModal} from '../Modal/MortgageModal';
import {ScenarioAction} from './ScenarioAction';

export function QuickMenu() {
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
        ariaLabel="Menu rapide"
        direction="down"
        open={open}
        // Au toucher seulement, sans survol : après un appui, Chromium sous
        // Linux ramène la souris à sa dernière position, ce qui refermait le menu.
        onOpen={(_, reason) => reason === 'toggle' && setOpen(true)}
        onClose={(_, reason) => reason !== 'mouseLeave' && setOpen(false)}
        icon={
          // Les modales du menu grandissent depuis ce bouton et s'y résorbent.
          <Stack component={motion.span} layoutId="layoutid-quick-menu">
            {launched ? (
              // data-testid explicite : MUI ne le pose qu'en développement.
              <CheckIcon data-testid="launched" />
            ) : (
              <SpeedDialIcon
                open={open}
                icon={<AutoAwesomeIcon />}
                openIcon={<CloseIcon />}
              />
            )}
          </Stack>
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
          React, et le menu capterait les flèches et Échap de la modale. */}
      {mortgages.map((mortgage, index) => (
        <MortgageModal
          key={index}
          id="layoutid-quick-menu"
          open={index === mortgageIndex}
          onClose={() => setMortgageIndex(undefined)}
          title={mortgage.label ?? 'Crédit'}
          mortgage={mortgage}
        />
      ))}
    </>
  );
}
