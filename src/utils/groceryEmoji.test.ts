import {describe, expect, it} from 'vitest';
import {groceryEmoji} from './groceryEmoji';

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
});
