import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function getApiBaseUrl(): string {
  // Use environment variable if available, otherwise fallback to localhost for development
  return process.env.API_BASE_URL || 'http://localhost:5000';
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
  
  const generated = JSON.parse(cleanedContent);
  
  // Generate unique slug from industry name
  const slug = industry
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    + '-receipt';
  
  generated.slug = slug;
  
  return generated;
}

// Template style 1: Furniture-style (barcode in middle, customer info, footer message)
function createFurnitureStyleTemplate(generated: GeneratedTemplate) {
  const sections = [];
  const now = Date.now();
  
  // Header with business details
  sections.push({
    type: 'header',
    id: `header-${now}`,
    alignment: 'center',
    logoSize: 50,
    businessDetails: `${generated.businessName}\n${generated.businessAddress}\n${generated.businessPhone || ''}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  // Receipt title
  sections.push({
    type: 'custom_message',
    id: `custom_message-${now}`,
    alignment: 'center',
    message: `Receipt #: ${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}\nReceipt date: ${new Date().toLocaleDateString('en-US')}\n\n${generated.name}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  // Barcode in middle
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

  // Customer billing info
  sections.push({
    type: 'custom_message',
    id: `billing-${now}`,
    alignment: 'center',
    message: `Billed to: Customer Name\n123 Willow Creek Road\nMadison, WI 53703`,
    dividerAtBottom: true,
    dividerStyle: 'dotted',
  });

  // Items list
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

  // Payment section with stars
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

  // Footer message
  sections.push({
    type: 'custom_message',
    id: `footer-${now}`,
    alignment: 'center',
    message: `Customers are encouraged to review their receipts immediately and report any discrepancies within 7 days. Any disputes regarding receipts or payments should be reported promptly and will be addressed within 10 business days. Receipts serve as proof of payment and include details such as date, amount paid, payment method, and items or services purchased.\n\nThank you for choosing ${generated.businessName}.`,
    dividerAtBottom: true,
    dividerStyle: 'stars',
  });

  // Date/time at bottom
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

// Template style 2: Pawn Shop-style (customer info section, barcode at bottom)
function createPawnShopStyleTemplate(generated: GeneratedTemplate) {
  const sections = [];
  const now = Date.now();
  
  // Header with contact info
  sections.push({
    type: 'header',
    id: `header-${now}`,
    alignment: 'center',
    logoSize: 50,
    businessDetails: `${generated.businessName}\n${generated.businessPhone || '(555) 123-4567'}\n${generated.businessAddress}\n${generated.businessEmail || 'contact@business.com'}`,
    dividerAtBottom: true,
    dividerStyle: 'double',
  });

  // Receipt title
  sections.push({
    type: 'custom_message',
    id: `title-${now}`,
    alignment: 'center',
    message: generated.name,
    dividerAtBottom: true,
    dividerStyle: 'double',
  });

  // Customer information section
  sections.push({
    type: 'custom_message',
    id: `customer-${now}`,
    alignment: 'left',
    message: `Customer Information:\nName: Customer Name\nAddress: 3914 Brookstone Avenue\nCharlotte, NC 28205`,
    dividerAtBottom: true,
    dividerStyle: 'stars',
  });

  // Items list
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

  // Payment section
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

  // Website URL
  sections.push({
    type: 'custom_message',
    id: `website-${now}`,
    alignment: 'center',
    message: generated.businessWebsite || 'www.business.com',
    dividerAtBottom: false,
    dividerStyle: 'dashed',
  });

  // Barcode at bottom
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

  // Date/time at bottom
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

// Template style 3: Minimal-style (simple layout, dashed dividers)
function createMinimalStyleTemplate(generated: GeneratedTemplate) {
  const sections = [];
  const now = Date.now();
  
  // Header
  sections.push({
    type: 'header',
    id: `header-${now}`,
    alignment: 'center',
    logoSize: 50,
    businessDetails: `${generated.businessName}\n${generated.businessAddress}\n${generated.businessPhone || ''}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  // Receipt title and number
  sections.push({
    type: 'custom_message',
    id: `title-${now}`,
    alignment: 'center',
    message: `${generated.name}\nReceipt #: RCP-${Math.floor(Math.random() * 1000000)}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  // Items list
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

  // Payment section
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

  // Barcode
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

  // Date/time
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

async function createTemplateInDatabase(generated: GeneratedTemplate, styleIndex: number, skipIfExists: boolean = true) {
  // Check if template already exists
  if (skipIfExists) {
    const checkResponse = await fetch(`${getApiBaseUrl()}/api/templates`);
    if (checkResponse.ok) {
      const existingTemplates = await checkResponse.json();
      const exists = existingTemplates.some((t: any) => t.slug === generated.slug);
      if (exists) {
        console.log(`   ⏭️  Template with slug "${generated.slug}" already exists, skipping...`);
        return null;
      }
    }
  }
  
  // Choose template style based on index
  let templateConfig;
  if (styleIndex === 0) {
    templateConfig = createFurnitureStyleTemplate(generated);
    console.log(`   🎨 Style: Furniture-style (barcode middle, customer info, footer)`);
  } else if (styleIndex === 1) {
    templateConfig = createPawnShopStyleTemplate(generated);
    console.log(`   🎨 Style: Pawn Shop-style (customer section, barcode bottom)`);
  } else {
    templateConfig = createMinimalStyleTemplate(generated);
    console.log(`   🎨 Style: Minimal-style (simple layout)`);
  }

  const templateData = {
    name: generated.name,
    slug: generated.slug,
    sections: templateConfig.sections,
    settings: templateConfig.settings,
  };

  const response = await fetch(`${getApiBaseUrl()}/api/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...templateData,
      userEmail: process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')[0] || 'admin@example.com',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create template: ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

async function main() {
  const industries = ['Mechanic Shop', 'Pawn Shop', 'Carpet Cleaning'];

  console.log('🤖 Starting AI template generation...\n');

  for (let i = 0; i < industries.length; i++) {
    const industry = industries[i];
    try {
      console.log(`📝 Generating ${industry} template...`);
      const generated = await generateTemplateForIndustry(industry);
      console.log(`   Business: ${generated.businessName}`);
      console.log(`   Items: ${generated.items.length} items`);
      
      console.log(`💾 Saving to database...`);
      const saved = await createTemplateInDatabase(generated, i); // Pass index for different styles
      if (saved) {
        console.log(`✅ Created: ${saved.name} (ID: ${saved.id})\n`);
      } else {
        console.log(`⏭️  Skipped (already exists)\n`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to generate ${industry}:`, error);
    }
  }

  console.log('✨ All templates generated!');
}

main().catch(console.error);
