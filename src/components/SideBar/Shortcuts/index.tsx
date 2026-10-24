import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import {useRef, useState} from 'react';
import type {ShortcutConfigType} from '../../../configs/sidebar';
import {carouselPage} from '../../../utils/carousel';
import {MediaShortcut} from './MediaShortcut';
import {ShoppingListShortcut} from './ShoppingListShortcut';

type ShortcutsProps = {
  shortcuts: ShortcutConfigType[];
};

export function Shortcuts(props: ShortcutsProps) {
  const {shortcuts} = props;
  const listRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const showPage = (index: number) => {
    const card = listRef.current?.children[index];
    if (card instanceof HTMLElement)
      listRef.current?.scrollTo({left: card.offsetLeft, behavior: 'smooth'});
  };

  return (
    <Stack spacing={1} sx={{flex: 1, minHeight: 0}}>
      <Box
        ref={listRef}
        component="section"
        aria-label="Raccourcis"
        onScroll={event => {
          const {scrollLeft, scrollWidth} = event.currentTarget;
          setPage(carouselPage(scrollLeft, scrollWidth, shortcuts.length));
        }}
        sx={{
          // Les offsetLeft des cartes se mesurent depuis le carrousel.
          position: 'relative',
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridAutoFlow: 'column',
          // Le bord de la carte suivante dépasse : on devine qu'il y a une suite.
          gridAutoColumns: shortcuts.length > 1 ? 'calc(100% - 32px)' : '100%',
          gap: 1,
          overflowX: 'auto',
          overscrollBehaviorX: 'contain',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          '& > *': {scrollSnapAlign: 'start'},
        }}
      >
        {shortcuts.map((shortcut, index) => {
          const id = `layoutid-shortcut-${index}`;
          switch (shortcut.type) {
            case 'media':
              return (
                <MediaShortcut key={id} id={id} shortcutConfig={shortcut} />
              );
            case 'shoppingList':
              return (
                <ShoppingListShortcut
                  key={id}
                  id={id}
                  shortcutConfig={shortcut}
                />
              );
          }
        })}
      </Box>
      {shortcuts.length > 1 && (
        <Stack direction="row" sx={{justifyContent: 'center'}}>
          {shortcuts.map((_, index) => (
            <ButtonBase
              key={index}
              aria-label={`Carte ${index + 1}`}
              aria-current={index === page}
              onClick={() => showPage(index)}
              sx={{
                width: 24,
                height: 16,
                '&::after': {
                  content: '""',
                  width: index === page ? 16 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: index === page ? 'primary.main' : 'action.disabled',
                  transition: 'width 200ms',
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
