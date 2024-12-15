export const roundToNearest5Minutes = (timestamp: number) => {
  return Math.floor(timestamp / (15 * 60 * 1000)) * (15 * 60 * 1000);
};
