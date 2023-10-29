import { SuccessArgs } from '@/arena/Constuructors/types';

export function formatCause(cause: SuccessArgs) {
  switch (cause.actionType) {
    case 'skill':
      return `_${cause.action}_ *${cause.initiator}*: 📖${cause.exp}`;
    default:
      return `_${cause.action}_ *${cause.initiator}*`;
  }
}
