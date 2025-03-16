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

export const findByTarget = (target: string) => {
  return (result: { target: Player }) => {
    return result.target.nick === target;
  };
};
