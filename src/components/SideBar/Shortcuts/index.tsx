import Box from '@mui/material/Box';
import type {ShortcutConfigType} from '../../../configs/sidebar';
import {AllLightsOffShortcut} from './AllLightsOffShortcut';
import {EnergyShortcut} from './EnergyShortcut';

type ShortcutsProps = {
  shortcuts: ShortcutConfigType[];
};

export function Shortcuts(props: ShortcutsProps) {
  const {shortcuts} = props;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 1,
      }}
    >
      {shortcuts.map((shortcut, index) => {
        const id = `layoutid-shortcut-${index}`;
        switch (shortcut.type) {
          case 'allLightsOff':
            return (
              <AllLightsOffShortcut
                key={id}
                id={id}
                shortcutConfig={shortcut}
              />
            );
          case 'energy':
            return (
              <EnergyShortcut key={id} id={id} shortcutConfig={shortcut} />
            );
        }
      })}
    </Box>
  );
}
