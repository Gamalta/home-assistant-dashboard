import {Components} from '@mui/material/styles';

export const MuiTooltip: Components['MuiTooltip'] = {
  defaultProps: {
    arrow: true,
    slotProps: {
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -14],
            },
          },
        ],
      },
    },
  },
};
