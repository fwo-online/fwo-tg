import * as v from 'valibot';

export const nameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(3, 'Не менее 3 символов'),
  v.maxLength(16, 'Не более 16 символов'),
  v.regex(/^[а-яА-ЯёЁa-zA-Z0-9]+$/, 'Не должно содержать спецсимволов'),
);

export * from './action';
export * from './attributes';
export * from './id';
export * from './invoice';
export * from './message';
export * from './modifiers';
export * from './monster';
export * from './orderSchema';
export * from './player';
export * from './quest';
export * from './rpc';

type CombineAll<T> = T extends { [name in keyof T]: infer Type } ? Type : never;

type PropertyNameMap<T, IncludeIntermediate extends boolean> = {
  [name in keyof T]: T[name] extends object
    ? SubPathsOf<name, T, IncludeIntermediate> | (IncludeIntermediate extends true ? name : never)
    : name;
};

type SubPathsOf<
  key extends keyof T,
  T,
  IncludeIntermediate extends boolean,
> = `${string & key}.${string & PathsOf<T[key], IncludeIntermediate>}`;

declare global {
  type DeepPartial<T> = T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

  type MaybePromise<T> = T | Promise<T>;

  export type PathsOf<T, IncludeIntermediate extends boolean = false> = CombineAll<
    PropertyNameMap<T, IncludeIntermediate>
  >;
}
