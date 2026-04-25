import {motion} from 'framer-motion';
import {Printer3DConfigType} from '../../../../configs/house';
import {useState} from 'react';
import Button from '@mui/material/Button';
import {Printer3dModal} from '../../../Modal/Printer3dModal';
import {Printer3dIcon} from '../../../Icons/Printer3dIcon';

type RoomPrinter3dProps = {
  id: string;
  printerConfig: Printer3DConfigType;
};

export function RoomPrinter3d(props: RoomPrinter3dProps) {
  const {id, printerConfig} = props;
  const [printerModal, setPrinterModal] = useState(false);

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
          onClick={() => setPrinterModal(true)}
        >
          <Printer3dIcon />
        </Button>
      </motion.div>
      <Printer3dModal
        id={`layoutid-${id}`}
        open={printerModal}
        onClose={() => setPrinterModal(false)}
        title="Imprimante 3D"
        printer3dConfig={printerConfig}
      />
    </>
  );
}
