import type { ActionType } from '@fwo/shared';
import type { Player } from '@/arena/PlayersService';
import type { FailArgs, SuccessArgs } from '../types';

type Result = SuccessArgs | FailArgs;

export const isSuccessResult = (result: Result): result is SuccessArgs => {
  return !('reason' in result);
};

export const isSuccessDamageResult = (result: Result): result is SuccessArgs => {
  if (isSuccessResult(result)) {
    return !!result.effectType;
  }

  return false;
};

export const isPhysicalDamageResult = (result: Result): result is SuccessArgs => {
  if (isSuccessDamageResult(result)) {
    return result.effectType === 'physical';
  }

  return false;
};

export const isSuccessHealResult = (result: Result): result is SuccessArgs => {
  if (isSuccessResult(result)) {
    return result.actionType === 'heal' || result.actionType === 'heal-magic';
  }

  return false;
};

export const isAbilityResult = (result: Result): result is SuccessArgs => {
  if (isSuccessResult(result)) {
    const actionTypes: ActionType[] = [
      'aoe-dmg-magic',
      'dmg-magic',
      'heal-magic',
      'magic',
      'skill',
    ];
    return actionTypes.includes(result.actionType);
  }

  return false;
};

export const findByTarget = (target: string) => {
  return (result: { target: Player }) => {
    return result.target.nick === target;
  };
};

/**
 * Возвращает массив SuccessArgs причин срыва/блокировки действия,
 * исключая строковые BreaksMessage ('NO_ENERGY', 'CHANCE_FAIL' и т.д.).
 */
export const getFailReasons = (
  reason: BreaksMessage | SuccessArgs | SuccessArgs[],
): SuccessArgs[] => {
  if (typeof reason === 'string') {
    return [];
  }

  return Array.isArray(reason) ? reason : [reason];
};

/**
 * Проверяет, вызвана ли ошибка каста указанным типом действия (например, 'dodge', 'protect').
 */
export const hasReasonActionType = (
  reason: BreaksMessage | SuccessArgs | SuccessArgs[],
  ...actionTypes: ActionType[]
): boolean => {
  return getFailReasons(reason).some((r) => actionTypes.includes(r.actionType));
};

