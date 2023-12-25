import { SuccessArgs } from '@/arena/Constuructors/types';

export function formatCause(cause: SuccessArgs) {
  switch (cause.actionType) {
    case 'skill':
      return `_${cause.action}_ *${cause.initiator}*: 📖${cause.exp}`;
    case 'protect':
      return `_${cause.action}_ ${cause.expArr.map(({ name, exp }) => `*${name}*: 📖${exp}`)}`;
    default:
      return `_${cause.action}_ *${cause.initiator}*`;
  }
}
