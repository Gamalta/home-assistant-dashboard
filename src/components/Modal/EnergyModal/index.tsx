import {Modal, ModalProps} from '..';
import type {EnergyShortcutConfigType} from '../../../configs/sidebar';
import {EnergyModalContent} from './EnergyModalContent';

type EnergyModalProps = Omit<ModalProps, 'children'> & {
  shortcutConfig: EnergyShortcutConfigType;
};

export function EnergyModal(props: EnergyModalProps) {
  const {shortcutConfig, ...modalProps} = props;

  return (
    <Modal {...modalProps}>
      <EnergyModalContent shortcutConfig={shortcutConfig} />
    </Modal>
  );
}
