import type { FailArgs, SuccessArgs } from '@/arena/Constuructors/types';
import { isSuccessDamageResult } from '@/arena/Constuructors/utils';

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
}
