import {HassEntityWithService} from '@hakit/core';
import {motion} from 'framer-motion';
import {FloatingAction} from '../FloatingAction';
import type {HouseConfigType} from '../../../configs/house';
import {RoomActionTemperature} from './RoomActionTemperature';
import {RoomActionMainLight} from './RoomActionMainLight';
import Divider from '@mui/material/Divider';
import {Stack} from '@mui/material';

type RoomActionProps = {
  id: string;
  room: HouseConfigType['rooms'][0];
  position: {x: number; y: number};
  mainLight?: HassEntityWithService<'light'>;
  lights?: HassEntityWithService<'light'>[];
};

export function RoomAction(props: RoomActionProps) {
  const {id, room, position, mainLight, lights} = props;

  return (
    <FloatingAction
      component={motion.div}
      pos={position}
      bgcolor="background.paper"
      direction="row"
      borderRadius="50px"
    >
      <RoomActionTemperature id={id} room={room} />
      {room.temperature && room.main_light && (
        <Stack py={1}>
          <Divider orientation="vertical" />
        </Stack>
      )}
      <RoomActionMainLight
        id={id}
        room={room}
        mainLight={mainLight}
        lights={lights}
      />
    </FloatingAction>
  );
}
