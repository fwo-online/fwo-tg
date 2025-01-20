import * as v from 'valibot';

export const idSchema = v.object({ id: v.string() });

export * from './character';
export * from './inventory';
export * from './item';
export * from './itemSet';
export * from './shared';
export * from './magic';
export * from './game';
