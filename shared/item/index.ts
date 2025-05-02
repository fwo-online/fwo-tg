export * from './itemSchema';
export * from './itemInfoSchema';
export * from './itemWear';
export * from './itemComponent';
export * from './itemMarket';

export const baseItemCostModifier = 0.3;
export const baseCraftChance: Record<number, number> = {
  1: 100,
  2: 60,
  3: 30,
};
export const getItemPrice = (price: number, tier: number) => {
  return Math.ceil(price * (baseItemCostModifier * tier));
};
