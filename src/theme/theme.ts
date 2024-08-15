import {createTheme, responsiveFontSizes} from '@mui/material/styles';
import {Typography} from './Typography';
import {Palette} from './Palette';
import {MuiFab} from './components/Fab';
import {MuiButton} from './components/Button';
import {MuiToggleButton} from './components/ToggleButton';
import {MuiTooltip} from './components/Tooltip';

// Base theme constants
export const theme = responsiveFontSizes(
  createTheme({
    spacing: 8,
    palette: Palette,
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
