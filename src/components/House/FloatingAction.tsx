import Stack from '@mui/material/Stack';
import {ComponentProps, ElementType, ReactNode} from 'react';
import {useFloatingActionContext} from '../../contexts/FloatingAction';

type FloatingActionProps = {
  children: ReactNode;
  component?: ElementType;
  pos: {x: number; y: number};
} & ComponentProps<typeof Stack>;

const IMAGE_WIDTH = 2000;
const IMAGE_HEIGHT = 1333;
const IMAGE_RATIO = IMAGE_WIDTH / IMAGE_HEIGHT;

export const FloatingAction = (props: FloatingActionProps) => {
  const {children, component, pos, ...stackProps} = props;
  const {offsetHeight, offsetWidth, ratio} = useFloatingActionContext();

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (ratio > IMAGE_RATIO) {
    scale = offsetWidth / IMAGE_WIDTH;
    offsetY = (offsetHeight - IMAGE_HEIGHT * scale) / 2;
  } else {
    scale = offsetHeight / IMAGE_HEIGHT;
    offsetX = (offsetWidth - IMAGE_WIDTH * scale) / 2;
  }

  return (
    <Stack
      component={component ?? 'div'}
      position="absolute"
      zIndex={10}
      left={`${offsetX + (pos.x / 100) * IMAGE_WIDTH * scale}px`}
      top={`${offsetY + (pos.y / 100) * IMAGE_HEIGHT * scale}px`}
      sx={{transform: 'translate(-50%, -50%)'}}
      {...stackProps}
    >
      {children}
    </Stack>
  );
};
