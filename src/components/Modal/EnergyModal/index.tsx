import {Modal, ModalProps} from '..';
import type {EnergyConfigType} from '../../../configs/sidebar';
import {EnergyModalContent} from './EnergyModalContent';

type EnergyModalProps = Omit<ModalProps, 'children'> & {
  energyConfig: EnergyConfigType;
};

export function EnergyModal(props: EnergyModalProps) {
  const {energyConfig, ...modalProps} = props;

  return (
    <Modal {...modalProps}>
      <EnergyModalContent energyConfig={energyConfig} />
    </Modal>
  );
}
