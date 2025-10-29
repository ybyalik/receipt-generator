import type { NextApiRequest, NextApiResponse } from 'next';
import { createSectionTemplate, getAllSectionTemplates } from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check if templates already exist
    const existing = await getAllSectionTemplates();
    if (existing.length > 0) {
      res.status(200).json({ message: 'Section templates already exist', count: existing.length });
      return;
    }

    // Create default templates
    const defaultTemplates = [
      {
        sectionType: 'header',
        name: 'Default Header',
        defaultData: {
          alignment: 'center',
          logoSize: 50,
          businessDetails: 'Your Business Name\nYour Address\nCity, State ZIP',
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        },
      },
      {
        sectionType: 'custom_message',
        name: 'Default Custom Message',
        defaultData: {
          alignment: 'center',
          message: 'Thank you for your business!',
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        },
      },
      {
        sectionType: 'items_list',
        name: 'Default Items List',
        defaultData: {
          items: [
            { quantity: 1, item: 'Item 1', price: 10.00 },
          ],
          totalLines: [
            { title: 'Subtotal', value: 10.00 },
          ],
          tax: { title: 'Tax', value: 0.80 },
          total: { title: 'Total', price: 10.80 },
          dividerAfterItems: false,
          dividerAfterItemsStyle: 'dashed',
          dividerAfterTotal: true,
          dividerAfterTotalStyle: 'dashed',
        },
      },
      {
        sectionType: 'payment',
        name: 'Default Payment',
        defaultData: {
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
      },
      {
        sectionType: 'date_time',
        name: 'Default Date/Time',
        defaultData: {
          alignment: 'left',
          date: new Date().toLocaleString(),
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        },
      },
      {
        sectionType: 'barcode',
        name: 'Default Barcode',
        defaultData: {
          size: 2,
          length: 50,
          value: '1234567890123',
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        },
      },
    ];

    const created = [];
    for (const template of defaultTemplates) {
      const result = await createSectionTemplate(template);
      created.push(result);
    }

    res.status(201).json({ 
      message: 'Section templates seeded successfully', 
      count: created.length,
      templates: created
    });
  } catch (error) {
    console.error('Error seeding section templates:', error);
    res.status(500).json({ error: 'Failed to seed section templates' });
  }
}
