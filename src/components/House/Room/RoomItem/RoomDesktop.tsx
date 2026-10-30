import {motion} from 'framer-motion';
import {DestkopConfigType} from '../../../../configs/house';
import ComputerIcon from '@mui/icons-material/Computer';
import {useState} from 'react';
import {DesktopModal} from '../../../Modal/DesktopModal';
import Button from '@mui/material/Button';
import {Tile} from '../../../Mobile/Tile';
import type {ItemVariant} from '.';

type RoomDesktopProps = {
  id: string;
  desktopConfig: DestkopConfigType;
  variant: ItemVariant;
};

export function RoomDesktop(props: RoomDesktopProps) {
  const {id, desktopConfig, variant} = props;
  const [desktopModal, setDesktopModal] = useState(false);

  return (
    <>
      <motion.div layoutId={`layoutid-${id}`}>
        {variant === 'tile' ? (
          <Tile
            icon={<ComputerIcon />}
            name="Ordinateur"
            state="Commandes"
            onClick={() => setDesktopModal(true)}
          />
        ) : (
          <Button
            variant="contained"
            color="secondary"
            sx={{
              height: '100%',
              minWidth: 0,
              px: '6px',
            }}
            onClick={() => setDesktopModal(true)}
          >
            <ComputerIcon />
          </Button>
        )}
      </motion.div>
      <DesktopModal
        id={`layoutid-${id}`}
        open={desktopModal}
        onClose={() => setDesktopModal(false)}
        title="Ordinateur"
        desktopConfig={desktopConfig}
      />
    </>
  );
}
