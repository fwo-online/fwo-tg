import type { BreaksMessage, SuccessArgs } from '../Constuructors/types';

export default class CastError extends Error {
  constructor(public reason: BreaksMessage | SuccessArgs | SuccessArgs[]) {
    super();
  }
}

export const isCastError = (e: unknown) => e instanceof CastError;
