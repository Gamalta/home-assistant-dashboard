import {describe, expect, it} from 'vitest';
import {appleEmojiUrl} from './appleEmoji';

describe('appleEmojiUrl', () => {
  it('nomme l’image par les points de code de l’emoji', () => {
    expect(appleEmojiUrl('☕')).toMatch(/\/2615\.png$/);
    expect(appleEmojiUrl('🛒')).toMatch(/\/1f6d2\.png$/);
  });

  it('garde le sélecteur de variante et les séquences avec liant', () => {
    expect(appleEmojiUrl('🗑️')).toMatch(/\/1f5d1-fe0f\.png$/);
    expect(appleEmojiUrl('🍋‍🟩')).toMatch(/\/1f34b-200d-1f7e9\.png$/);
  });
});
