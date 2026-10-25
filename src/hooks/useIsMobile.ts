import useMediaQuery from '@mui/material/useMediaQuery';
import type {Theme} from '@mui/material/styles';

// Lu dès le premier rendu (noSsr) : sinon la disposition tablette, et sa
// scène 3D, se monteraient avant de basculer.
export function useIsMobile() {
  return useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), {
    noSsr: true,
  });
}
