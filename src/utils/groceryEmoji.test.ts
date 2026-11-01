import data from 'emojibase-data/fr/compact.json';
import {describe, expect, it} from 'vitest';
import {type EmojiKeywords, emojiKeywords, groceryEmoji} from './groceryEmoji';

const keywords = emojiKeywords(data);

describe('groceryEmoji', () => {
  it('reconnaît un article, accents, majuscules et pluriel compris', () => {
    expect(groceryEmoji('Café')).toBe('☕');
    expect(groceryEmoji('LAIT demi-écrémé')).toBe('🥛');
    expect(groceryEmoji('Bananes')).toBe('🍌');
    expect(groceryEmoji('Œufs')).toBe('🥚');
  });

  it('préfère les pommes de terre aux pommes', () => {
    expect(groceryEmoji('Pommes de terre')).toBe('🥔');
    expect(groceryEmoji('Pommes')).toBe('🍎');
  });

  it('ne reconnaît que des mots entiers', () => {
    expect(groceryEmoji('Laitue')).toBe('🥬');
    expect(groceryEmoji('Thermos')).toBe('🛒');
  });

  it('montre le panier pour un article inconnu', () => {
    expect(groceryEmoji('Piles AA')).toBe('🛒');
  });

  it('cherche ensuite le nom des emojis d’emojibase, pluriel compris', () => {
    expect(groceryEmoji('Brocolis', keywords)).toBe('🥦');
    expect(groceryEmoji('Piles AA', keywords)).toBe('🔋');
  });

  it('préfère le nom le plus complet, puis le plus court, puis un mot-clé', () => {
    const pears: EmojiKeywords[] = [
      {emoji: 'tag', label: ['fruit'], tags: [['poire']]},
      {emoji: 'williams', label: ['poire', 'william'], tags: []},
      {emoji: 'pear', label: ['poire'], tags: []},
    ];
    expect(groceryEmoji('Poire', pears)).toBe('pear');
    expect(groceryEmoji('Poires Williams', pears)).toBe('williams');
    expect(
      groceryEmoji('Compote', [
        ...pears,
        {emoji: 'jar', label: ['pot'], tags: [['compote']]},
      ]),
    ).toBe('jar');
  });

  it('garde le dictionnaire en priorité sur emojibase', () => {
    expect(groceryEmoji('Oranges', keywords)).toBe('🍊');
    expect(groceryEmoji('Papier toilette', keywords)).toBe('🧻');
  });

  it('ne garde que la nature, la nourriture et les objets', () => {
    const emojis = keywords.map(keyword => keyword.emoji);
    expect(emojis).toContain('🥔');
    expect(emojis).not.toContain('😀');
  });
});
