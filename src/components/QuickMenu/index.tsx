import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import HouseIcon from '@mui/icons-material/HouseRounded';
import CartIcon from '@mui/icons-material/ShoppingCartRounded';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {useEffect, useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import {MortgageModal} from '../Modal/MortgageModal';
import {ShoppingListModal} from '../Modal/ShoppingListModal';
import {HeatmapAction} from './HeatmapAction';
import {ScenarioAction} from './ScenarioAction';

export function QuickMenu() {
  const {houseConfig} = useHouseContext();
  const [open, setOpen] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [mortgageOpen, setMortgageOpen] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);

  useEffect(() => {
    if (!launched) return;
    const timeout = setTimeout(() => setLaunched(false), 1500);
    return () => clearTimeout(timeout);
  }, [launched]);

  const scenarios = houseConfig?.sideBar.scenarios ?? [];
  const mortgages = houseConfig?.sideBar.mortgages ?? [];
  const shoppingListEntityId = houseConfig?.sideBar.shoppingListEntityId;

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
          // Sur téléphone, sous l'en-tête posé sur la vue 3D.
          top: {xs: 'calc(env(safe-area-inset-top) + 76px)', sm: '32px'},
          left: theme => theme.spacing(2),
          // Au-dessus des étiquettes et du chargeur de la vue 3D.
          zIndex: 1,
        }}
      >
        <HeatmapAction onToggle={() => setOpen(false)} />
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
        {mortgages.length > 0 && (
          <SpeedDialAction
            icon={<HouseIcon />}
            onClick={() => {
              setOpen(false);
              setMortgageOpen(true);
            }}
            slotProps={{
              tooltip: {title: 'Crédit', open: true, placement: 'right'},
            }}
          />
        )}
        {shoppingListEntityId && (
          <SpeedDialAction
            icon={<CartIcon />}
            onClick={() => {
              setOpen(false);
              setShoppingListOpen(true);
            }}
            slotProps={{
              tooltip: {title: 'Courses', open: true, placement: 'right'},
            }}
          />
        )}
      </SpeedDial>
      {/* Hors du SpeedDial : les événements d'un portail remontent l'arbre
          React, et le menu capterait les flèches et Échap des modales. */}
      {mortgages.length > 0 && (
        <MortgageModal
          id="layoutid-quick-menu"
          open={mortgageOpen}
          onClose={() => setMortgageOpen(false)}
          title="Crédit"
          entityIds={mortgages}
        />
      )}
      {shoppingListEntityId && (
        <ShoppingListModal
          id="layoutid-quick-menu"
          open={shoppingListOpen}
          onClose={() => setShoppingListOpen(false)}
          title="Courses"
          todoEntityId={shoppingListEntityId}
        />
      )}
    </>
  );
}
