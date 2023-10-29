import ActionError from '@/arena/errors/ActionError';
import type { Breaks, FailArgs, SuccessArgs } from '../types';

export const isSuccessResult = (result: SuccessArgs | FailArgs): result is SuccessArgs => {
  return !('message' in result);
};

export const isSuccessDamageResult = (result: SuccessArgs | FailArgs) => {
  if (isSuccessResult(result)) {
    return ('dmg' in result);
  }

  return false;
};

export const isFailResult = (result: SuccessArgs | FailArgs): result is FailArgs => {
  return 'message' in result;
};

export const handleCastError = (error: unknown, onActionError: (error: Breaks) => void) => {
  if (error instanceof Error) {
    console.error(error);
  } else {
    onActionError(error as Breaks);
  }
};
