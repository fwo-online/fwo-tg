import { wearList } from '@/constants/inventory';
import { picklist, is } from 'valibot';

export const validateWear = (wear: string | undefined) => {
  return is(picklist(wearList), wear);
};
