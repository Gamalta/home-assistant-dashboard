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
      modal: '#2C2C2E',
      modalTertiary: '#3A3A3C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#a5a5a5ff',
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
      main: '#FFFFFF',
    },
    background: {
      default: '#E2E2E7',
      paper: '#E5E5EA',
      primary: '#F2F2F7',
      tertiary: '#FFFFFF',
      modal: '#FFFFFF',
      modalTertiary: '#EEF1F6',
    },
    text: {
      secondary: '#5C5C61',
    },
  },
};
