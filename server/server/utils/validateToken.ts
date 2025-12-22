import { parse, validate } from '@tma.js/init-data-node';

export function validateToken(type: string, value: string) {
  if (type === 'tma') {
    validate(value, process.env.BOT_TOKEN ?? '');
    const { user } = parse(value);

    return user;
  }
}
