import {Components} from '@mui/material/styles';

export const MuiCssBaseline: Components['MuiCssBaseline'] = {
  styleOverrides: {
    // Le dashboard tient dans l'écran. Sur téléphone, un élément qui déborde,
    // comme l'icône du menu rapide qui grandit vers sa modale, élargirait
    // toute la page.
    html: {
      overflow: 'hidden',
    },
    body: {
      overflow: 'hidden',
      transition: 'all 0.3s linear',
    },
    // En paysage, viewport-fit=cover fait passer la page sous l'encoche.
    '#root': {
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    },
  },
};
