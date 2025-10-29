import { Section } from './types';

// Hardcoded fallback defaults
const FALLBACK_DEFAULTS: { [key: string]: any } = {
  header: {
    alignment: 'center',
    logoSize: 50,
    businessDetails: 'Your Business Name\nYour Address\nCity, State ZIP',
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  },
  custom_message: {
    alignment: 'center',
    message: 'Thank you for your business!',
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  },
  items_list: {
    items: [{ quantity: 1, item: 'Item 1', price: 10.00 }],
    totalLines: [{ title: 'Subtotal', value: 10.00 }],
    tax: { title: 'Tax', value: 0.80 },
    total: { title: 'Total', price: 10.80 },
    dividerAfterItems: false,
    dividerAfterItemsStyle: 'dashed',
    dividerAfterTotal: true,
    dividerAfterTotalStyle: 'dashed',
  },
  payment: {
    paymentType: 'card',
    cashFields: [
      { title: 'Cash Tendered', value: '$100.00' },
      { title: 'Change', value: '$0.00' },
    ],
    cardFields: [
      { title: 'Card number', value: '**** **** **** 1234' },
      { title: 'Card type', value: 'Visa' },
      { title: 'Card entry', value: 'Chip' },
      { title: 'Date/time', value: new Date().toLocaleString() },
      { title: 'Reference #', value: 'REF123456789' },
      { title: 'Status', value: 'APPROVED' },
    ],
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  },
  date_time: {
    alignment: 'left',
    date: new Date().toLocaleString(),
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  },
  barcode: {
    size: 2,
    length: 50,
    value: '1234567890123',
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  },
};

let sectionTemplatesCache: { [key: string]: any } | null = null;

export async function getSectionDefault(type: Section['type']): Promise<any> {
  // Try to load from cache or API
  if (!sectionTemplatesCache) {
    try {
      const res = await fetch('/api/admin/section-templates');
      if (res.ok) {
        const templates = await res.json();
        // Build a cache map by section type (use first template of each type)
        sectionTemplatesCache = {};
        templates.forEach((template: any) => {
          if (!sectionTemplatesCache![template.sectionType]) {
            sectionTemplatesCache![template.sectionType] = template.defaultData;
          }
        });
      } else {
        sectionTemplatesCache = {};
      }
    } catch (error) {
      console.error('Failed to fetch section templates, using fallback defaults', error);
      sectionTemplatesCache = {};
    }
  }

  // Deep clone to prevent shared reference mutations
  const defaults = sectionTemplatesCache[type] || FALLBACK_DEFAULTS[type] || {};
  return JSON.parse(JSON.stringify(defaults));
}

export function clearSectionTemplatesCache() {
  sectionTemplatesCache = null;
}
