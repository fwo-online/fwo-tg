export const floatNumber = (str: string | number): number => +Number.parseFloat(str.toString()).toFixed(2);
