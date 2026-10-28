import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import MemoryIcon from '@mui/icons-material/MemoryRounded';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {HouseConfigsName} from '../../configs/configs';
import {useHouseContext} from '../../contexts/HouseContext';
import {themeOptions, useThemeContext} from '../../contexts/ThemeProvider';
import {useHouseConfigs} from '../../hooks/useHouseConfigs';
import {ThemeIcon} from '../Icons/ThemeIcon';
import {SystemModal} from '../Modal/SystemModal';

export function SettingsList() {
  const {themeMode, setTheme} = useThemeContext();
  const {houseConfig, setHouseConfig} = useHouseContext();
  const [themeAnchor, setThemeAnchor] = useState<HTMLElement | null>(null);
  const [houseAnchor, setHouseAnchor] = useState<HTMLElement | null>(null);
  const [systemModal, setSystemModal] = useState(false);
  const configs = useHouseConfigs(Boolean(houseAnchor));
  const system = houseConfig?.sideBar.system;
  const theme = themeOptions.find(option => option.value === themeMode);

  return (
    <List
      disablePadding
      aria-label="Réglages"
      sx={{bgcolor: 'background.primary', borderRadius: 3, overflow: 'hidden'}}
    >
      <ListItemButton onClick={event => setThemeAnchor(event.currentTarget)}>
        <ListItemIcon>
          <ThemeIcon />
        </ListItemIcon>
        <ListItemText primary="Thème" />
        <Typography color="textSecondary">{theme?.name}</Typography>
      </ListItemButton>
      <Menu
        anchorEl={themeAnchor}
        open={Boolean(themeAnchor)}
        onClose={() => setThemeAnchor(null)}
      >
        {themeOptions.map(option => (
          <MenuItem
            key={option.value}
            selected={themeMode === option.value}
            onClick={() => {
              setThemeAnchor(null);
              setTheme(option.value);
            }}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
      {HouseConfigsName.length > 1 && (
        <>
          <ListItemButton
            onClick={event => setHouseAnchor(event.currentTarget)}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Maison" />
            <Typography color="textSecondary">{houseConfig?.name}</Typography>
          </ListItemButton>
          <Menu
            anchorEl={houseAnchor}
            open={Boolean(houseAnchor)}
            onClose={() => setHouseAnchor(null)}
          >
            {configs.map(config => (
              <MenuItem
                key={config.id}
                selected={houseConfig?.id === config.id}
                onClick={() => {
                  setHouseAnchor(null);
                  setHouseConfig(config);
                }}
              >
                {config.name}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
      {system && (
        <>
          <motion.div layoutId="layoutid-system-modal">
            <ListItemButton onClick={() => setSystemModal(true)}>
              <ListItemIcon>
                <MemoryIcon />
              </ListItemIcon>
              <ListItemText primary="Système" />
              <ChevronRightIcon color="action" />
            </ListItemButton>
          </motion.div>
          <SystemModal
            id="layoutid-system-modal"
            title="Système"
            open={systemModal}
            onClose={() => setSystemModal(false)}
            systemConfig={system}
          />
        </>
      )}
    </List>
  );
}
