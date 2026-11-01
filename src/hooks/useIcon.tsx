import {useMemo} from 'react';
import {Icon as Iconify} from '@iconify/react';
import {IrisIcon} from '../components/Icons/IrisIcon';
import {PlayBarIcon} from '../components/Icons/PlayBarIcon';
import {BulbSultanIcon} from '../components/Icons/BulbSultanIcon';
import Icon, {IconProps} from '@mui/material/Icon';
import {BulbCableIcon} from '../components/Icons/BulbCandleIcon';
import {LightStripIcon} from '../components/Icons/LightStripIcon';
import {BulbSpotIcon} from '../components/Icons/BulbSpotIcon';
import {BulbFilamentIcon} from '../components/Icons/BulbFilamentIcon';
import {BulbGroupSpotIcon} from '../components/Icons/BulbGroupSpotIcon';
import { BulbGroupFilamentIcon } from '../components/Icons/BulbGroupFilamentIcon';
import { BulbFilamentCandleIcon } from '../components/Icons/BulbFilamentCandleIcon';

export function useIcon(
  icon?: string | null,
  iconProps?: Omit<IconProps, 'icon'>,
) {
  const HaIcon = useMemo(() => {
    if (icon === null) return null;
    if (icon?.startsWith('hue:')) {
      switch (icon) {
        case 'hue:bulb-candle':
          return <BulbCableIcon />;
        case 'hue:bulb-filament':
          return <BulbFilamentIcon />;
        case 'hue:bulb-group-filament':
          return <BulbGroupFilamentIcon />;
        case 'hue:bulb-filament-candle':
          return <BulbFilamentCandleIcon />;
        case 'hue:bulb-sultan':
          return <BulbSultanIcon />;
        case 'hue:bulb-spot':
          return <BulbSpotIcon />;
        case 'hue:bulb-group-spot':
          return <BulbGroupSpotIcon />;
        case 'hue:iris':
          return <IrisIcon />;
        case 'hue:play-bar-v':
          return <PlayBarIcon />;
        case 'hue:lightstrip':
          return <LightStripIcon />;
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
