import Stack from '@mui/material/Stack';
import {motion, useIsPresent} from 'framer-motion';

type BackdropProps = {
  onClick: () => void;
};

export function Backdrop(props: BackdropProps) {
  const {onClick} = props;
  // En sortie, laisse passer les clics : on peut rouvrir aussitôt.
  const isPresent = useIsPresent();

  return (
    <Stack
      id="backdrop"
      component={motion.div}
      onClick={onClick}
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        cursor: 'pointer',
        backdropFilter: 'blur(2em) brightness(0.75)',
        zIndex: 50,
        pointerEvents: isPresent ? 'auto' : 'none',
      }}
      transition={{duration: 0.75}}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
    />
  );
}
