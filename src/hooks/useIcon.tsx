import {useMemo} from 'react';
import {Icon as Iconify} from '@iconify/react';
import {IrisIcon} from '../components/Icons/IrisIcon';
import {PlayBarIcon} from '../components/Icons/PlayBarIcon';
import {BulbSultanIcon} from '../components/Icons/BulbSultanIcon';
import Icon, {IconProps} from '@mui/material/Icon';
import {BulbCableIcon} from '../components/Icons/BulbCandleIcon';

export function useIcon(
  icon?: string | null,
  iconProps?: Omit<IconProps, 'icon'>
) {
  const HaIcon = useMemo(() => {
    if (icon === null) return null;
    if (icon?.startsWith('hue:')) {
      switch (icon) {
        case 'hue:bulb-candle':
          return <BulbCableIcon />;
        case 'hue:bulb-sultan':
          return <BulbSultanIcon />;
        case 'hue:iris':
          return <IrisIcon />;
        case 'hue:play-bar-v':
          return <PlayBarIcon />;
        default:
          console.warn('useIcon hue icon not found: ', icon);
          return <BulbSultanIcon />;
      }
    }

    return (
      <Icon sx={{lineHeight: 0}} {...iconProps}>
        <Iconify icon={icon || 'mdi:person'} width="24px" height="24px" />
      </Icon>
    );
  }, [icon, iconProps]);
  return HaIcon;
}
