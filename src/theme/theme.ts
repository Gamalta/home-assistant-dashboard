import {createTheme, responsiveFontSizes} from '@mui/material/styles';
import {Typography} from './Typography';
import {DarkPalette} from './Palette';
import {MuiFab} from './components/Fab';
import {MuiButton} from './components/Button';
import {MuiToggleButton} from './components/ToggleButton';
import {MuiTooltip} from './components/Tooltip';

// Base theme constants
export const theme = responsiveFontSizes(
  createTheme({
    cssVariables: true,
    colorSchemes: {
      dark: DarkPalette,
      light: DarkPalette, //LightPalette, TODO bug remove when @mui/material 6.0.2 is released
    },
    spacing: 8,
    typography: Typography,
    components: {
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
