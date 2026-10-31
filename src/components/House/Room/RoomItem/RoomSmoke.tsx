import Button from '@mui/material/Button';
import {keyframes} from '@mui/material/styles';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {SmokeConfigType} from '../../../../configs/house';
import {useSmokeDetector} from '../../../../hooks/useSmokeDetector';
import {Leds} from '../../../../theme/Leds';
import {SMOKE_STATUSES} from '../../../../utils/entity/smoke';
import {BatteryLevelDisplay} from '../../../display/BatteryLevelDisplay';
import {SmokeDetectorIcon} from '../../../Icons/SmokeDetectorIcon';
import {Tile} from '../../../Mobile/Tile';
import type {ItemVariant} from '.';
import {SmokeModal} from '../../../Modal/SmokeModal';

type RoomSmokeProps = {
  id: string;
  smokeConfig: SmokeConfigType;
  variant: ItemVariant;
};

export function RoomSmoke(props: RoomSmokeProps) {
  const {id, smokeConfig, variant} = props;
  const [smokeModal, setSmokeModal] = useState(false);
  const {status, smoke, battery} = useSmokeDetector(smokeConfig);

  const alarm = status === 'smoke' || status === 'heat';
  const icon = (
    <SmokeDetectorIcon
      ledColor={alarm ? undefined : Leds[SMOKE_STATUSES[status].led].color}
    />
  );

  if (!smoke) return <></>;
  return (
    <>
      <motion.div layoutId={`layoutid-${id}`}>
        {variant === 'tile' ? (
          <Tile
            icon={icon}
            name="Détecteur de fumée"
            state={SMOKE_STATUSES[status].label}
            active={alarm}
            color={Leds.red.color}
            onClick={() => setSmokeModal(true)}
          />
        ) : (
          <Button
            variant="contained"
            color={alarm ? 'error' : 'secondary'}
            aria-label="Détecteur de fumée"
            sx={{
              height: '100%',
              minWidth: 0,
              px: '6px',
              gap: 0.5,
              // Animation de transform seule : le compositeur la gère sans repeindre.
              '& > svg': {
                animation: alarm ? `${pulse} 1s ease-in-out infinite` : '',
              },
            }}
            onClick={() => setSmokeModal(true)}
          >
            {icon}
            {alarm && (status === 'smoke' ? 'Fumée' : 'Chaleur')}
            {!alarm && battery && <BatteryLevelDisplay state={battery.state} />}
          </Button>
        )}
      </motion.div>
      <SmokeModal
        id={`layoutid-${id}`}
        open={smokeModal}
        onClose={() => setSmokeModal(false)}
        title="Détecteur de fumée"
        smokeConfig={smokeConfig}
      />
    </>
  );
}

const pulse = keyframes`
  50% {
    transform: scale(1.25);
  }
`;
