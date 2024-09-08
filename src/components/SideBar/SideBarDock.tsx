import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {useEffect, useState} from 'react';
import MenuItem from '@mui/material/MenuItem';
import {ThemeIcon} from '../Icons/ThemeIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import {themeType, useThemeContext} from '../../contexts/ThemeProvider';
import {AnimatePresence, motion} from 'framer-motion';

type SideBarDockProps = {
  sideBarRef: React.RefObject<HTMLDivElement>;
};

export function SideBarDock(props: SideBarDockProps) {
  const {sideBarRef} = props;
  const [isVisible, setIsVisible] = useState(false);
  const [startY, setStartY] = useState(0);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  const {themeMode, setTheme} = useThemeContext();

  useEffect(() => {
    if (!sideBarRef?.current) return;
    const sideBar = sideBarRef.current;

    const handleTouchStart = (event: TouchEvent) =>
      setStartY(event.touches[0].clientY);

    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0].clientY;
      if (!isVisible && startY - currentY > 10) {
        setIsVisible(true);
        event.preventDefault();
      } else if (isVisible && currentY - startY > 10) {
        setIsVisible(false);
        event.preventDefault();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const heightThreshold = window.innerHeight - window.innerHeight / 4;
      event.clientY > heightThreshold
        ? setIsVisible(true)
        : setIsVisible(false);
    };

    sideBar.addEventListener('touchstart', handleTouchStart);
    sideBar.addEventListener('touchmove', handleTouchMove);
    sideBar.addEventListener('mousemove', handleMouseMove);

    return () => {
      sideBar.removeEventListener('touchstart', handleTouchStart);
      sideBar.removeEventListener('touchmove', handleTouchMove);
      sideBar.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible, sideBarRef, startY]);

  const handleMenuClick = (newTheme: themeType) => {
    setThemeAnchor(null);
    setTheme(newTheme);

    setTimeout(() => {
      setIsVisible(false);
    }, 250);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <Stack
          component={motion.div}
          position="absolute"
          direction="row"
          bottom={theme => theme.spacing(2)}
          right="50%"
          justifyContent="center"
          bgcolor="background.tertiary"
          borderRadius="50px"
          p={theme => theme.spacing(1, 2)}
          initial={{opacity: 0, x: '50%', y: 50}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: 50}}
          transition={{duration: 0.5}}
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
                {[
                  {value: 'system', name: 'Système'},
                  {value: 'auto', name: 'Auto'},
                  {value: 'light', name: 'Clair'},
                  {value: 'dark', name: 'Sombre'},
                ].map(option => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleMenuClick(option.value as themeType)}
                    selected={themeMode === option.value}
                  >
                    {option.name}
                  </MenuItem>
                ))}
              </Menu>
              <Stack py={0.5}>
                <Divider orientation="vertical" />
              </Stack>
            </>
          )}
          <Button>settings</Button>
          <Button>settings</Button>
        </Stack>
      )}
    </AnimatePresence>
  );
}
