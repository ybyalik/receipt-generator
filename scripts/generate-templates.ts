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
  items: Array<{ item: string; quantity: number; price: number }>;
  paymentType: 'cash' | 'card';
  includeBarcode: boolean;
}

async function generateTemplateForIndustry(industry: string): Promise<GeneratedTemplate> {
  const prompt = `Generate a realistic receipt template for a ${industry} business. Return ONLY valid JSON with this exact structure:

{
  "name": "${industry} Receipt",
  "slug": "slug-format",
  "businessName": "Realistic business name",
  "businessAddress": "Street address\\nCity, State ZIP\\nCountry",
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
  return generated;
}

async function createTemplateInDatabase(generated: GeneratedTemplate) {
  const sections = [];
  
  sections.push({
    type: 'header',
    id: `header-${Date.now()}`,
    alignment: 'center',
    logoSize: 50,
    businessDetails: `${generated.businessName}\n${generated.businessAddress}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  sections.push({
    type: 'custom_message',
    id: `custom_message-${Date.now()}`,
    alignment: 'center',
    message: `${generated.name}\nReceipt #: RCP-${Math.floor(Math.random() * 1000000)}`,
    dividerAtBottom: true,
    dividerStyle: 'dashed',
  });

  if (generated.includeBarcode) {
    sections.push({
      type: 'barcode',
      id: `barcode-${Date.now()}`,
      size: 2,
      length: 13,
      value: '1234567890123',
      dividerAtBottom: true,
      dividerStyle: 'dashed',
    });
  }

  const subtotal = generated.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  sections.push({
    type: 'items_list',
    id: `items_list-${Date.now()}`,
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
    id: `payment-${Date.now()}`,
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

  sections.push({
    type: 'date_time',
    id: `date_time-${Date.now()}`,
    alignment: 'center',
    date: new Date().toISOString(),
    dateFormat: 'MM/dd/yyyy, h:mm:ss a',
    dividerAtBottom: false,
    dividerStyle: 'dashed',
  });

  const templateData = {
    name: generated.name,
    slug: generated.slug,
    sections,
    settings: {
      currency: '$',
      currencyFormat: 'symbol_before',
      font: 'courier',
      textColor: '#000000',
      backgroundTexture: 'none',
    },
  };

  const response = await fetch('http://localhost:5000/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...templateData,
      userEmail: process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')[0] || 'admin@example.com',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create template: ${response.statusText}`);
  }

  return await response.json();
}

async function main() {
  const industries = ['Mechanic Shop', 'Pawn Shop', 'Carpet Cleaning'];

  console.log('🤖 Starting AI template generation...\n');

  for (const industry of industries) {
    try {
      console.log(`📝 Generating ${industry} template...`);
      const generated = await generateTemplateForIndustry(industry);
      console.log(`   Business: ${generated.businessName}`);
      console.log(`   Items: ${generated.items.length} items`);
      
      console.log(`💾 Saving to database...`);
      const saved = await createTemplateInDatabase(generated);
      console.log(`✅ Created: ${saved.name} (ID: ${saved.id})\n`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to generate ${industry}:`, error);
    }
  }

  console.log('✨ All templates generated!');
}

main().catch(console.error);
