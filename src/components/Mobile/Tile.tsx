import ButtonBase, {ButtonBaseProps} from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import type {ReactNode} from 'react';

type TileProps = Omit<ButtonBaseProps, 'children' | 'color' | 'sx'> & {
  icon: ReactNode;
  name: string;
  state: string;
  active?: boolean;
  // Couleur de l'état actif : celle de la lumière, sinon l'ambre du thème.
  color?: string;
  // Icône lisible sur cette couleur.
  iconColor?: string;
  unavailable?: boolean;
};

export function Tile(props: TileProps) {
  const {
    icon,
    name,
    state,
    active = false,
    color,
    iconColor = '#1C1C1E',
    unavailable = false,
    ...buttonProps
  } = props;
  const theme = useTheme();
  const tint = color ?? (theme.vars ?? theme).palette.primary.main;

  return (
    <ButtonBase
      disabled={unavailable}
      {...buttonProps}
      sx={{
        width: '100%',
        height: 72,
        px: 1.25,
        gap: 1,
        justifyContent: 'flex-start',
        textAlign: 'left',
        borderRadius: 2,
        border: '1px solid',
        borderColor: active
          ? `color-mix(in srgb, ${tint} 50%, transparent)`
          : 'transparent',
        bgcolor: active
          ? `color-mix(in srgb, ${tint} 16%, transparent)`
          : 'background.paper',
        opacity: unavailable ? 0.5 : 1,
      }}
    >
      <Stack
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: '50%',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: active ? tint : 'background.tertiary',
          color: active ? iconColor : 'text.secondary',
          '& svg': {width: 20, height: 20},
        }}
      >
        {icon}
      </Stack>
      <Stack sx={{minWidth: 0}}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {name}
        </Typography>
        <Typography variant="caption" noWrap color="textSecondary">
          {state}
        </Typography>
      </Stack>
    </ButtonBase>
  );
}
