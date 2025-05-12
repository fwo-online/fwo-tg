const formatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  roundingMode: 'floor',
  minimumFractionDigits: 1,
});

const minNumberToFormat = 1000;
export function formatNumber(num: number): string {
  if (num >= minNumberToFormat) {
    return formatter.format(num);
  }

  return num.toString();
}
