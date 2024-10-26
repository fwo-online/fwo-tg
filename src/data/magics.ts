import type { DmgMagicArgs } from "@/arena/Constuructors/DmgMagicConstructor";
import { MagicArgs } from "@/arena/Constuructors/MagicConstructor";

export type Magic = keyof typeof baseParams; 

export const baseParams = {
  acidSpittle: {
    name: 'acidSpittle',
    displayName: 'Кислотный плевок',
    desc: 'Кислотный плевок',
    cost: 10,
    baseExp: 12,
    costType: 'mp',
    lvl: 3,
    orderType: 'enemy',
    aoeType: 'target',
    magType: 'bad',
    chance: [92, 94, 95],
    effect: ['1d3+3', '1d3+4', '1d3+5'],
    dmgType: 'acid',
    profList: ['m'],
  } satisfies DmgMagicArgs,
  chainLightning: {
    name: 'chainLightning',
    displayName: 'Цепь молний',
    desc: 'Цепная молния повреждает выбранную цель молнией и еще одну случайно.',
    cost: 8,
    baseExp: 12,
    costType: 'mp',
    lvl: 3,
    orderType: 'any',
    aoeType: 'targetAoe',
    magType: 'bad',
    chance: [92, 94, 95],
    effect: ['1d3+1', '1d3+2', '1d3+3'],
    dmgType: 'lighting',
    profList: ['m'],
  } satisfies DmgMagicArgs,
  lightHeal: {
    name: 'lightHeal',
    displayName: 'Слабое лечение',
    desc: 'Слабое лечение цели',
    cost: 3,
    baseExp: 10,
    costType: 'mp',
    lvl: 1,
    orderType: 'all',
    aoeType: 'target',
    magType: 'good',
    chance: [100, 100, 100],
    effect: ['1d2', '1d2+1', '1d2+2'],
    profList: ['m', 'p'],
  } satisfies MagicArgs
}