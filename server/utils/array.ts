export function normalizeToArray<T>(items: T | T[]): T[] {
  if (Array.isArray(items)) {
    return items;
  }
  return [items];
}
