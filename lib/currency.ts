import type { CurrencyFormat } from './types';

export const formatCurrency = (
  amount: number,
  symbol: string = '$',
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
    case 'mono':
      return "monospace";
    case 'receipt':
      return "'Courier Prime', 'Courier', monospace";
    case 'courier':
      return "'Courier New', Courier, monospace";
    case 'consolas':
      return "'Consolas', 'Monaco', monospace";
    case 'ocr-b':
      return "'OCR A Extended', 'Lucida Console', monospace";
    case 'custom':
      return "'Custom Receipt', 'Courier New', monospace";
    case 'bit':
      return "'BIT Receipt', 'Courier New', monospace";
    default:
      return "'Courier New', Courier, monospace";
  }
};

export const getFontSize = (font: string): string => {
  switch (font) {
    case 'mono':
      return '12px';
    case 'receipt':
      return '12px';
    case 'courier':
      return '10pt';
    case 'consolas':
      return '11pt';
    case 'ocr-b':
      return '10pt';
    case 'custom':
      return '11pt';
    case 'bit':
      return '10pt';
    default:
      return '12px';
  }
};
