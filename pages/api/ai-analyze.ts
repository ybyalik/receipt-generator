import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const file = files.image?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync(file.filepath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = file.mimetype || 'image/jpeg';

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a receipt analyzer. Extract all information from receipt images and return structured JSON data. Be precise with formatting, alignment, and visual details.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this receipt image and extract ALL visible information. Return a JSON object with:
{
  "businessName": "store/business name",
  "address": "full address (each line separated by newline)",
  "phone": "phone number if visible",
  "email": "email if visible",
  "website": "website if visible",
  "receiptTitle": "receipt title (e.g., 'Sales Receipt', 'Invoice')",
  "receiptNumber": "receipt/invoice number",
  "date": "date in ISO format (YYYY-MM-DDTHH:mm:ss)",
  "items": [{"description": "item name/description", "quantity": 1, "price": 0.00}],
  "subtotal": 0.00,
  "tax": 0.00,
  "taxRate": "8.25%",
  "total": 0.00,
  "paymentMethod": "cash" or "card",
  "cardType": "visa/mastercard/etc if visible",
  "cardLast4": "last 4 digits if visible",
  "barcode": "barcode number if visible",
  "footerMessage": "thank you message or other footer text",
  "font": "mono" (use mono for most receipts, receipt for thermal style),
  "textAlignment": "left" or "center" (how most text is aligned),
  "currency": "USD" (default to USD unless specified)
}

Be thorough - extract every piece of text you see. If a field is not visible, omit it from the JSON.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const receiptData = JSON.parse(content);

    // Clean up the uploaded file
    fs.unlinkSync(file.filepath);

    return res.status(200).json(receiptData);
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze receipt', 
      details: error.message 
    });
  }
}
