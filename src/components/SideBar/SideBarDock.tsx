import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {useEffect, useState} from 'react';
import MenuItem from '@mui/material/MenuItem';
import {ThemeIcon} from '../Icons/ThemeIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import {
  themeOptions,
  themeType,
  useThemeContext,
} from '../../contexts/ThemeProvider';
import {AnimatePresence, motion} from 'framer-motion';
import {ConfigType, HouseConfigsName} from '../../configs/configs';
import {useHouseConfigs} from '../../hooks/useHouseConfigs';
import {useHouseContext} from '../../contexts/HouseContext';
import {SystemModal} from '../Modal/SystemModal';

type SideBarDockProps = {
  sideBarRef: React.RefObject<HTMLDivElement | null>;
};

export function SideBarDock(props: SideBarDockProps) {
  const {sideBarRef} = props;
  const [isVisible, setIsVisible] = useState(false);
  const [systemModal, setSystemModal] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  const [configAnchor, setConfigAnchor] = useState<null | HTMLElement>(null);
  const {themeMode, setTheme} = useThemeContext();
  const {houseConfig, setHouseConfig} = useHouseContext();

  useEffect(() => {
    if (!sideBarRef.current) return;
    const sideBar = sideBarRef.current;

    const handleTouchStart = (event: TouchEvent) => {
      setStartX(event.touches[0].clientX);
      setStartY(event.touches[0].clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const {clientX, clientY: currentY} = event.touches[0];
      // Un glissement horizontal fait défiler le carrousel, pas le dock.
      if (Math.abs(clientX - startX) > Math.abs(currentY - startY)) return;
      if (!isVisible && startY - currentY > 10) {
        setIsVisible(true);
        event.preventDefault();
      } else if (isVisible && currentY - startY > 10) {
        setIsVisible(false);
        event.preventDefault();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      // Un appui tactile émet aussi un mousemove : seule la souris compte.
      if (event.pointerType !== 'mouse') return;
      const heightThreshold = window.innerHeight - window.innerHeight / 4;
      if (event.clientY > heightThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    sideBar.addEventListener('touchstart', handleTouchStart);
    sideBar.addEventListener('touchmove', handleTouchMove);
    sideBar.addEventListener('pointermove', handlePointerMove);

    return () => {
      sideBar.removeEventListener('touchstart', handleTouchStart);
      sideBar.removeEventListener('touchmove', handleTouchMove);
      sideBar.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isVisible, sideBarRef, startX, startY]);

  const configs = useHouseConfigs(Boolean(configAnchor));

  const handleThemeMenuClick = (newTheme: themeType) => {
    setThemeAnchor(null);
    setTheme(newTheme);

    setTimeout(() => {
      setIsVisible(false);
    }, 250);
  };

  const handleConfigMenuClick = (newConfig: ConfigType) => {
    setConfigAnchor(null);
    setHouseConfig(newConfig);

    setTimeout(() => {
      setIsVisible(false);
    }, 250);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <Stack
          component={motion.div}
          direction="row"
          initial={{opacity: 0, x: '50%', y: 50}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: 50}}
          transition={{duration: 0.5}}
          sx={{
            position: 'absolute',
            bottom: theme => theme.spacing(2),
            right: '50%',
            justifyContent: 'center',
            bgcolor: 'background.tertiary',
            borderRadius: '50px',
            p: theme => theme.spacing(1, 2),
          }}
        >
          {themeMode && (
            <>
              <IconButton
                onClick={event => setThemeAnchor(event.currentTarget)}
              >
                <ThemeIcon />
              </IconButton>
              <Menu
                anchorEl={themeAnchor}
                open={Boolean(themeAnchor)}
                onClose={() => setThemeAnchor(null)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                transformOrigin={{vertical: 'bottom', horizontal: 'center'}}
              >
                {themeOptions.map(option => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleThemeMenuClick(option.value)}
                    selected={themeMode === option.value}
                  >
                    {option.name}
                  </MenuItem>
                ))}
              </Menu>
              <Stack sx={{py: 0.5}}>
                <Divider orientation="vertical" />
              </Stack>
            </>
          )}
          {HouseConfigsName.length > 1 && (
            <>
              <Button onClick={event => setConfigAnchor(event.currentTarget)}>
                Configuration
              </Button>
              <Menu
                anchorEl={configAnchor}
                open={Boolean(configAnchor)}
                onClose={() => setConfigAnchor(null)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                transformOrigin={{vertical: 'bottom', horizontal: 'center'}}
              >
                {configs.map(option => (
                  <MenuItem
                    key={option.id}
                    onClick={() => handleConfigMenuClick(option)}
                    selected={houseConfig?.id === option.id}
                  >
                    {option.name}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {houseConfig?.sideBar.system && (
            <>
              <Button onClick={() => setSystemModal(true)}>Système</Button>
              <motion.div layoutId="layoutid-system-modal" />
              <SystemModal
                id="layoutid-system-modal"
                title="Système"
                open={systemModal}
                onClose={() => setSystemModal(false)}
                systemConfig={houseConfig.sideBar.system}
              />
            </>
          )}
        </Stack>
      )}
    </AnimatePresence>
  );
}
