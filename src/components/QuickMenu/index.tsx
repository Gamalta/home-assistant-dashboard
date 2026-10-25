import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import CartIcon from '@mui/icons-material/ShoppingCartRounded';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import {useEffect, useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import {ShoppingListModal} from '../Modal/ShoppingListModal';
import {ScenarioAction} from './ScenarioAction';

export function QuickMenu() {
  const {houseConfig} = useHouseContext();
  const [open, setOpen] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);

  useEffect(() => {
    if (!launched) return;
    const timeout = setTimeout(() => setLaunched(false), 1500);
    return () => clearTimeout(timeout);
  }, [launched]);

  const scenarios = houseConfig?.sideBar.scenarios ?? [];
  const shoppingListEntityId = houseConfig?.sideBar.shoppingListEntityId;
  if (!scenarios.length && !shoppingListEntityId) return null;

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
          launched ? (
            // data-testid explicite : MUI ne le pose qu'en développement.
            <CheckIcon data-testid="launched" />
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
          React, et le focus du champ de saisie rouvrirait le menu. */}
      {shoppingListEntityId && (
        <ShoppingListModal
          open={shoppingListOpen}
          onClose={() => setShoppingListOpen(false)}
          title="Courses"
          todoEntityId={shoppingListEntityId}
        />
      )}
    </>
  );
}
