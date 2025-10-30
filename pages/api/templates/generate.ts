import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { ObjectStorageService } from '../../../server/objectStorage';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
  const capitalizedIndustry = capitalizeWords(industry);
  const includesReceipt = industry.toLowerCase().includes('receipt');
  const templateName = includesReceipt ? capitalizedIndustry : `${capitalizedIndustry} Receipt`;
  
  const prompt = `Generate a realistic receipt template for a ${industry} business. Return ONLY valid JSON with this exact structure:

{
  "name": "${templateName}",
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

async function generateAndSaveLogo(industry: string, slug: string): Promise<string | null> {
  try {
    // Generate simple black and white icon/logo
    const logoPrompt = `Simple flat vector icon of ${industry}, black and white only, minimal design, clean lines, white background, monochrome, no text`;
    
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: logoPrompt,
      size: '1024x1024',
      n: 1,
    });

    // gpt-image-1 returns base64 format, not URL
    const base64Image = response.data[0]?.b64_json;
    if (!base64Image) {
      console.error('No base64 image returned from gpt-image-1');
      return null;
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Image, 'base64');

    // Save to Replit App Storage
    const objectStorageService = new ObjectStorageService();
    const filename = `logos/${slug}.png`;
    const logoUrl = await objectStorageService.uploadPublicObject(filename, buffer, 'image/png');

    console.log(`Logo saved to object storage: ${logoUrl}`);
    return logoUrl;
  } catch (error) {
    console.error('Error generating logo:', error);
    return null;
  }
}

function createRandomTemplate(generated: GeneratedTemplate, logoUrl: string | null) {
  const sections = [];
  const now = Date.now();
  
  // Random choices
  const fonts = ['monospace', 'receipt', 'courier-new', 'consolas', 'custom-receipt', 'bit-receipt', 'ocrb-receipt'];
  const dividerStyles = ['dashed', 'dotted', 'stars', 'double'];
  const alignments = ['left', 'center', 'right'];
  
  const font = randomChoice(fonts);
  const headerDivider = randomChoice(dividerStyles);
  const titleDivider = randomChoice(dividerStyles);
  const titleAlignment = randomChoice(alignments);
  
  // Random boolean choices
  const includeCustomerInfo = Math.random() > 0.5;
  const includeFooterMessage = Math.random() > 0.5;
  const includeWebsite = Math.random() > 0.5;
  const barcodePosition = randomChoice(['top', 'middle', 'bottom', 'none']);
  
  // Header (always included)
  let businessDetails = `${generated.businessName}\n${generated.businessAddress}`;
  if (Math.random() > 0.3) businessDetails += `\n${generated.businessPhone || '(555) 123-4567'}`;
  if (Math.random() > 0.5) businessDetails += `\n${generated.businessEmail || 'contact@business.com'}`;
  
  sections.push({
    type: 'header',
    id: `header-${now}`,
    alignment: 'center',
    logoSize: 50,
    logo: logoUrl || undefined,
    businessDetails,
    dividerAtBottom: true,
    dividerStyle: headerDivider,
  });

  // Barcode at top (if chosen)
  if (barcodePosition === 'top' && generated.includeBarcode) {
    sections.push({
      type: 'barcode',
      id: `barcode-top-${now}`,
      size: 2,
      length: 13,
      value: '1234567890123',
      dividerAtBottom: Math.random() > 0.5,
      dividerStyle: randomChoice(dividerStyles),
    });
  }

  // Title/Receipt number
  const receiptFormats = [
    `${generated.name}\nReceipt #: ${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
    `Receipt #: RCP-${Math.floor(Math.random() * 1000000)}\n${generated.name}`,
    `${generated.name}\n${new Date().toLocaleDateString('en-US')}`,
    generated.name,
  ];
  
  sections.push({
    type: 'custom_message',
    id: `title-${now}`,
    alignment: titleAlignment,
    message: randomChoice(receiptFormats),
    dividerAtBottom: true,
    dividerStyle: titleDivider,
  });

  // Barcode in middle (if chosen)
  if (barcodePosition === 'middle' && generated.includeBarcode) {
    sections.push({
      type: 'barcode',
      id: `barcode-middle-${now}`,
      size: 2,
      length: 13,
      value: '1234567890123',
      dividerAtBottom: Math.random() > 0.5,
      dividerStyle: randomChoice(dividerStyles),
    });
  }

  // Customer info (optional)
  if (includeCustomerInfo) {
    const customerMessages = [
      `Billed to: Customer Name\n123 Willow Creek Road\nMadison, WI 53703`,
      `Customer Information:\nName: Customer Name\nAddress: 3914 Brookstone Avenue\nCharlotte, NC 28205`,
      `Customer: Customer Name\nPhone: (555) 987-6543`,
    ];
    
    sections.push({
      type: 'custom_message',
      id: `customer-${now}`,
      alignment: randomChoice(alignments),
      message: randomChoice(customerMessages),
      dividerAtBottom: true,
      dividerStyle: randomChoice(dividerStyles),
    });
  }

  // Items list (always included)
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
    dividerAfterItems: Math.random() > 0.5,
    dividerAfterItemsStyle: randomChoice(dividerStyles),
    dividerAfterTotal: Math.random() > 0.5,
    dividerAfterTotalStyle: randomChoice(dividerStyles),
  });

  // Payment (always included)
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
      { title: 'Reference #', value: `REF${Math.floor(Math.random() * 1000000000).toString().slice(0, 10)}` },
      { title: 'Status', value: 'APPROVED' },
    ],
    dividerAtBottom: Math.random() > 0.5,
    dividerStyle: randomChoice(dividerStyles),
  });

  // Website (optional)
  if (includeWebsite && generated.businessWebsite) {
    sections.push({
      type: 'custom_message',
      id: `website-${now}`,
      alignment: 'center',
      message: generated.businessWebsite,
      dividerAtBottom: Math.random() > 0.5,
      dividerStyle: randomChoice(dividerStyles),
    });
  }

  // Footer message (optional)
  if (includeFooterMessage) {
    const footerMessages = [
      `Thank you for your business!\n${generated.businessName}`,
      `Customers are encouraged to review their receipts immediately and report any discrepancies within 7 days.\n\nThank you for choosing ${generated.businessName}.`,
      `All sales are final. No refunds or exchanges.\nFor questions, contact: ${generated.businessEmail || 'contact@business.com'}`,
      `We appreciate your business!\nVisit us again soon.`,
    ];
    
    sections.push({
      type: 'custom_message',
      id: `footer-${now}`,
      alignment: randomChoice(alignments),
      message: randomChoice(footerMessages),
      dividerAtBottom: Math.random() > 0.5,
      dividerStyle: randomChoice(dividerStyles),
    });
  }

  // Barcode at bottom (if chosen)
  if (barcodePosition === 'bottom' && generated.includeBarcode) {
    sections.push({
      type: 'barcode',
      id: `barcode-bottom-${now}`,
      size: 2,
      length: 13,
      value: '1234567890123',
      dividerAtBottom: Math.random() > 0.5,
      dividerStyle: randomChoice(dividerStyles),
    });
  }

  // Date/time (always at end)
  const dateFormats = [
    'M/d/yyyy, h:mm:ss a',
    'MM/dd/yyyy h:mm a',
    'dd/MM/yyyy HH:mm',
    'MMMM d, yyyy h:mm a',
  ];
  
  sections.push({
    type: 'date_time',
    id: `date_time-${now}`,
    alignment: randomChoice(alignments),
    date: new Date().toISOString(),
    dateFormat: randomChoice(dateFormats),
    dividerAtBottom: false,
    dividerStyle: randomChoice(dividerStyles),
  });

  return {
    sections,
    settings: {
      currency: '$',
      currencyFormat: 'symbol_before',
      font,
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
      
      // Check if template with this slug already exists
      const existingCheckResponse = await fetch(`${req.headers.origin || 'http://localhost:5000'}/api/templates/by-slug/${generated.slug}`);
      
      if (existingCheckResponse.ok) {
        // Template already exists, skip it
        results.push({
          success: false,
          industry,
          error: `Template "${generated.name}" already exists (skipped)`,
          skipped: true,
        });
        continue;
      }
      
      // Generate and save logo
      const logoUrl = await generateAndSaveLogo(industry, generated.slug);
      
      const templateConfig = createRandomTemplate(generated, logoUrl);

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
