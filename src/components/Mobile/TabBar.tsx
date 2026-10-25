import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import GridViewIcon from '@mui/icons-material/GridViewRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';

export type MobileTab = 'maison' | 'pieces';

type TabBarProps = {
  value: MobileTab;
  onChange: (tab: MobileTab) => void;
};

export function TabBar(props: TabBarProps) {
  const {value, onChange} = props;

  return (
    <BottomNavigation
      component="nav"
      aria-label="Navigation principale"
      showLabels
      value={value}
      onChange={(_, tab: MobileTab) => onChange(tab)}
      sx={{
        flexShrink: 0,
        height: 'auto',
        pt: 1,
        pb: 'max(8px, env(safe-area-inset-bottom))',
        bgcolor: 'background.primary',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <BottomNavigationAction
        value="maison"
        label="Maison"
        icon={<HomeIcon />}
      />
      <BottomNavigationAction
        value="pieces"
        label="Pièces"
        icon={<GridViewIcon />}
      />
    </BottomNavigation>
  );
}
