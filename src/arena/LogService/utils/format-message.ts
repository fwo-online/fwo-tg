import type { FailArgs, SuccessArgs } from '@/arena/Constuructors/types';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import { formatAction } from './format-action';
import { formatError } from './format-error';
import { formatExp } from './format-exp';

export function formatMessage(msgObj: SuccessArgs | FailArgs) {
  if (isSuccessResult(msgObj)) {
    return `${formatAction(msgObj)}${formatExp(msgObj)}`;
  }

  return formatError(msgObj);
}
