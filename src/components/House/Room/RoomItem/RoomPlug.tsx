import {useEntity} from '@hakit/core';
import PowerIcon from '@mui/icons-material/PowerRounded';
import Button from '@mui/material/Button';
import {motion} from 'framer-motion';
import {useState} from 'react';
import type {PlugConfigType} from '../../../../configs/house';
import {useLongPress} from '../../../../hooks/useLongPress';
import {formatPower, parsePower} from '../../../../utils/entity/plug';
import {PlugModal} from '../../../Modal/PlugModal';

type RoomPlugProps = {
  id: string;
  plugConfig: PlugConfigType;
};

export function RoomPlug(props: RoomPlugProps) {
  const {id, plugConfig} = props;
  const [plugModal, setPlugModal] = useState(false);

  const plug = useEntity(plugConfig.switchEntityId, {
    returnNullIfNotFound: true,
  });
  const powerSensor = useEntity(plugConfig.powerEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  const plugLongPress = useLongPress(
    () => setPlugModal(true),
    () => plug?.service.toggle(),
  );

  if (!plug) return <></>;
  const on = plug.state === 'on';
  const unavailable = plug.state === 'unavailable';
  const power = parsePower(powerSensor?.state);
  const name = plug.attributes.friendly_name ?? 'Prise';

  return (
    <>
      <motion.div layoutId={`${id}-plug`}>
        <Button
          variant="contained"
          color="secondary"
          aria-label={name}
          aria-pressed={on}
          sx={{
            height: '100%',
            minWidth: 0,
            px: '6px',
            gap: 0.5,
            ...(on && {color: 'primary.main'}),
            cursor: unavailable ? 'not-allowed' : 'pointer',
            opacity: unavailable ? 0.5 : 1,
          }}
          {...(!unavailable && plugLongPress)}
        >
          <PowerIcon />
          {on && power !== null && formatPower(power)}
        </Button>
      </motion.div>
      <PlugModal
        id={`${id}-plug`}
        open={plugModal}
        onClose={() => setPlugModal(false)}
        title={name}
        plug={plug}
        power={power}
        plugConfig={plugConfig}
      />
    </>
  );
}
