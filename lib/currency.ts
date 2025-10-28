import type { CurrencySymbol, CurrencyFormat } from './types';

export const formatCurrency = (
  amount: number,
  symbol: CurrencySymbol = '$',
  format: CurrencyFormat = 'symbol_before'
): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'auto',
  });
  
  const parts = formatter.formatToParts(amount);
  const hasMinusSign = parts.some(part => part.type === 'minusSign');
  const minusSign = hasMinusSign ? '-' : '';
  
  const numberString = parts
    .filter(part => part.type !== 'minusSign')
    .map(part => part.value)
    .join('');
  
  switch (format) {
    case 'symbol_before':
      return `${minusSign}${symbol}${numberString}`;
    case 'symbol_after':
      return `${minusSign}${numberString}${symbol}`;
    case 'symbol_after_space':
      return `${minusSign}${numberString} ${symbol}`;
    default:
      return `${minusSign}${symbol}${numberString}`;
  }
};

export const getFontFamily = (font: string): string => {
  switch (font) {
    case 'handwritten':
      return "'Caveat', cursive";
    case 'mono':
      return "'Courier New', Courier, monospace";
    case 'receipt':
      return "monospace";
    default:
      return "monospace";
  }
};
