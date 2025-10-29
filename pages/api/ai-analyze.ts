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

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      filter: (part) => {
        return part.mimetype && ALLOWED_MIMETYPES.includes(part.mimetype);
      },
    });
    
    const [fields, files] = await form.parse(req);

    const file = files.image?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Additional server-side validation
    if (!file.mimetype || !ALLOWED_MIMETYPES.includes(file.mimetype)) {
      // Clean up the file
      try {
        fs.unlinkSync(file.filepath);
      } catch (e) {
        // Ignore cleanup errors
      }
      return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
    }

    if (file.size > MAX_FILE_SIZE) {
      // Clean up the file
      try {
        fs.unlinkSync(file.filepath);
      } catch (e) {
        // Ignore cleanup errors
      }
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
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
              text: `You are an OCR expert. Extract EVERY piece of text from this receipt image. This could be a retail receipt, bank receipt, ATM receipt, invoice, etc.

CRITICAL INSTRUCTIONS:
1. Extract ALL visible text - leave nothing out
2. Preserve the exact text as shown (don't normalize or clean it up)
3. If there are transaction IDs, reference numbers, batch numbers - include them ALL
4. If it's a payment receipt, include ALL the card/payment details
5. Only omit a field if it's completely absent from the image

Return a JSON object with these fields (omit only if truly not visible):

{
  "businessName": "exact business/bank name as shown",
  "businessLines": ["line 1", "line 2", "line 3"] - ALL lines from top section including branch, location, IDs, etc.,
  "receiptTitle": "SALE, TRANSACTION, PURCHASE, etc - whatever it says",
  "transactionDetails": ["HOST:BBL HOST", "TID:S018993", etc] - ALL transaction IDs, reference numbers, batch numbers, trace numbers visible,
  "receiptNumber": "receipt/transaction number if visible",
  "date": "date in ISO format (YYYY-MM-DDTHH:mm:ss) if visible",
  "items": [{"description": "item description", "quantity": 1, "price": 0.00}] - for retail receipts with itemized purchases,
  "paymentInfo": {
    "method": "cash" or "card",
    "cardType": "VISA/MASTERCARD/etc",
    "cardNumber": "last 4 digits or masked number as shown (e.g., ****5983)",
    "amount": "amount charged"
  },
  "amounts": {
    "subtotal": 0.00,
    "tax": 0.00,
    "taxRate": "8.25%",
    "total": 0.00,
    "currency": "THB/USD/EUR etc - detect from image"
  },
  "approvalInfo": ["Approved", "AUTH:123456", etc] - approval codes, status,
  "footerLines": ["Thank you", "No refund", "Customer copy", etc] - ALL footer text,
  "barcode": "barcode number if visible",
  "font": "mono" or "receipt",
  "textAlignment": "left" or "center"
}

EXAMPLES OF GOOD EXTRACTION:
- If you see "HOST:BBL HOST" → include in transactionDetails
- If you see "BATCH:000008" → include in transactionDetails  
- If you see "REF NO:0000110342233" → include in transactionDetails
- If you see "132/1 T.NONGPAKANG A.MUA CHIANGMAI" → include in businessLines
- If you see "*** NO REFUND ***" → include in footerLines

Extract EVERYTHING. This is for a receipt generator, so completeness is critical.`,
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
