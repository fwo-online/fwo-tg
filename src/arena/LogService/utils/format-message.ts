import type { FailArgs, SuccessArgs } from '@/arena/Constuructors/types';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import { formatAction } from './format-action';
import { formatError } from './format-error';
import { formatExp } from './format-exp';

export function formatMessage(msgObj: SuccessArgs | FailArgs, depth = 0): string {
  const indent = '\t'.repeat(depth);

  if (isSuccessResult(msgObj)) {
    if (!msgObj.affects?.length) {
      return `${indent}${formatAction(msgObj)}\n${indent}${formatExp(msgObj)}`;
    }

    const affects = msgObj.affects.map((msgObj) => formatMessage(msgObj, depth + 1));

    return `${indent}${formatAction(msgObj)}\n${indent}${formatExp(msgObj)}\n\n${affects.join('\n\n')}`;
  }

  return formatError(msgObj);
}
