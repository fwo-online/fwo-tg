export class StreakHelper<Key extends string> {
  private streaks: Partial<Record<Key, number>> = {};

  get(key: Key): number {
    return this.streaks[key] ?? 0;
  }

  add(key: Key): void {
    this.streaks[key] = (this.streaks[key] ?? 0) + 1;
  }

  delete(key: Key): void {
    this.streaks[key] = 0;
  }

  clear(): void {
    this.streaks = {};
  }
}
