import {useEntity} from '@hakit/core';
import Button from '@mui/material/Button';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {Printer3dConfigType} from '../../../../configs/house';
import {
  isPrintActive,
  printer3dEntityIds,
} from '../../../../utils/entity/printer3d';
import {Printer3dIcon} from '../../../Icons/Printer3dIcon';
import {Printer3dModal} from '../../../Modal/Printer3dModal';

type RoomPrinter3dProps = {
  id: string;
  printer3dConfig: Printer3dConfigType;
};

export function RoomPrinter3d(props: RoomPrinter3dProps) {
  const {id, printer3dConfig} = props;
  const [printerModal, setPrinterModal] = useState(false);

  const ids = printer3dEntityIds(printer3dConfig.prefix);
  const status = useEntity(ids.status, {returnNullIfNotFound: true});
  const progress = useEntity(ids.progress, {returnNullIfNotFound: true});

  if (!status) return <></>;
  return (
    <>
      <motion.div layoutId={`layoutid-${id}`}>
        <Button
          variant="contained"
          color="secondary"
          aria-label="Imprimante 3D"
          sx={{height: '100%', minWidth: 0, px: '6px', gap: 0.5}}
          onClick={() => setPrinterModal(true)}
        >
          <Printer3dIcon />
          {isPrintActive(status.state) && `${progress?.state ?? '--'}%`}
        </Button>
      </motion.div>
      <Printer3dModal
        id={`layoutid-${id}`}
        open={printerModal}
        onClose={() => setPrinterModal(false)}
        title="Imprimante 3D"
        ids={ids}
      />
    </>
  );
}
