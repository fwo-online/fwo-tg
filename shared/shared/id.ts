import { object, string } from 'valibot';

export const idSchema = object({ id: string() });
