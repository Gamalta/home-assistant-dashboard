type MockHistory = {
  s: string;
  lu: number;
};

export function generateMockHistory(
  entityId: string,
  length: number,
  min: number,
  max: number,
  start?: number,
  end?: number,
) {
  const data: MockHistory[] = [];

  const now = Date.now() / 1000;
  const startTime = start ?? now - 24 * 60 * 60;
  const endTime = end ?? now;

  const step = (endTime - startTime) / length;
  // Marche aléatoire : un vrai capteur évolue par petites variations.
  let value = (min + max) / 2;

  for (let i = 0; i < length; i++) {
    value += (Math.random() - 0.5) * (max - min) * 0.2;
    value = Math.min(max, Math.max(min, value));
    const lu = startTime + i * step;

    data.push({
      s: value.toFixed(1),
      lu,
    });
  }

  return {
    states: {
      [entityId]: data,
    },
    start_time: startTime,
    end_time: endTime,
  };
}
