import {useMemo} from 'react';
import {Icon as Iconify} from '@iconify/react';
import {IrisIcon} from '../components/Icons/IrisIcon';
import {PlayBarIcon} from '../components/Icons/PlayBarIcon';
import {PendantRoundIcon} from '../components/Icons/PendantRoundIcon';
import Icon, {IconProps} from '@mui/material/Icon';

export function useIcon(
  icon?: string | null,
  iconProps?: Omit<IconProps, 'icon'>
) {
  const HaIcon = useMemo(() => {
    if (icon === null) return null;

    if (icon?.startsWith('hue:')) {
      switch (icon) {
        case 'hue:bulb-sultan':
          return <PendantRoundIcon />;
        case 'hue:iris':
          return <IrisIcon />;
        case 'hue:play-bar-v':
          return <PlayBarIcon />;
      }
    }

    return (
      <Icon {...iconProps}>
        <Iconify icon={icon || 'mdi:person'} />
      </Icon>
    );
  }, [icon, iconProps]);
  return HaIcon;
}
