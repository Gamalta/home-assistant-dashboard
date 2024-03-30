import {Html as DreiHtml} from '@react-three/drei';
import {theme} from '../../theme/theme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import {HtmlProps as DreiHtmlProps} from '@react-three/drei/web/Html';
import Stack from '@mui/material/Stack';

export type HtmlProps = DreiHtmlProps & {
  children: React.ReactNode;
};

export function Html({children, ...dreiProps}: HtmlProps) {
  return (
    <DreiHtml center zIndexRange={[0]} {...dreiProps}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Stack>{children}</Stack>
      </ThemeProvider>
    </DreiHtml>
  );
}
