import type {EntityName, FilterByDomain} from '@hakit/core';
import {useEntity} from '@hakit/core';
import BackIcon from '@mui/icons-material/ArrowBackRounded';
import AppsIcon from '@mui/icons-material/AppsRounded';
import DownIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LeftIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import RightIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import UpIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

// Commandes `remote.send_command` de l'intégration Apple TV (ADR 0028),
// placées sur une grille de 3 × 3.
const KEYS = [
  {label: 'Retour', command: 'menu', area: '1 / 1', icon: <BackIcon />},
  {label: 'Haut', command: 'up', area: '1 / 2', icon: <UpIcon />},
  {label: 'Menu', command: 'home', area: '1 / 3', icon: <AppsIcon />},
  {label: 'Gauche', command: 'left', area: '2 / 1', icon: <LeftIcon />},
  {label: 'OK', command: 'select', area: '2 / 2', icon: 'OK'},
  {label: 'Droite', command: 'right', area: '2 / 3', icon: <RightIcon />},
  {label: 'Bas', command: 'down', area: '3 / 2', icon: <DownIcon />},
];

type RemotePadProps = {
  entityId: FilterByDomain<EntityName, 'remote'>;
};

export function RemotePad(props: RemotePadProps) {
  const {entityId} = props;
  const remote = useEntity(entityId, {returnNullIfNotFound: true});

  if (!remote) return null;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplate: 'repeat(3, 56px) / repeat(3, 56px)',
        placeItems: 'center',
        alignSelf: 'center',
        bgcolor: 'background.tertiary',
        borderRadius: 2,
        p: 1,
      }}
    >
      {KEYS.map(key => (
        <IconButton
          key={key.command}
          aria-label={key.label}
          sx={{gridArea: key.area, fontSize: 16, fontWeight: 'bold'}}
          onClick={() =>
            remote.service.sendCommand({serviceData: {command: [key.command]}})
          }
        >
          {key.icon}
        </IconButton>
      ))}
    </Box>
  );
}
