import type {CompactEmoji} from 'emojibase';

export type EmojiKeywords = {emoji: string; label: string[]; tags: string[][]};

// Le premier motif trouvé dans le nom, sans accents ni majuscules, l'emporte.
const EMOJIS: [RegExp, string][] = [
  [/\b(pommes? de terre|patates?)\b/, '🥔'],
  [/\blait\b/, '🥛'],
  [/\bbeurre\b/, '🧈'],
  [/\b(fromages?|emmental|comte|gruyere|mozzarella|parmesan)\b/, '🧀'],
  [/\boeufs?\b/, '🥚'],
  [/\bbaguettes?\b/, '🥖'],
  [/\bpain\b/, '🍞'],
  [/\bcroissants?\b/, '🥐'],
  [/\bcafe\b/, '☕'],
  [/\bthe\b/, '🍵'],
  [/\bpommes?\b/, '🍎'],
  [/\bbananes?\b/, '🍌'],
  [/\b(oranges?|clementines?)\b/, '🍊'],
  [/\bcitrons?\b/, '🍋'],
  [/\bfraises?\b/, '🍓'],
  [/\btomates?\b/, '🍅'],
  [/\bcarottes?\b/, '🥕'],
  [/\b(salades?|laitues?)\b/, '🥬'],
  [/\boignons?\b/, '🧅'],
  [/\bail\b/, '🧄'],
  [/\b(pates|spaghettis?)\b/, '🍝'],
  [/\bfarine\b/, '🌾'],
  [/\blentilles\b/, '🫘'],
  [/\bcourgettes?\b/, '🥒'],
  [/\b(persil|basilic|coriandre|menthe)\b/, '🌿'],
  [/\briz\b/, '🍚'],
  [/\b(poulet|dinde)\b/, '🍗'],
  [/\b(steaks?|boeuf|viande)\b/, '🥩'],
  [/\b(poissons?|saumon|thon|cabillaud)\b/, '🐟'],
  [/\bmoules\b/, '🦪'],
  [/\beau\b/, '💧'],
  [/\bvin\b/, '🍷'],
  [/\bbieres?\b/, '🍺'],
  [/\bjus\b/, '🧃'],
  [/\b(coca|sodas?|limonade)\b/, '🥤'],
  [/\bchocolat\b/, '🍫'],
  [/\b(biscuits?|gateaux?)\b/, '🍪'],
  [/\bcereales\b/, '🥣'],
  [/\b(confiture|miel)\b/, '🍯'],
  [/\b(papier toilette|essuie-tout|sopalin)\b/, '🧻'],
  [/\b(lessive|savon|liquide vaisselle)\b/, '🧴'],
  [/\bdentifrice\b/, '🪥'],
  [/\bpoubelles?\b/, '🗑️'],
];

// Animaux et nature, nourriture et boissons, objets.
const GROUPS = [3, 4, 7];
const STOP_WORDS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'au', 'aux']);

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/œ/gi, 'oe')
    .toLowerCase();

// Mots sans accents ni pluriel, des deux côtés de la comparaison.
const words = (text: string) =>
  normalize(text)
    .split(/[^a-z]+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word))
    .map(word => (word.length > 3 ? word.replace(/[sx]$/, '') : word));

/** Mots du nom et des mots-clés d'emojibase, pour `groceryEmoji`. */
export function emojiKeywords(emojis: CompactEmoji[]): EmojiKeywords[] {
  return emojis
    .filter(emoji => GROUPS.includes(emoji.group ?? -1))
    .map(emoji => ({
      emoji: emoji.unicode,
      label: words(emoji.label),
      tags: (emoji.tags ?? []).map(words).filter(tag => tag.length),
    }));
}

/**
 * Emoji d'un article de courses : le dictionnaire, puis le nom d'un emoji
 * d'emojibase, puis ses mots-clés, et le panier pour un article inconnu.
 */
export function groceryEmoji(summary: string, keywords: EmojiKeywords[] = []) {
  const name = normalize(summary);
  const known = EMOJIS.find(([pattern]) => pattern.test(name))?.[1];
  if (known) return known;

  const found = new Set(words(summary));
  let best = {emoji: '🛒', score: 0};
  for (const {emoji, label, tags} of keywords) {
    // Un mot du nom de l'emoji compte plus qu'un mot-clé ; à égalité, le nom
    // le plus court, donc le plus proche, l'emporte.
    const hits = label.filter(word => found.has(word)).length;
    const tag = tags.find(t => t.every(word => found.has(word)));
    const score = hits ? 100 * hits - label.length : (tag?.length ?? 0);
    if (score > best.score) best = {emoji, score};
  }
  return best.emoji;
}
