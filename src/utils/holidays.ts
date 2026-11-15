/** Du 1er décembre à l'Épiphanie, le 6 janvier, inclus. */
export function isHolidaySeason(date: Date) {
  const month = date.getMonth();
  return month === 11 || (month === 0 && date.getDate() <= 6);
}
