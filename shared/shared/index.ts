export * from './id';
export * from './modifiers';
export * from './player';
export * from './orderSchema';
export * from './message';
export * from './attributes';
export * from './action';

declare global {
  type DeepPartial<T> = T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;
}
