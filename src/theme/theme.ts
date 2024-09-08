import {createTheme, responsiveFontSizes} from '@mui/material/styles';
import {Typography} from './Typography';
import {DarkPalette, LightPalette} from './Palette';
import {MuiFab} from './components/Fab';
import {MuiButton} from './components/Button';
import {MuiToggleButton} from './components/ToggleButton';
import {MuiTooltip} from './components/Tooltip';
import {MuiCssBaseline} from './components/MuiCssBaseline';

// Base theme constants
export const theme = responsiveFontSizes(
  createTheme({
    cssVariables: {
      colorSchemeSelector: 'class',
    },
    colorSchemes: {
      dark: DarkPalette,
      light: LightPalette,
    },
    spacing: 8,
    typography: Typography,
    components: {
      MuiCssBaseline,
      MuiToggleButton,
      MuiButton,
      MuiFab,
      MuiTooltip,
    },
    shape: {
      borderRadius: 12,
    },
  })
);

declare module '@mui/material/styles' {
  interface TypeBackground {
    tertiary: string;
  }
}
