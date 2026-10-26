import {UNKNOWN, useEntity} from '@hakit/core';
import Button from '@mui/material/Button';
import {ClimateConfigType} from '../../../../configs/house';
import {useState} from 'react';
import {motion} from 'framer-motion';
import ClimateModal from '../../../Modal/ClimateModal';
import {ThermostatIcon} from '../../../Icons/ThermostatIcon';
import {climateStateLabel} from '../../../../utils/entity/climate';
import {Tile} from '../../../Mobile/Tile';
import type {ItemVariant} from '.';

type RoomClimateProps = {
  id: string;
  climateConfig: ClimateConfigType;
  variant: ItemVariant;
};

export function RoomClimate(props: RoomClimateProps) {
  const {id, climateConfig, variant} = props;

  const [climateModal, setClimateModal] = useState(false);

  const climate = useEntity(climateConfig.climateEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  if (!climate) return;
  return (
    <>
      <motion.div layoutId={`${id}-climate`}>
        {variant === 'tile' ? (
          <Tile
            icon={<ThermostatIcon />}
            name="Climat"
            state={climateStateLabel(
              climate.state,
              climate.attributes.temperature ?? undefined,
            )}
            active={climate.state !== 'off'}
            unavailable={climate.state === 'unavailable'}
            onClick={() => setClimateModal(true)}
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
            onClick={() => setClimateModal(true)}
          >
            {climate.state === UNKNOWN ||
            !climate.attributes.current_temperature
              ? '--'
              : Math.floor(Number(climate.attributes.current_temperature))}
            °
          </Button>
        )}
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
