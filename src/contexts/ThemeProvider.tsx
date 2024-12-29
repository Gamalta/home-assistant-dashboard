import {
  ThemeProvider as MuiThemeProvider,
  useColorScheme,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {theme} from '../theme/theme';

export type themeType = 'auto' | 'light' | 'dark' | 'system';
type ThemeContextType = {
  themeMode: string;
  setTheme: (newTheme: themeType) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'auto',
  setTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

const ThemeModeProvider = (props: {children: React.ReactNode}) => {
  const {children} = props;
  const [themeMode, setThemeMode] = useState<themeType>('auto');
  const {mode, setMode} = useColorScheme();

  const handleThemeChange = (newTheme: themeType) => {
    window.localStorage.setItem('theme', newTheme);
    setThemeMode(newTheme);
    newTheme === 'auto' ? autoTheming() : setMode(newTheme);
  };

  const autoTheming = useCallback(() => {
    if (themeMode !== 'auto') return;
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 16) {
      if (mode !== 'light') setMode('light');
    } else {
      if (mode !== 'dark') setMode('dark');
    }
  }, [setMode, themeMode, mode]);

  useEffect(() => {
    const theme = (window.localStorage.getItem('theme') || 'auto') as themeType;
    setThemeMode(theme);
    if (theme !== 'auto') setMode(theme);
  }, [setMode]);

  useEffect(() => {
    autoTheming();
    const interval = setInterval(() => autoTheming(), 60000);
    return () => clearInterval(interval);
  }, [autoTheming]);

  return (
    <>
      <ThemeContext.Provider value={{themeMode, setTheme: handleThemeChange}}>
        {children}
      </ThemeContext.Provider>
    </>
  );
};

export function ThemeProvider(props: {children: React.ReactNode}) {
  const {children} = props;
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeModeProvider>{children}</ThemeModeProvider>
    </MuiThemeProvider>
  );
}
