import config from '@/arena/config';

export const calculateLvl = (exp: number) => {
  const k = 1000 * config.lvlRatio;
  return Math.max(1, Math.floor(Math.log2(exp / k) + 2));
};
