import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {ReactNode} from 'react';
import {useIsMobile} from '../../../hooks/useIsMobile';

type ContainerProps = {
  id?: string;
  children: ReactNode;
};

export function Container(props: ContainerProps) {
  const {id, children} = props;
  const isMobile = useIsMobile();

  return (
    <Stack
      component={motion.div}
      transition={{
        duration: 1,
        type: 'spring',
        // Assez amorti pour que la modale la plus haute reste dans l'écran.
        damping: 10,
        mass: 0.55,
        stiffness: 100,
      }}
      transformTemplate={(_, generated) => `translate(-50%, -50%) ${generated}`}
      layoutId={id}
      spacing={2}
      sx={{
        position: 'absolute',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
        borderRadius: 1,
        zIndex: 100,
        overflow: 'hidden',
        p: 2,
        top: '50%',
        left: '50%',
        maxHeight: 'calc(100% - 4rem)',
        alignItems: 'stretch',
        boxShadow: '0px 0px 10px hsla(200, calc(50% * 0.8), 3%, 0.6)',
        ...(isMobile && {
          // Sur téléphone, une carte centrée entre l'encoche et la barre
          // d'accueil de l'iPhone.
          top: 'calc(50% + (env(safe-area-inset-top) - env(safe-area-inset-bottom)) / 2)',
          width: 'calc(100% - 24px)',
          maxHeight:
            'calc(100% - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px)',
          overflowY: 'auto',
          borderRadius: '24px',
        }),
      }}
    >
      {children}
    </Stack>
  );
}
