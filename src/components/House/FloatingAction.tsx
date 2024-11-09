import Stack from '@mui/material/Stack';
import {ComponentProps, ElementType, ReactNode} from 'react';

type FloatingActionProps = {
  children: ReactNode;
  component?: ElementType;
  pos: {x: number; y: number};
} & ComponentProps<typeof Stack>;

export const FloatingAction = (props: FloatingActionProps) => {
  const {children, component, pos, ...stackProps} = props;

  return (
    <Stack
      component={component ?? 'div'}
      position="absolute"
      zIndex={10}
      left={`${pos.x}%`}
      top={`${pos.y}%`}
      sx={{transform: 'translate(-50%, -50%)'}}
      {...stackProps}
    >
      {children}
    </Stack>
  );
};
