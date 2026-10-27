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
  // Sur téléphone, la modale est une feuille posée en bas de l'écran.
  const sheet = useIsMobile();

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
      transformTemplate={
        sheet
          ? undefined
          : (_, generated) => `translate(-50%, -50%) ${generated}`
      }
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
        ...(sheet && {
          position: 'fixed',
          top: 'auto',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '85dvh',
          overflowY: 'auto',
          borderRadius: '24px 24px 0 0',
          // Au-dessus de la barre d'accueil de l'iPhone.
          pb: 'max(16px, env(safe-area-inset-bottom))',
        }),
      }}
    >
      {children}
    </Stack>
  );
}
