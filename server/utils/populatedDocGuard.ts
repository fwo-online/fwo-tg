import { Types } from 'mongoose';

export const populatedDocGuard = <T>(doc: T | Types.ObjectId | null | undefined): doc is T => {
  if (!doc || doc instanceof Types.ObjectId) {
    return false;
  }
  return true;
};
