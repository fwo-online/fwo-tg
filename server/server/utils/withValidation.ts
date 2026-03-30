import type { RPC } from '@fwo/shared';
import { HTTPException } from 'hono/http-exception';
import { isValidationError } from '@/arena/errors/ValidationError';

export const withValidation = async <T>(promise: T | Promise<T>): Promise<Awaited<T>> => {
  try {
    return await promise;
  } catch (e) {
    if (isValidationError(e)) {
      throw new HTTPException(400, { message: e.message });
    }

    throw e;
  }
};

export const withValidationRPC = async <T, P extends object>(
  promise: T | Promise<T>,
  callback: (payload: RPC<P>) => void,
): Promise<Awaited<T> | undefined> => {
  try {
    return await promise;
  } catch (e) {
    if (isValidationError(e)) {
      callback({ error: true, message: e.message });
    }

    console.error('withValidationWS error:', e);
    callback({ error: true, message: 'Что-то пошло не так' });
  }
};
