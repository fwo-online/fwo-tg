import config from '@/arena/config';

export const calculateLvl = (exp: number) => {
  const k = 1000 * config.lvlRatio;
  return Math.max(1, Math.floor(Math.log2(exp / k) + 2));
};

export const calculateNextLvlExp = (lvl: number) => {
  return 2 ** (lvl - 1) * 1000 * config.lvlRatio;
};

export const expToLevel = (lvl: number) => {
  const k = 1000 * config.lvlRatio;
  let sum = 0;

  for (let i = 2; i <= lvl; i++) {
    sum += k * 2 ** (i - 2);
  }

  return sum;
};
