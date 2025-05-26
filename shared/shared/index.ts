import * as v from 'valibot';

export const nameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(3, 'Не менее 3 символов'),
  v.maxLength(16, 'Не более 16 символов'),
  v.regex(/^[а-яА-ЯёЁa-zA-Z0-9]+$/, 'Не должно содержать спецсимволов'),
);

export * from './id';
export * from './modifiers';
export * from './player';
export * from './orderSchema';
export * from './message';
export * from './attributes';
export * from './action';
export * from './invoice';
export * from './monster';

declare global {
  type DeepPartial<T> = T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;
}
