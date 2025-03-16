export function mono(str: string): string;
export function mono(strings: TemplateStringsArray, ...values: unknown[]): string;
export function mono(stringsOrStr: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof stringsOrStr === 'string') {
    return `\`${stringsOrStr}\``;
  }
  return `\`${String.raw({ raw: stringsOrStr }, ...values)}\``;
}

export function bold(str: string): string;
export function bold(strings: TemplateStringsArray, ...values: unknown[]): string;
export function bold(stringsOrStr: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof stringsOrStr === 'string') {
    return `*${stringsOrStr}*`;
  }
  return `*${String.raw({ raw: stringsOrStr }, ...values)}*`;
}

export function italic(str: string): string;
export function italic(strings: TemplateStringsArray, ...values: unknown[]): string;
export function italic(stringsOrStr: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof stringsOrStr === 'string') {
    return `_${stringsOrStr}_`;
  }
  return `_${String.raw({ raw: stringsOrStr }, ...values)}_`;
}

export function code(str: string): string;
export function code(strings: TemplateStringsArray, ...values: unknown[]): string;
export function code(stringsOrStr: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof stringsOrStr === 'string') {
    return `\`\`\`${stringsOrStr}\`\`\``;
  }
  return `\`\`\`${String.raw({ raw: stringsOrStr }, ...values)}\`\`\``;
}

export function brackets(str: string): string;
export function brackets(strings: TemplateStringsArray, ...values: unknown[]): string;
export function brackets(
  stringsOrStr: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof stringsOrStr === 'string') {
    return `\\[ ${stringsOrStr} ]`;
  }
  return `\\[ ${String.raw({ raw: stringsOrStr }, ...values)} ]`;
}
