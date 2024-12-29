import {motion} from 'framer-motion';
import {forwardRef, RefObject} from 'react';
import {FloatingAction} from '../FloatingAction';

type RoomActionProps = {
  ref: RefObject<HTMLDivElement>;
  position: {x: number; y: number};
};

export const RoomAction = forwardRef<HTMLDivElement, RoomActionProps>(
  ({position}, ref) => {
    return (
      <FloatingAction
        ref={ref}
        component={motion.div}
        position={position}
        bgcolor="background.paper"
        direction="row"
        borderRadius="50px"
      />
    );
  }
);
