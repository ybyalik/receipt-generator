export type DividerStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double';

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
  dividerAtBottom: boolean;
  dividerStyle: DividerStyle;
}

export interface PaymentSection {
  type: 'payment';
  id: string;
  paymentType: PaymentType;
  cash?: {
    title: string;
    value: string;
  };
  card?: {
    cardNumber: string;
    cardType: string;
    cardEntry: string;
    dateTime: string;
    referencedNumber: string;
    status: string;
  };
  dividerAtBottom: boolean;
  dividerStyle: DividerStyle;
}

export interface DateTimeSection {
  type: 'date_time';
  id: string;
  alignment: Alignment;
  date: string;
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

export type Section = 
  | HeaderSection 
  | CustomMessageSection 
  | ItemsListSection 
  | PaymentSection 
  | DateTimeSection 
  | BarcodeSection;

export interface Template {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface UserTemplate {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  customSections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPremium: boolean;
}
