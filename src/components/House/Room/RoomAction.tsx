import {HassEntityWithService} from '@hakit/core';
import {motion} from 'framer-motion';
import {FloatingAction} from '../FloatingAction';
import {HouseConfig} from '../config';
import {RoomActionTemperature} from './RoomActionTemperature';
import {RoomActionMainLight} from './RoomActionMainLight';

type RoomActionProps = {
  id: string;
  room: (typeof HouseConfig)['rooms'][0];
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
      bgcolor="background.default"
      direction="row"
      borderRadius="50px"
      spacing={1}
      p={1}
    >
      <RoomActionTemperature id={id} room={room} />
      <RoomActionMainLight
        id={id}
        room={room}
        mainLight={mainLight}
        lights={lights}
      />
    </FloatingAction>
  );
}
