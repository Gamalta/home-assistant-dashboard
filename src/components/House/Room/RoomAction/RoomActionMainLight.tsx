import type {HouseConfigType} from '../../../../configs/house';
import {motion} from 'framer-motion';
import {alpha} from '@mui/material/styles';
import {PendantRoundIcon} from '../../../Icons/PendantRoundIcon';
import {LightModal} from '../../../Modal/Type/LightModal';
import {useRoomContext} from '../../../../contexts/RoomContext';
import {useLongPress} from '../../../../hooks/useLongPress';
import Button from '@mui/material/Button';

type RoomActionMainLightProps = {
  id: string;
  room: HouseConfigType['rooms'][0];
};

export function RoomActionMainLight(props: RoomActionMainLightProps) {
  const {id, room} = props;
  const {lightModalOpen, setLightModalOpen, mainLightEntity} = useRoomContext();

  const lightLongPress = useLongPress(
    () => setLightModalOpen(true),
    () => mainLightEntity?.service.toggle()
  );

  if (!mainLightEntity) return;

  return (
    <>
      <motion.div layoutId={`${id}-light`}>
        <Button
          variant="text"
          sx={{
            minWidth: 0,
            bgcolor: 'transparent',
            color:
              mainLightEntity.state === 'on'
                ? mainLightEntity.custom.hexColor
                : 'text.secondary',
            '&:hover': {
              bgcolor:
                mainLightEntity.state === 'on'
                  ? alpha(mainLightEntity.custom.hexColor, 0.8)
                  : undefined,
            },
          }}
          {...lightLongPress}
        >
          <PendantRoundIcon />
        </Button>
      </motion.div>
      <LightModal
        id={`${id}-light`}
        open={lightModalOpen}
        onClose={() => setLightModalOpen(false)}
        title={`Lumière ${room.name}`}
      />
    </>
  );
}
