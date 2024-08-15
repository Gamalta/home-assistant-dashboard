import {Components} from '@mui/material/styles';

export const MuiButton: Components['MuiButton'] = {
  styleOverrides: {
    root: () => ({
      borderRadius: 50,
    }),
  },
};
