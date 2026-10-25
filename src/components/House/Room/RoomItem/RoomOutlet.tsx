import {useEntity} from '@hakit/core';
import PowerIcon from '@mui/icons-material/PowerRounded';
import Button from '@mui/material/Button';
import {motion} from 'framer-motion';
import {useState} from 'react';
import type {OutletConfigType} from '../../../../configs/house';
import {useLongPress} from '../../../../hooks/useLongPress';
import {parsePower} from '../../../../utils/entity/outlet';
import {OutletModal} from '../../../Modal/OutletModal';

type RoomOutletProps = {
  id: string;
  outletConfig: OutletConfigType;
};

export function RoomOutlet(props: RoomOutletProps) {
  const {id, outletConfig} = props;
  const [outletModal, setOutletModal] = useState(false);

  const outlet = useEntity(outletConfig.switchEntityId, {
    returnNullIfNotFound: true,
  });
  const powerSensor = useEntity(outletConfig.powerEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  const outletLongPress = useLongPress(
    () => setOutletModal(true),
    () => outlet?.service.toggle(),
  );

  if (!outlet) return <></>;
  const on = outlet.state === 'on';
  const unavailable = outlet.state === 'unavailable';
  const power = parsePower(powerSensor?.state);
  const name = outlet.attributes.friendly_name ?? 'Prise';

  return (
    <>
      <motion.div layoutId={`${id}-outlet`}>
        <Button
          variant="contained"
          color="secondary"
          aria-label={name}
          aria-pressed={on}
          sx={{
            height: '100%',
            minWidth: 0,
            px: '6px',
            ...(on && {color: 'primary.main'}),
            cursor: unavailable ? 'not-allowed' : 'pointer',
            opacity: unavailable ? 0.5 : 1,
          }}
          {...(!unavailable && outletLongPress)}
        >
          <PowerIcon />
        </Button>
      </motion.div>
      <OutletModal
        id={`${id}-outlet`}
        open={outletModal}
        onClose={() => setOutletModal(false)}
        title={name}
        outlet={outlet}
        power={power}
        outletConfig={outletConfig}
      />
    </>
  );
}
