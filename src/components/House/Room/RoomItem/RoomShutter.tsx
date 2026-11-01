import {useEntity} from '@hakit/core';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {ShutterConfigType} from '../../../../configs/house';
import {ShutterModal} from '../../../Modal/ShutterModal';
import {WindowIcon} from '../../../Icons/WindowIcon';
import Button from '@mui/material/Button';
import {shutterStateLabel} from '../../../../utils/entity/shutter';
import {Tile} from '../../../Mobile/Tile';
import type {ItemVariant} from '.';

type RoomShutterProps = {
  id: string;
  shutterConfig: ShutterConfigType;
  variant: ItemVariant;
};

export function RoomShutter(props: RoomShutterProps) {
  const {id, shutterConfig, variant} = props;
  const [shutterModal, setShutterModal] = useState(false);
  const shutter = useEntity(shutterConfig.shutterEntityId, {
    returnNullIfNotFound: true,
  });

  return (
    <>
      <motion.div layoutId={`layoutid-${id}`}>
        {variant === 'tile' ? (
          <Tile
            icon={<WindowIcon />}
            name={shutter?.attributes.friendly_name ?? 'Volet roulant'}
            state={shutterStateLabel(
              shutter?.state,
              shutter?.attributes.current_position,
            )}
            onClick={() => setShutterModal(true)}
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
            onClick={() => setShutterModal(true)}
          >
            <WindowIcon />
          </Button>
        )}
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
