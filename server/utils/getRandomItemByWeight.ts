export function getRandomItemByWeight<T extends object>(
  items: T[],
  getWeight: (item: T) => number,
): T | undefined {
  const weights = items.map(getWeight);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const probabilities = weights.map((w) => w / totalWeight);

  const random = Math.random();
  let sum = 0;

  for (let i = 0; i < items.length; i++) {
    sum += probabilities[i];
    if (random <= sum) {
      return items[i];
    }
  }
}
