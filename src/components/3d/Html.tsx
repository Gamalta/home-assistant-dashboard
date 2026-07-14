import {Html as DreiHtml, useContextBridge} from '@react-three/drei';
import {HtmlProps as DreiHtmlProps} from '@react-three/drei/web/Html';
import Stack from '@mui/material/Stack';
import {ThemeProvider} from '@mui/material';
import {theme} from '../../theme/theme';
import {RoomContext} from '../../contexts/RoomContext';
import {AppContext} from '../../contexts/AppContext';
import {HouseContext} from '../../contexts/HouseContext';

export type HtmlProps = DreiHtmlProps & {
  children: React.ReactNode;
};

export function Html({children, ...dreiProps}: HtmlProps) {
  const ContextBridge = useContextBridge(AppContext, HouseContext, RoomContext);

  return (
    <DreiHtml center zIndexRange={[0]} {...dreiProps}>
      <ContextBridge>
        <ThemeProvider theme={theme}>
          <Stack>{children}</Stack>
        </ThemeProvider>
      </ContextBridge>
    </DreiHtml>
  );
}
