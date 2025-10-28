import type { CurrencySymbol, CurrencyFormat } from './types';

export const formatCurrency = (
  amount: number,
  symbol: CurrencySymbol = '$',
  format: CurrencyFormat = 'symbol_before'
): string => {
  const formattedAmount = amount.toFixed(2);
  
  switch (format) {
    case 'symbol_before':
      return `${symbol}${formattedAmount}`;
    case 'symbol_after':
      return `${formattedAmount}${symbol}`;
    case 'symbol_after_space':
      return `${formattedAmount} ${symbol}`;
    default:
      return `${symbol}${formattedAmount}`;
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
