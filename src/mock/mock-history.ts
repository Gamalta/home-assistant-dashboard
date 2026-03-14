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
  end?: number
) {
  const data: MockHistory[] = [];

  const now = Date.now() / 1000;
  const startTime = start ?? now - 24 * 60 * 60;
  const endTime = end ?? now;

  const step = (endTime - startTime) / length;

  for (let i = 0; i < length; i++) {
    const value = (Math.random() * (max - min) + min).toFixed(1);
    const lu = startTime + i * step;

    data.push({
      s: value,
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