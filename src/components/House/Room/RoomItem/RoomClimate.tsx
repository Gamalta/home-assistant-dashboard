import {UNKNOWN, useEntity} from '@hakit/core';
import Box from '@mui/material/Box';
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
  const degrees =
    climate.state === UNKNOWN || !climate.attributes.current_temperature
      ? '--'
      : Math.floor(Number(climate.attributes.current_temperature));
  const target =
    climate.state === 'off'
      ? undefined
      : climate.attributes.temperature?.toLocaleString('fr');
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
            // Chromium ne nomme pas un bouton qui contient un indice.
            aria-label={target && `${degrees}°, consigne ${target}°`}
          >
            {degrees}°
            {target && (
              <Box component="sub" sx={{fontSize: '0.75em', opacity: 0.8}}>
                /{target}°
              </Box>
            )}
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
