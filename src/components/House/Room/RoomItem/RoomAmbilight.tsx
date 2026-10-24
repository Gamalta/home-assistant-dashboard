import {useEntity} from '@hakit/core';
import Button from '@mui/material/Button';
import TvIcon from '@mui/icons-material/TvRounded';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {AmbilightConfigType} from '../../../../configs/house';
import {useLongPress} from '../../../../hooks/useLongPress';
import {AmbilightModal} from '../../../Modal/AmbilightModal';

type RoomAmbilightProps = {
  id: string;
  ambilightConfig: AmbilightConfigType;
};

// Comme une lumière : un appui bascule, un appui long ouvre la modale.
export function RoomAmbilight(props: RoomAmbilightProps) {
  const {id, ambilightConfig} = props;
  const [ambilightModal, setAmbilightModal] = useState(false);
  const light = useEntity(ambilightConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });
  const longPress = useLongPress(
    () => setAmbilightModal(true),
    () => light?.service.toggle(),
  );

  if (!light) return <></>;
  const unavailable = light.state === 'unavailable';
  return (
    <>
      <motion.div layoutId={`${id}-ambilight`}>
        <Button
          variant="contained"
          color="secondary"
          aria-label="Ambilight"
          sx={{
            height: '100%',
            minWidth: 0,
            px: '6px',
            ...(light.state === 'on' && {
              color: `rgb(${(light.custom.color ?? [255, 255, 255]).join(',')})`,
            }),
            cursor: unavailable ? 'not-allowed' : 'pointer',
            opacity: unavailable ? 0.5 : 1,
          }}
          {...(!unavailable && longPress)}
        >
          <TvIcon />
        </Button>
      </motion.div>
      <AmbilightModal
        id={`${id}-ambilight`}
        open={ambilightModal}
        onClose={() => setAmbilightModal(false)}
        title="Ambilight"
        light={light}
      />
    </>
  );
}
