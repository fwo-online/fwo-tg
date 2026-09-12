import type { FailArgs, SuccessArgs } from '@/arena/Constuructors/types';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import { formatLong } from '@/arena/LogService/utils/format-long';
import { formatAction } from './format-action';
import { formatCause } from './format-cause';
import { formatError } from './format-error';
import { formatExp } from './format-exp';

export function formatMessage(msgObj: SuccessArgs | FailArgs, depth = 0): string {
  const indent = '\t'.repeat(depth);

  if (isSuccessResult(msgObj)) {
    if (!msgObj.affects?.length) {
      return `${indent}${formatLong(msgObj)}${formatAction(msgObj)}\n${indent}${formatExp(msgObj)}`;
    }

    const affects = msgObj.affects.map((msgObj) => formatCause(msgObj));

    return `${indent}${formatLong(msgObj)}${formatAction(msgObj)}\n${indent}${formatExp(msgObj)}\n${affects.join('\n')}`;
  }

  return formatError(msgObj);
}
