import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {motion} from 'framer-motion';
import type {ReactNode} from 'react';

type ShortcutTileProps = {
  id: string;
  icon: ReactNode;
  label: string;
  value?: string;
  onClick: () => void;
};

export function ShortcutTile(props: ShortcutTileProps) {
  const {id, icon, label, value, onClick} = props;

  return (
    <motion.div layoutId={id}>
      <ButtonBase
        onClick={onClick}
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
          gap: 1.5,
          p: 1.5,
          borderRadius: 1,
          bgcolor: 'background.tertiary',
          textAlign: 'left',
        }}
      >
        {icon}
        <Stack>
          <Typography variant="subtitle2" component="span">
            {label}
          </Typography>
          {value && (
            <Typography
              variant="caption"
              component="span"
              color="textSecondary"
            >
              {value}
            </Typography>
          )}
        </Stack>
      </ButtonBase>
    </motion.div>
  );
}
