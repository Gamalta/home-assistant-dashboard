import {amber} from '@mui/material/colors';
import {ColorSystemOptions} from '@mui/material/styles';

export const DarkPalette: ColorSystemOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: amber[600],
    },
    background: {
      default: '#1C1C1E',
      paper: '#2C2C2E',
      tertiary: '#3A3A3C',
    },
  },
};

export const LightPalette: ColorSystemOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: amber[700],
    },
    background: {
      default: '#FFFFFF',
      paper: '#F2F2F7',
      tertiary: '#FFFFFF',
    },
  },
};
