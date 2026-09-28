import {Html as DreiHtml} from '@react-three/drei';
import {HtmlProps as DreiHtmlProps} from '@react-three/drei/web/Html';
import Stack from '@mui/material/Stack';
import {ThemeProvider} from '@mui/material';
import {useContext} from 'react';
import {theme} from '../../theme/theme';
import {RoomContext} from '../../contexts/RoomContext';
import {AppContext} from '../../contexts/AppContext';
import {HouseContext} from '../../contexts/HouseContext';

export type HtmlProps = DreiHtmlProps & {
  children: React.ReactNode;
};

/**
 * `Html` de drei rend son contenu dans une racine React séparée : les
 * contextes ne la traversent pas. On relit donc leurs valeurs ici pour les
 * fournir à nouveau (des providers statiques, sans recréer de composant à
 * chaque rendu).
 */
export function Html({children, ...dreiProps}: HtmlProps) {
  const app = useContext(AppContext);
  const house = useContext(HouseContext);
  const room = useContext(RoomContext);

  return (
    <DreiHtml center zIndexRange={[0]} {...dreiProps}>
      <AppContext.Provider value={app}>
        <HouseContext.Provider value={house}>
          <RoomContext.Provider value={room}>
            <ThemeProvider theme={theme}>
              <Stack>{children}</Stack>
            </ThemeProvider>
          </RoomContext.Provider>
        </HouseContext.Provider>
      </AppContext.Provider>
    </DreiHtml>
  );
}
