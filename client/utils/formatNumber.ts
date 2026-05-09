const formatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  roundingMode: 'floor',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatNumber(num: number): string {
  return formatter.format(num);
}
