import Stack from '@mui/material/Stack';
import {ComponentProps, ElementType, forwardRef, ReactNode} from 'react';

type FloatingActionProps = {
  children?: ReactNode;
  component?: ElementType;
  position: {x: number; y: number};
} & Omit<ComponentProps<typeof Stack>, 'position'>;

export const FloatingAction = forwardRef<HTMLDivElement, FloatingActionProps>(
  ({children, component, position, ...stackProps}, ref) => {
    return (
      <Stack
        ref={ref}
        component={component ?? 'div'}
        position="absolute"
        zIndex={10}
        left={`${position.x}%`}
        top={`${position.y}%`}
        sx={{transform: 'translate(-50%, -50%)'}}
        {...stackProps}
      >
        {children}
      </Stack>
    );
  }
);
