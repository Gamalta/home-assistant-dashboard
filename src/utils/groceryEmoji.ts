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
  [/\briz\b/, '🍚'],
  [/\b(poulet|dinde)\b/, '🍗'],
  [/\b(steaks?|boeuf|viande)\b/, '🥩'],
  [/\b(poissons?|saumon|thon|cabillaud)\b/, '🐟'],
  [/\beau\b/, '💧'],
  [/\bvin\b/, '🍷'],
  [/\bbieres?\b/, '🍺'],
  [/\bjus\b/, '🧃'],
  [/\bchocolat\b/, '🍫'],
  [/\b(biscuits?|gateaux?)\b/, '🍪'],
  [/\bcereales\b/, '🥣'],
  [/\b(confiture|miel)\b/, '🍯'],
  [/\b(papier toilette|essuie-tout|sopalin)\b/, '🧻'],
  [/\b(lessive|savon|liquide vaisselle)\b/, '🧴'],
];

/** Emoji d'un article de courses, le panier pour un article inconnu. */
export function groceryEmoji(summary: string) {
  const name = summary
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/œ/gi, 'oe')
    .toLowerCase();
  return EMOJIS.find(([pattern]) => pattern.test(name))?.[1] ?? '🛒';
}
