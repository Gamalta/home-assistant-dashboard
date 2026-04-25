import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import {Modal, ModalProps} from '..';
import {Printer3DConfigType} from '../../../configs/house';
import {useEntity} from '@hakit/core';
import printer3dLightOn from '../../../assets/bambuLab/p1s_on.png';
import printer3dLightOff from '../../../assets/bambuLab/p1s_off.png';
import {BulbSultanIcon} from '../../Icons/BulbSultanIcon';

type Printer3dModalProps = Omit<ModalProps, 'children'> & {
  printer3dConfig: Printer3DConfigType;
};

export function Printer3dModal(props: Printer3dModalProps) {
  const {printer3dConfig, onClose, ...modalProps} = props;

  const chambreLightEntity = useEntity(
    printer3dConfig?.chambreLightEntity ?? 'unknown',
    {returnNullIfNotFound: true},
  );

  return (
    <Modal {...modalProps} onClose={onClose}>
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
        {chambreLightEntity && (
          <IconButton
            sx={{
              position: 'absolute',
              top: '45%',
              left: '5%',
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
      </Stack>
    </Modal>
  );
}
