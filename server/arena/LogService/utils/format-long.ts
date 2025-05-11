import type { SuccessArgs } from '@/arena/Constuructors/types';
import type { ActionType } from '@fwo/shared';
import { isNumber } from 'es-toolkit/compat';

const longActions: ActionType[] = ['magic-long', 'dmg-magic-long'];

export function formatLong(args: SuccessArgs) {
  if (!longActions.includes(args.actionType) || !isNumber(args.duration)) {
    return '';
  }

  return `⏳${args.duration} `;
}
