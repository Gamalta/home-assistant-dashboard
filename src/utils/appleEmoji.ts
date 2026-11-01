// Les images d'Apple ne sont pas versionnées : voir l'ADR 0042.
const CDN =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@16.0.0/img/apple/64/';

/** Image Apple d'un emoji, nommée par ses points de code (`2615.png` pour ☕). */
export function appleEmojiUrl(emoji: string) {
  const code = Array.from(emoji, char => char.codePointAt(0)?.toString(16));
  return `${CDN}${code.join('-')}.png`;
}
