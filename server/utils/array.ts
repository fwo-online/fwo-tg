export function normalizeToArray<T>(items: T | T[] | undefined): T[] {
  if (Array.isArray(items)) {
    return items;
  }

  if (items) {
    return [items];
  }

  return [];
}
