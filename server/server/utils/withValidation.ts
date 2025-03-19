import ValidationError from '@/arena/errors/ValidationError';
import { HTTPException } from 'hono/http-exception';

export const withValidation = async <T>(promise: T | Promise<T>): Promise<Awaited<T>> => {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof ValidationError) {
      throw new HTTPException(400, { message: e.message });
    }

    throw e;
  }
};
