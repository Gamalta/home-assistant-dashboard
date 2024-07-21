import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';

export function Backdrop() {
  return (
    <Stack
      id="backdrop"
      component={motion.div}
      position="absolute"
      left={0}
      top={0}
      width="100%"
      height="100%"
      zIndex={50}
      sx={{
        cursor: 'pointer',
        backdropFilter: 'blur(2em) brightness(0.75)',
      }}
      transition={{duration: 0.75}}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
    />
  );
}
