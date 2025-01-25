import ValidationError from '@/arena/errors/ValidationError';
import { HTTPException } from 'hono/http-exception';

export const withValidation = async <T>(fn: () => T): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ValidationError) {
      throw new HTTPException(400, { message: e.message });
    }

    throw e;
  }
};
