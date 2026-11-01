import {useEntity} from '@hakit/core';
import Button from '@mui/material/Button';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {VacuumConfigType} from '../../../../configs/house';
import {
  isCleaningActive,
  vacuumEntityIds,
  vacuumStateLabel,
} from '../../../../utils/entity/vacuum';
import {Tile} from '../../../Mobile/Tile';
import type {ItemVariant} from '.';
import {RobotVacuumIcon} from '../../../Icons/RobotVacuumIcon';
import {VacuumModal} from '../../../Modal/VacuumModal';

type RoomVacuumProps = {
  id: string;
  vacuumConfig: VacuumConfigType;
  variant: ItemVariant;
};

export function RoomVacuum(props: RoomVacuumProps) {
  const {id, vacuumConfig, variant} = props;
  const [vacuumModal, setVacuumModal] = useState(false);

  const ids = vacuumEntityIds(vacuumConfig.prefix);
  const vacuum = useEntity(ids.vacuum, {returnNullIfNotFound: true});

  if (!vacuum) return <></>;
  const cleaning = isCleaningActive(vacuum.state);
  const progress = vacuum.attributes.cleaning_progress;
  const percent = progress === undefined ? '' : `${progress}%`;
  return (
    <>
      <motion.div layoutId={`layoutid-${id}`}>
        {variant === 'tile' ? (
          <Tile
            icon={<RobotVacuumIcon />}
            name="Aspirateur"
            state={
              cleaning && percent
                ? percent
                : vacuumStateLabel(
                    vacuum.attributes.vacuum_state ?? vacuum.state,
                  )
            }
            active={cleaning}
            onClick={() => setVacuumModal(true)}
          />
        ) : (
          <Button
            variant="contained"
            color="secondary"
            aria-label="Aspirateur"
            sx={{height: '100%', minWidth: 0, px: '6px', gap: 0.5}}
            onClick={() => setVacuumModal(true)}
          >
            <RobotVacuumIcon />
            {cleaning && percent}
          </Button>
        )}
      </motion.div>
      <VacuumModal
        id={`layoutid-${id}`}
        open={vacuumModal}
        onClose={() => setVacuumModal(false)}
        title="Aspirateur"
        ids={ids}
      />
    </>
  );
}
