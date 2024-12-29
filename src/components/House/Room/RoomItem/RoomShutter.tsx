import {motion} from 'framer-motion';
import {useState} from 'react';
import {ShutterConfigType} from '../../../../configs/house';
import {ShutterModal} from '../../../Modal/ShutterModal';
import {WindowIcon} from '../../../Icons/WindowIcon';
import Button from '@mui/material/Button';

type RoomShutterProps = {
  id: string;
  shutterConfig: ShutterConfigType;
};

export function RoomShutter(props: RoomShutterProps) {
  const {id, shutterConfig} = props;
  const [shutterModal, setShutterModal] = useState(false);

  return (
    <>
      <motion.div layoutId={`layoutid-${id}`}>
        <Button
          variant="contained"
          color="secondary"
          sx={{
            height: '100%',
            minWidth: 0,
            px: '6px',
          }}
          onClick={() => setShutterModal(true)}
        >
          <WindowIcon />
        </Button>
      </motion.div>
      <ShutterModal
        id={`layoutid-${id}`}
        open={shutterModal}
        onClose={() => setShutterModal(false)}
        title="Volet roulant"
        shutterConfig={shutterConfig}
      />
    </>
  );
}
