import {createTheme, responsiveFontSizes} from '@mui/material/styles';
import {Typography} from './Typography';
import {Palette} from './Palette';

// Base theme constants
export const theme = responsiveFontSizes(
  createTheme({
    spacing: 8,
    palette: Palette,
    typography: Typography,
    components: {},
    shape: {
      borderRadius: 8,
    },
  })
);
