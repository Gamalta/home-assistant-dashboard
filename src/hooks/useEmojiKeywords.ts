import {useEffect, useState} from 'react';
import {type EmojiKeywords, emojiKeywords} from '../utils/groceryEmoji';

/** Mots-clés français d'emojibase, chargés à la première activation. */
export function useEmojiKeywords(enabled: boolean) {
  const [keywords, setKeywords] = useState<EmojiKeywords[]>();

  useEffect(() => {
    if (!enabled || keywords) return;
    // Import dynamique : 600 Ko de données hors du bundle principal.
    import('emojibase-data/fr/compact.json').then(module =>
      setKeywords(emojiKeywords(module.default)),
    );
  }, [enabled, keywords]);

  return keywords ?? [];
}
