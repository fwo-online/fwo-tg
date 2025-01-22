import ValidationError from '@/arena/errors/ValidationError';
import { HTTPException } from 'hono/http-exception';

export const withValidation = <T>(fn: () => T): T => {
  try {
    return fn();
  } catch (e) {
    if (e instanceof ValidationError) {
      throw new HTTPException(400, e);
    }

    throw e;
  }
};
