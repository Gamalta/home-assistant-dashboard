import {amber} from '@mui/material/colors';
import {ColorSystemOptions} from '@mui/material/styles';

export const DarkPalette: ColorSystemOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: amber[600],
    },
    secondary: {
      main: '#2C2C2E',
    },
    background: {
      default: '#232323',
      paper: '#2C2C2E',
      primary: '#1C1C1E',
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
    secondary: {
      main: '#F2F2F7',
    },
    background: {
      default: '#232323',
      paper: '#F2F2F7',
      primary: '#FFFFFF',
      tertiary: '#FFFFFF',
    },
  },
};
