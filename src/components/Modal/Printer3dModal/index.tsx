import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import {Modal, ModalProps} from '..';
import {Printer3DConfigType} from '../../../configs/house';
import {useEntity} from '@hakit/core';
import printer3dLightOn from '../../../assets/bambuLab/p1s_on.png';
import printer3dLightOff from '../../../assets/bambuLab/p1s_off.png';
import {BulbSultanIcon} from '../../Icons/BulbSultanIcon';
import {SignalDisplay} from '../../display/SignalDisplay';
import {AttributesDisplay} from '../../display/AttributesDisplay';

type Printer3dModalProps = Omit<ModalProps, 'children'> & {
  printer3dConfig: Printer3DConfigType;
};

export function Printer3dModal(props: Printer3dModalProps) {
  const {printer3dConfig, onClose, ...modalProps} = props;

  const chambreLightEntity = useEntity(
    printer3dConfig?.chambreLightEntity ?? 'unknown',
    {returnNullIfNotFound: true},
  );
  const wifiSignalEntity = useEntity(
    printer3dConfig?.wifiSignalEntity ?? 'unknown',
    {returnNullIfNotFound: true},
  );
  const bedTemperatureEntity = useEntity(
    printer3dConfig?.bedTemperatureEntities?.bedTemperatureEntity ?? 'unknown',
    {returnNullIfNotFound: true},
  );
  const bedTargetTemperatureEntity = useEntity(
    printer3dConfig?.bedTemperatureEntities?.bedTargetTemperatureEntity ??
      'unknown',
    {returnNullIfNotFound: true},
  );
  const nozzleTemperatureEntity = useEntity(
    printer3dConfig?.nozzleTemperatureEntities?.nozzleTemperatureEntity ??
      'unknown',
    {returnNullIfNotFound: true},
  );
  const nozzleTargetTemperatureEntity = useEntity(
    printer3dConfig?.nozzleTemperatureEntities?.nozzleTargetTemperatureEntity ??
      'unknown',
    {returnNullIfNotFound: true},
  );
  const coverImageEntity = useEntity(
    printer3dConfig?.coverImageEntity ?? 'unknown',
    {returnNullIfNotFound: true},
  );
  //TODO target nozzle temperature
  //TODO target bed temperature
  //TODO camera
  //TODO fan speed
  //TODO print speed
  //TODO print progress
  //TODO layers progress
  //TODO time remaining
  //TODO time elapsed
  //TODO filament type
  //TODO load unload filament
  //TODO pause / resume / stop print
  //TODO AMS

  return (
    <Modal
      {...modalProps}
      onClose={onClose}
      action={
        <Stack
          direction="row"
          spacing={1}
          sx={{
            borderRadius: 1,
            border: theme => `1px solid ${theme.palette.divider}`,
            p: 1,
          }}
        >
          <SignalDisplay signal={Number(wifiSignalEntity?.state ?? 0)} />
        </Stack>
      }
    >
      <Stack
        spacing={2}
        sx={{alignItems: 'center', mt: -2, maxWidth: 300, position: 'relative'}}
      >
        {chambreLightEntity?.state === 'on' ? (
          <img
            src={printer3dLightOn}
            alt="impriante 3D lumière allumée"
            style={{width: '100%'}}
          />
        ) : (
          <img
            src={printer3dLightOff}
            alt="impriante 3D lumière éteinte"
            style={{width: '100%'}}
          />
        )}
        {coverImageEntity?.attributes?.entity_picture && (
          <img
            src={`${import.meta.env.VITE_HA_URL}${coverImageEntity.attributes.entity_picture}`}
            alt="impriante 3D image de couverture"
            style={{
              width: '50%',
              position: 'absolute',
              top: '45%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
        {chambreLightEntity && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: '19%',
              left: '10%',
              transform: 'translate(50%, -50%)',
              backgroundColor: 'secondary.main',
              ...(chambreLightEntity.state === 'on' && {
                color: '#ffb300',
              }),
              marginTop: 0,
              '&:hover': {
                backgroundColor: 'secondary.dark',
              },
            }}
            onClick={() => chambreLightEntity.service.toggle()}
          >
            <BulbSultanIcon />
          </IconButton>
        )}
        {nozzleTemperatureEntity && (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            sx={{
              position: 'absolute',
              top: '19%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {`${nozzleTemperatureEntity.state}°C`}
          </Button>
        )}
        {bedTemperatureEntity && (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            sx={{
              position: 'absolute',
              bottom: '10%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {`${bedTemperatureEntity.state}°C`}
          </Button>
        )}
      </Stack>
    </Modal>
  );
}
