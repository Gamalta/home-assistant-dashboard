/**
 * Carte affichée par le carrousel, d'après son défilement. La dernière carte
 * ne peut pas s'aligner à gauche : en fin de course, l'arrondi la désigne.
 */
export function carouselPage(
  scrollLeft: number,
  scrollWidth: number,
  count: number,
) {
  return Math.min(Math.round((scrollLeft * count) / scrollWidth), count - 1);
}
