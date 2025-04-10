import type { FailArgs, SuccessArgs } from '@/arena/Constuructors/types';
import { isSuccessDamageResult, isSuccessHealResult } from '@/arena/Constuructors/utils';
import { calculateEffect } from '@/arena/HistoryService/utils/calculateEffect';

export type HistoryItem = SuccessArgs | FailArgs;

/**
 * Класс для хранения истории выполненных заказов
 */
export class HistoryService {
  private roundsHistoryMap = new Map<number, HistoryItem[]>();

  getHistoryForRound(round: number) {
    return this.roundsHistoryMap.get(round) ?? [];
  }

  addHistoryForRound(item: HistoryItem, round: number) {
    const roundHistory = this.getHistoryForRound(round);

    roundHistory.push(item);
    this.roundsHistoryMap.set(round, roundHistory);
  }

  hasDamageForRound(round: number) {
    const roundHistory = this.getHistoryForRound(round);
    return roundHistory.some(isSuccessDamageResult);
  }

  getPlayersPerformance() {
    const history = Array.from(this.roundsHistoryMap.values()).flat();
    return history.reduce<Record<string, { damage: number; heal: number }>>((acc, item) => {
      acc[item.initiator.id] ??= { damage: 0, heal: 0 };
      if (isSuccessDamageResult(item)) {
        acc[item.initiator.id].damage += calculateEffect(item);
      }
      if (isSuccessHealResult(item)) {
        acc[item.initiator.id].heal += calculateEffect(item);
      }
      return acc;
    }, {});
  }
}
