import {useEntity, useHass} from '@hakit/core';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import {
  formatTemperatures,
  type Printer3dEntityIds,
} from '../../../utils/entity/printer3d';
import {BulbSultanIcon} from '../../Icons/BulbSultanIcon';

type PrinterViewProps = {
  ids: Printer3dEntityIds;
};

const options = {returnNullIfNotFound: true} as const;
const overlay = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
} as const;

export function PrinterView(props: PrinterViewProps) {
  const {ids} = props;
  const joinHassUrl = useHass(state => state.helpers.joinHassUrl);
  const light = useEntity(ids.chamberLight, options);
  const cover = useEntity(ids.coverImage, options);
  const nozzle = useEntity(ids.nozzleTemperature, options);
  const nozzleTarget = useEntity(ids.nozzleTargetTemperature, options);
  const bed = useEntity(ids.bedTemperature, options);
  const bedTarget = useEntity(ids.bedTargetTemperature, options);

  const lightOn = light?.state === 'on';
  const coverPicture = cover?.attributes.entity_picture;

  return (
    <Box sx={{position: 'relative', width: 260, flexShrink: 0}}>
      <img
        src="printer3d/p1s_off.png"
        alt="Imprimante 3D"
        style={{display: 'block', width: '100%'}}
      />
      {/* Les deux images restent chargées : l'éclairage s'allume en fondu. */}
      <img
        src="printer3d/p1s_on.png"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          opacity: lightOn ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />
      {coverPicture && (
        <Box
          component="img"
          src={joinHassUrl(coverPicture)}
          alt="Aperçu de l'impression"
          sx={{...overlay, top: '40%', width: '40%'}}
        />
      )}
      {light && (
        <IconButton
          aria-label="Lumière de la chambre"
          aria-pressed={lightOn}
          size="small"
          onClick={() => light.service.toggle()}
          sx={{
            position: 'absolute',
            top: '19%',
            left: '20%',
            bgcolor: 'secondary.main',
            color: lightOn ? 'primary.main' : 'text.primary',
            '&:hover': {bgcolor: 'secondary.dark'},
          }}
        >
          <BulbSultanIcon />
        </IconButton>
      )}
      <Chip
        size="small"
        label={`Buse ${formatTemperatures(nozzle?.state, nozzleTarget?.state)}`}
        sx={{...overlay, top: '32%'}}
      />
      <Chip
        size="small"
        label={`Plateau ${formatTemperatures(bed?.state, bedTarget?.state)}`}
        sx={{...overlay, top: '75%'}}
      />
    </Box>
  );
}
