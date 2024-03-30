import Stack from '@mui/material/Stack';
import {ReactNode} from 'react';

export function Container({children}: {children: ReactNode}) {
  return (
    <Stack
      position="absolute"
      zIndex={1}
      top="2rem"
      left="50%"
      maxHeight="calc(100% - 4rem)"
      alignItems="stretch"
      justifyContent="space-between"
      boxShadow="0px 0px 10px hsla(200, calc(var(50% * 0.8), 3%, 0.6)"
    >
      {children}
    </Stack>
  );
}
