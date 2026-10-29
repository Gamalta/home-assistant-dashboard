import {useEntity} from '@hakit/core';
import Button from '@mui/material/Button';
import TvIcon from '@mui/icons-material/TvRounded';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {TvConfigType} from '../../../../configs/house';
import {useLongPress} from '../../../../hooks/useLongPress';
import {ambilightStateLabel} from '../../../../utils/entity/ambilight';
import {lightColor} from '../../../../utils/entity/light';
import {readableOn} from '../../../../utils/color';
import {Tile} from '../../../Mobile/Tile';
import type {ItemVariant} from '.';
import {TvModal} from '../../../Modal/TvModal';

type RoomTvProps = {
  id: string;
  tvConfig: TvConfigType;
  variant: ItemVariant;
};

// Comme une lumière : un appui bascule l'ambilight, un appui long ouvre la modale.
export function RoomTv(props: RoomTvProps) {
  const {id, tvConfig, variant} = props;
  const [tvModal, setTvModal] = useState(false);
  const light = useEntity(tvConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });
  const longPress = useLongPress(
    () => setTvModal(true),
    () => light?.service.toggle(),
  );

  if (!light) return <></>;
  const on = light.state === 'on';
  const unavailable = light.state === 'unavailable';
  return (
    <>
      <motion.div layoutId={`${id}-tv`}>
        {variant === 'tile' ? (
          <Tile
            icon={<TvIcon />}
            name="TV"
            state={ambilightStateLabel(
              light.state,
              light.attributes.brightness,
            )}
            active={on}
            aria-pressed={on}
            color={`rgb(${lightColor(light).join(',')})`}
            iconColor={readableOn(lightColor(light))}
            unavailable={unavailable}
            {...(!unavailable && longPress)}
          />
        ) : (
          <Button
            variant="contained"
            color="secondary"
            aria-label="TV"
            sx={{
              height: '100%',
              minWidth: 0,
              px: '6px',
              ...(on && {
                color: `rgb(${(light.custom.color ?? [255, 255, 255]).join(',')})`,
              }),
              cursor: unavailable ? 'not-allowed' : 'pointer',
              opacity: unavailable ? 0.5 : 1,
            }}
            {...(!unavailable && longPress)}
          >
            <TvIcon />
          </Button>
        )}
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
