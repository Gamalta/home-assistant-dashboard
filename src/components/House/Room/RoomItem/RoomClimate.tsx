import {UNKNOWN, useEntity} from '@hakit/core';
import Button from '@mui/material/Button';
import {ClimateConfigType} from '../../../../configs/house';
import {useState} from 'react';
import {motion} from 'framer-motion';
import ClimateModal from '../../../Modal/ClimateModal';

type RoomClimateProps = {
  id: string;
  climateConfig: ClimateConfigType;
};

export function RoomClimate(props: RoomClimateProps) {
  const {id, climateConfig} = props;

  const [climateModal, setClimateModal] = useState(false);

  const climate = useEntity(climateConfig.climateEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
    historyOptions: {
      disable: false,
      hoursToShow: 24,
    },
  });

  if (!climate) return;
  return (
    <>
      <motion.div layoutId={`${id}-climate`}>
        <Button
          variant="contained"
          color="secondary"
          sx={{
            height: '100%',
            minWidth: 0,
            px: '6px',
          }}
          onClick={() => setClimateModal(true)}
        >
          {climate.state === UNKNOWN || !climate.attributes.current_temperature
            ? '--'
            : Math.floor(Number(climate.attributes.current_temperature))}
          °
        </Button>
      </motion.div>
      <ClimateModal
        id={`${id}-climate`}
        open={climateModal}
        onClose={() => setClimateModal(false)}
        climateConfig={climateConfig}
        climateEntity={climate}
        title="Climatisation"
      />
    </>
  );
}
