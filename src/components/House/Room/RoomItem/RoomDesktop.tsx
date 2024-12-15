import {FloatingAction} from '../../FloatingAction';
import Button from '@mui/material/Button';
import {motion} from 'framer-motion';
import {DestkopConfigType} from '../../../../configs/house';
import ComputerIcon from '@mui/icons-material/Computer';
import {useState} from 'react';
import {DesktopModal} from '../../../Modal/DesktopModal';

type RoomDesktopProps = {
  id: string;
  desktopConfig: DestkopConfigType;
};

export function RoomDesktop(props: RoomDesktopProps) {
  const {id, desktopConfig} = props;
  const [desktopModal, setDesktopModal] = useState(false);

  return (
    <FloatingAction
      pos={desktopConfig?.position ?? {x: 0, y: 0}}
      bgcolor="background.paper"
      borderRadius="50%"
    >
      <motion.div layoutId={`layoutid-${id}`}>
        <Button
          variant="text"
          sx={{
            minWidth: 0,
            bgcolor: 'transparent',
            color: 'text.secondary',
          }}
          onClick={() => setDesktopModal(true)}
        >
          <ComputerIcon />
        </Button>
      </motion.div>
      <DesktopModal
        id={`layoutid-${id}`}
        open={desktopModal}
        onClose={() => setDesktopModal(false)}
        title="Ordinateur"
        desktopConfig={desktopConfig}
      />
    </FloatingAction>
  );
}
