export const keys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[];
export const entries = <T extends object>(obj: T) => Object.entries(obj) as [keyof T, T[keyof T]][];
export const values = <T extends object>(obj: T) => Object.values(obj) as T[keyof T][];
