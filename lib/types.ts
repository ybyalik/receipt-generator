export type DividerStyle = 'dashed' | 'solid' | 'dotted' | 'double' | 'stars' | 'blank';

export type Alignment = 'left' | 'center' | 'right';

export type PaymentType = 'cash' | 'card';

export interface HeaderSection {
  type: 'header';
  id: string;
  alignment: Alignment;
  logo?: string;
  logoSize: number;
  businessDetails: string;
  dividerAtBottom: boolean;
  dividerStyle: DividerStyle;
}

export interface CustomMessageSection {
  type: 'custom_message';
  id: string;
  alignment: Alignment;
  message: string;
  dividerAtBottom: boolean;
  dividerStyle: DividerStyle;
}

export interface ItemsListSection {
  type: 'items_list';
  id: string;
  items: Array<{
    quantity: number;
    item: string;
    price: number;
  }>;
  totalLines: Array<{
    title: string;
    value: number;
  }>;
  tax: {
    title: string;
    value: number;
  };
  total: {
    title: string;
    price: number;
  };
  // Total size increase
  increaseTotalSize?: boolean;
  totalSizeIncrease?: number; // Percentage: 10, 20, 50, 75, 100
  // Divider after items (before total lines)
  dividerAfterItems?: boolean;
  dividerAfterItemsStyle?: DividerStyle;
  // Divider after total lines (at bottom)
  dividerAfterTotal?: boolean;
  dividerAfterTotalStyle?: DividerStyle;
  // Keep old properties for backward compatibility
  dividerAtBottom?: boolean;
  dividerStyle?: DividerStyle;
}

export interface PaymentSection {
  type: 'payment';
  id: string;
  paymentType: PaymentType;
  cashFields: Array<{
    title: string;
    value: string;
  }>;
  cardFields: Array<{
    title: string;
    value: string;
  }>;
  dividerAtBottom: boolean;
  dividerStyle: DividerStyle;
}

export interface DateTimeSection {
  type: 'date_time';
  id: string;
  alignment: Alignment;
  date: string;
  dateFormat?: string; // Format string for displaying date/time
  dividerAtBottom: boolean;
  dividerStyle: DividerStyle;
}

export interface BarcodeSection {
  type: 'barcode';
  id: string;
  size: number;
  length: number;
  value: string;
  dividerAtBottom: boolean;
  dividerStyle: DividerStyle;
}

export interface TwoColumnsSection {
  type: 'two_columns';
  id: string;
  column1: Array<{
    title: string;
    value: string;
  }>;
  column2: Array<{
    title: string;
    value: string;
  }>;
  dividerAtBottom: boolean;
  dividerStyle: DividerStyle;
}

export type Section = 
  | HeaderSection 
  | CustomMessageSection 
  | ItemsListSection 
  | PaymentSection 
  | DateTimeSection 
  | BarcodeSection
  | TwoColumnsSection;

export type CurrencyFormat = 'symbol_before' | 'symbol_after' | 'symbol_after_space'; // $2.99, 2.99$, 2.99 $
export type FontStyle = 'mono' | 'receipt' | 'courier' | 'consolas' | 'ocr-b';
export type BackgroundTexture = 'none' | 'texture1' | 'texture2' | 'texture3' | 'texture4' | 'texture5';
export type ReceiptWidth = '57mm' | '80mm'; // 2.25" small receipts | 3.125" standard POS

export interface TemplateSettings {
  currency: string; // Custom currency symbol/text (e.g., $, €, USD, etc.)
  currencyFormat: CurrencyFormat;
  font: FontStyle;
  textColor: string;
  backgroundTexture: BackgroundTexture;
  receiptWidth?: ReceiptWidth; // Optional for backward compatibility
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  settings: TemplateSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserTemplate {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  customSections: Section[];
  settings: TemplateSettings;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPremium: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: Date | null;
}
