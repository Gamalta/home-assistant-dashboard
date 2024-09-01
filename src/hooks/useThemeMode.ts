import {useColorScheme} from '@mui/material/styles';
import {useState} from 'react';

export type themeType = 'auto' | 'light' | 'dark' | 'system';

export const useThemeMode = () => {
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const {mode, setMode} = useColorScheme();

  const handleThemeChange = (newTheme: themeType) => {
    window.localStorage.setItem('theme', newTheme);
    if (newTheme === 'auto') {
      setAutoMode(true);
      return;
    }
    setAutoMode(false);
    setMode(newTheme);
  };

  const initTheme = () => {
    const theme = (window.localStorage.getItem('theme') || 'auto') as themeType;
    if (theme === 'auto') return;
    setAutoMode(false);
    setMode(theme);
  };

  return {
    mode: autoMode ? 'auto' : mode,
    initTheme,
    handleThemeChange,
  };
};
