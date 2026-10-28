import {useEntity} from '@hakit/core';
import Button from '@mui/material/Button';
import TvIcon from '@mui/icons-material/TvRounded';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {TvConfigType} from '../../../../configs/house';
import {useLongPress} from '../../../../hooks/useLongPress';
import {TvModal} from '../../../Modal/TvModal';

type RoomTvProps = {
  id: string;
  tvConfig: TvConfigType;
};

// Comme une lumière : un appui bascule l'ambilight, un appui long ouvre la modale.
export function RoomTv(props: RoomTvProps) {
  const {id, tvConfig} = props;
  const [tvModal, setTvModal] = useState(false);
  const light = useEntity(tvConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });
  const longPress = useLongPress(
    () => setTvModal(true),
    () => light?.service.toggle(),
  );

  if (!light) return <></>;
  const unavailable = light.state === 'unavailable';
  return (
    <>
      <motion.div layoutId={`${id}-tv`}>
        <Button
          variant="contained"
          color="secondary"
          aria-label="TV"
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
      <TvModal
        id={`${id}-tv`}
        open={tvModal}
        onClose={() => setTvModal(false)}
        title="TV"
        light={light}
        ledLayout={tvConfig.ledLayout}
      />
    </>
  );
}
