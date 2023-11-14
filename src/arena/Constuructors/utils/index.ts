import type {
  Breaks, FailArgs, SuccessArgs,
} from '../types';

type Result = SuccessArgs | FailArgs;
type SuccessDamageResult<T = Result> = T extends { dmg: number } ? T : never;

export const isSuccessResult = (result: Result): result is SuccessArgs => {
  return !('message' in result);
};

export const isSuccessDamageResult = (result: Result): result is SuccessDamageResult => {
  if (isSuccessResult(result)) {
    return ('dmg' in result);
  }

  return false;
};

export const isPhysicalDamageResult = (result: Result): result is SuccessDamageResult => {
  console.log(result);
  if (isSuccessDamageResult(result)) {
    return result.dmgType === 'physical';
  }

  return false;
};

export const findByTarget = (target: string) => {
  return (result: Result) => {
    return result.target === target;
  };
};

export const handleCastError = (error: unknown, onActionError: (error: Breaks) => void) => {
  if (error instanceof Error) {
    console.error(error);
  } else {
    onActionError(error as Breaks);
  }
};
