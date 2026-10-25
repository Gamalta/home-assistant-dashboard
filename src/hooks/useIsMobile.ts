import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';

// Lu dès le premier rendu (noSsr) : sinon la disposition tablette, et sa
// scène 3D, se monteraient avant de basculer.
export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'), {noSsr: true});
}
