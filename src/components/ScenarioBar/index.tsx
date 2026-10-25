import Stack from '@mui/material/Stack';
import {useHouseContext} from '../../contexts/HouseContext';
import {ScenarioButton} from './ScenarioButton';

export function ScenarioBar() {
  const {houseConfig} = useHouseContext();
  const scenarios = houseConfig?.sideBar.scenarios;
  if (!scenarios?.length) return null;

  return (
    <Stack
      component="nav"
      aria-label="Scénarios"
      spacing={0.5}
      sx={{
        position: 'absolute',
        top: theme => theme.spacing(4),
        left: 0,
        // Au-dessus des étiquettes et du chargeur de la vue 3D.
        zIndex: 1,
        p: 0.5,
        bgcolor: 'background.primary',
        // Prolonge la barre latérale, comme le séparateur.
        borderRadius: '0 16px 16px 0',
      }}
    >
      {scenarios.map(scriptEntityId => (
        <ScenarioButton key={scriptEntityId} scriptEntityId={scriptEntityId} />
      ))}
    </Stack>
  );
}
