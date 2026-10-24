import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {motion} from 'framer-motion';
import type {ReactNode} from 'react';

type ShortcutCardProps = {
  id: string;
  icon: ReactNode;
  label: string;
  children: ReactNode;
  /** Boutons sous le contenu : un bouton ne peut pas être dans celui de la carte. */
  controls?: ReactNode;
  onClick: () => void;
};

export function ShortcutCard(props: ShortcutCardProps) {
  const {id, icon, label, children, controls, onClick} = props;

  return (
    <Stack
      component={motion.div}
      layoutId={id}
      sx={{
        borderRadius: 1,
        bgcolor: 'background.tertiary',
        overflow: 'hidden',
      }}
    >
      <ButtonBase
        onClick={onClick}
        sx={{
          flex: 1,
          minHeight: 0,
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          gap: 1,
          p: 1.5,
          textAlign: 'left',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{alignItems: 'center', color: 'text.secondary'}}
        >
          {icon}
          <Typography variant="subtitle2" component="span" noWrap>
            {label}
          </Typography>
        </Stack>
        {children}
      </ButtonBase>
      {controls}
    </Stack>
  );
}
