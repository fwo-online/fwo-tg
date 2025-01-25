import { object, string } from 'valibot';

export * from './modifiers';
export * from './playerSchema';
export * from './orderSchema';
export * from './message';
export * from './attributes';

export const idSchema = object({ id: string() });
