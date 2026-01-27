import MiscService from '@/arena/MiscService';

export type Weighted<T> = {
  value: T;
  weight: number;
};

type PickOptions = {
  inverse?: boolean; // true = чем больше weight, тем реже
};

export function pickByWeight<T>(items: Weighted<T>[], { inverse }: PickOptions = {}): T {
  const normalized = inverse
    ? items.map((i) => ({
        value: i.value,
        weight: 1 / i.weight,
      }))
    : items;

  const total = normalized.reduce((s, i) => s + i.weight, 0);
  let roll = MiscService.randInt(0, total);

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }

  return items[0].value;
}
