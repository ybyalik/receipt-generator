import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface GeneratedTemplate {
  name: string;
  slug: string;
  businessName: string;
  businessAddress: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  items: Array<{ item: string; quantity: number; price: number }>;
  paymentType: 'cash' | 'card';
  includeBarcode: boolean;
}

async function generateTemplateForIndustry(industry: string): Promise<GeneratedTemplate> {
  const prompt = `Generate a realistic receipt template for a ${industry} business. Return ONLY valid JSON with this exact structure:

{
  "name": "${industry} Receipt",
  "businessName": "Realistic business name",
  "businessAddress": "Street address\\nCity, State ZIP\\nCountry",
  "businessPhone": "(555) 123-4567",
  "businessEmail": "contact@business.com",
  "businessWebsite": "www.business.com",
  "items": [
    {"item": "Service/product name", "quantity": 1, "price": 45.99}
  ],
  "paymentType": "card",
  "includeBarcode": true
}

Requirements:
- Use realistic business name for the industry
- Include 3-5 industry-specific items with realistic prices
- Use appropriate pricing for that industry
- Generate complete street address with city, state, ZIP
- Generate realistic phone, email, and website
- Return ONLY the JSON, no other text`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a receipt template generator. Return ONLY valid JSON, no markdown, no explanations.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0].message.content?.trim() || '';
  
  let cleanedContent = content;
  if (content.startsWith('```json')) {
    cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (content.startsWith('```')) {
    cleanedContent = content.replace(/```\n?/g, '');
  }
  
  let generated;
  try {
    generated = JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Failed to parse AI response:', cleanedContent);
    throw new Error('AI returned invalid JSON. Please try again.');
  }
  
  if (!generated.name || !generated.businessName || !Array.isArray(generated.items)) {
    throw new Error('AI response missing required fields');
  }
  
  const slug = industry
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    + '-receipt';
  
  generated.slug = slug;
  
  return generated;
}

function createFurnitureStyleTemplate(generated: GeneratedTemplate) {
  const sections = [];
  const now = Date.now();
  
  sections.push({
    type: 'header',
    id: `header-${now}`,
    alignment: 'center',
    logoSize: 50,
    businessDetails: `${generated.businessName}\n${generated.businessAddress}\n${generated.businessPhone || ''}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  sections.push({
    type: 'custom_message',
    id: `custom_message-${now}`,
    alignment: 'center',
    message: `Receipt #: ${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}\nReceipt date: ${new Date().toLocaleDateString('en-US')}\n\n${generated.name}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  if (generated.includeBarcode) {
    sections.push({
      type: 'barcode',
      id: `barcode-${now + 1}`,
      size: 2,
      length: 13,
      value: '1234567890123',
      dividerAtBottom: false,
      dividerStyle: 'dashed',
    });
  }

  sections.push({
    type: 'custom_message',
    id: `billing-${now}`,
    alignment: 'center',
    message: `Billed to: Customer Name\n123 Willow Creek Road\nMadison, WI 53703`,
    dividerAtBottom: true,
    dividerStyle: 'dotted',
  });

  const subtotal = generated.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  sections.push({
    type: 'items_list',
    id: `items_list-${now}`,
    items: generated.items,
    totalLines: [
      { title: 'Subtotal', value: subtotal },
      { title: 'Tax', value: tax },
    ],
    tax: null,
    total: { title: 'Total', price: total },
    dividerAfterItems: true,
    dividerAfterItemsStyle: 'dotted',
    dividerAfterTotal: false,
    dividerAfterTotalStyle: 'dashed',
  });

  sections.push({
    type: 'payment',
    id: `payment-${now}`,
    paymentType: generated.paymentType,
    cashFields: [
      { title: 'Cash Tendered', value: `$${(total + 20).toFixed(2)}` },
      { title: 'Change', value: '$20.00' },
    ],
    cardFields: [
      { title: 'Card number', value: '**** **** **** 4822' },
      { title: 'Card type', value: 'Debit' },
      { title: 'Card entry', value: 'Chip' },
      { title: 'Date/time', value: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) },
      { title: 'Reference #', value: `B${Math.floor(Math.random() * 1000000000000000).toString().slice(0, 15)}` },
      { title: 'Status', value: 'APPROVED' },
    ],
    dividerAtBottom: true,
    dividerStyle: 'stars',
  });

  sections.push({
    type: 'custom_message',
    id: `footer-${now}`,
    alignment: 'center',
    message: `Customers are encouraged to review their receipts immediately and report any discrepancies within 7 days. Any disputes regarding receipts or payments should be reported promptly and will be addressed within 10 business days. Receipts serve as proof of payment and include details such as date, amount paid, payment method, and items or services purchased.\n\nThank you for choosing ${generated.businessName}.`,
    dividerAtBottom: true,
    dividerStyle: 'stars',
  });

  sections.push({
    type: 'date_time',
    id: `date_time-${now}`,
    alignment: 'center',
    date: new Date().toISOString(),
    dateFormat: 'M/d/yyyy, h:mm:ss a',
    dividerAtBottom: false,
    dividerStyle: 'dashed',
  });

  return {
    sections,
    settings: {
      currency: '$',
      currencyFormat: 'symbol_before',
      font: 'custom-receipt',
      textColor: '#000000',
      backgroundTexture: 'none',
    },
  };
}

function createPawnShopStyleTemplate(generated: GeneratedTemplate) {
  const sections = [];
  const now = Date.now();
  
  sections.push({
    type: 'header',
    id: `header-${now}`,
    alignment: 'center',
    logoSize: 50,
    businessDetails: `${generated.businessName}\n${generated.businessPhone || '(555) 123-4567'}\n${generated.businessAddress}\n${generated.businessEmail || 'contact@business.com'}`,
    dividerAtBottom: true,
    dividerStyle: 'double',
  });

  sections.push({
    type: 'custom_message',
    id: `title-${now}`,
    alignment: 'center',
    message: generated.name,
    dividerAtBottom: true,
    dividerStyle: 'double',
  });

  sections.push({
    type: 'custom_message',
    id: `customer-${now}`,
    alignment: 'left',
    message: `Customer Information:\nName: Customer Name\nAddress: 3914 Brookstone Avenue\nCharlotte, NC 28205`,
    dividerAtBottom: true,
    dividerStyle: 'stars',
  });

  const subtotal = generated.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  sections.push({
    type: 'items_list',
    id: `items_list-${now}`,
    items: generated.items,
    totalLines: [
      { title: 'Subtotal', value: subtotal },
      { title: 'Tax', value: tax },
    ],
    tax: null,
    total: { title: 'Total', price: total },
    dividerAfterItems: false,
    dividerAfterItemsStyle: 'dashed',
    dividerAfterTotal: true,
    dividerAfterTotalStyle: 'stars',
  });

  sections.push({
    type: 'payment',
    id: `payment-${now}`,
    paymentType: generated.paymentType,
    cashFields: [
      { title: 'Cash Tendered', value: `$${(total + 20).toFixed(2)}` },
      { title: 'Change', value: '$20.00' },
    ],
    cardFields: [
      { title: 'Card number', value: '**** **** **** 4822' },
      { title: 'Card type', value: 'Debit' },
      { title: 'Card entry', value: 'Chip' },
      { title: 'Date/time', value: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) },
      { title: 'Reference #', value: `B${Math.floor(Math.random() * 1000000000000000).toString().slice(0, 15)}` },
      { title: 'Status', value: 'APPROVED' },
    ],
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  sections.push({
    type: 'custom_message',
    id: `website-${now}`,
    alignment: 'center',
    message: generated.businessWebsite || 'www.business.com',
    dividerAtBottom: false,
    dividerStyle: 'dashed',
  });

  if (generated.includeBarcode) {
    sections.push({
      type: 'barcode',
      id: `barcode-${now}`,
      size: 2,
      length: 13,
      value: '1234567890123',
      dividerAtBottom: false,
      dividerStyle: 'dashed',
    });
  }

  sections.push({
    type: 'date_time',
    id: `date_time-${now}`,
    alignment: 'center',
    date: new Date().toISOString(),
    dateFormat: 'M/d/yyyy, h:mm:ss a',
    dividerAtBottom: false,
    dividerStyle: 'dashed',
  });

  return {
    sections,
    settings: {
      currency: '$',
      currencyFormat: 'symbol_before',
      font: 'ocrb-receipt',
      textColor: '#000000',
      backgroundTexture: 'none',
    },
  };
}

function createMinimalStyleTemplate(generated: GeneratedTemplate) {
  const sections = [];
  const now = Date.now();
  
  sections.push({
    type: 'header',
    id: `header-${now}`,
    alignment: 'center',
    logoSize: 50,
    businessDetails: `${generated.businessName}\n${generated.businessAddress}\n${generated.businessPhone || ''}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  sections.push({
    type: 'custom_message',
    id: `title-${now}`,
    alignment: 'center',
    message: `${generated.name}\nReceipt #: RCP-${Math.floor(Math.random() * 1000000)}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  const subtotal = generated.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  sections.push({
    type: 'items_list',
    id: `items_list-${now}`,
    items: generated.items,
    totalLines: [
      { title: 'Subtotal:', value: subtotal },
    ],
    tax: { title: 'Tax (8.25%):', value: tax },
    total: { title: 'Total:', price: total },
    dividerAfterItems: false,
    dividerAfterItemsStyle: 'dashed',
    dividerAfterTotal: true,
    dividerAfterTotalStyle: 'dashed',
  });

  sections.push({
    type: 'payment',
    id: `payment-${now}`,
    paymentType: generated.paymentType,
    cashFields: [
      { title: 'Cash Tendered', value: `$${(total + 20).toFixed(2)}` },
      { title: 'Change', value: '$20.00' },
    ],
    cardFields: [
      { title: 'Card number', value: '**** **** **** 4822' },
      { title: 'Card type', value: 'Debit' },
      { title: 'Card entry', value: 'Chip' },
      { title: 'Date/time', value: new Date().toLocaleString() },
      { title: 'Reference #', value: `REF${Math.floor(Math.random() * 1000000000)}` },
      { title: 'Status', value: 'APPROVED' },
    ],
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  if (generated.includeBarcode) {
    sections.push({
      type: 'barcode',
      id: `barcode-${now}`,
      size: 2,
      length: 13,
      value: '1234567890123',
      dividerAtBottom: true,
      dividerStyle: 'dashed',
    });
  }

  sections.push({
    type: 'date_time',
    id: `date_time-${now}`,
    alignment: 'center',
    date: new Date().toISOString(),
    dateFormat: 'MM/dd/yyyy, h:mm:ss a',
    dividerAtBottom: false,
    dividerStyle: 'dashed',
  });

  return {
    sections,
    settings: {
      currency: '$',
      currencyFormat: 'symbol_before',
      font: 'bit-receipt',
      textColor: '#000000',
      backgroundTexture: 'none',
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { industries, userEmail } = req.body;

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  if (!adminEmails.includes(userEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }

  if (!industries || !Array.isArray(industries) || industries.length === 0) {
    return res.status(400).json({ error: 'Industries array is required' });
  }

  const results = [];

  for (let i = 0; i < industries.length; i++) {
    const industry = industries[i].trim();
    if (!industry) continue;

    try {
      const generated = await generateTemplateForIndustry(industry);
      
      const styleIndex = i % 3;
      let templateConfig;
      if (styleIndex === 0) {
        templateConfig = createFurnitureStyleTemplate(generated);
      } else if (styleIndex === 1) {
        templateConfig = createPawnShopStyleTemplate(generated);
      } else {
        templateConfig = createMinimalStyleTemplate(generated);
      }

      const templateData = {
        name: generated.name,
        slug: generated.slug,
        sections: templateConfig.sections,
        settings: templateConfig.settings,
        userEmail,
      };

      const createResponse = await fetch(`${req.headers.origin || 'http://localhost:5000'}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (createResponse.ok) {
        const created = await createResponse.json();
        results.push({
          success: true,
          industry,
          template: created,
          style: styleIndex === 0 ? 'furniture' : styleIndex === 1 ? 'pawn-shop' : 'minimal',
        });
      } else {
        const error = await createResponse.text();
        results.push({
          success: false,
          industry,
          error: error || 'Failed to create template',
        });
      }
    } catch (error: any) {
      results.push({
        success: false,
        industry,
        error: error.message || 'Generation failed',
      });
    }
  }

  return res.status(200).json({ results });
}
