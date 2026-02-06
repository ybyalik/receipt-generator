import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyUnsubscribeToken } from '../../../lib/unsubscribe';
import { unsubscribeEmail } from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).send(htmlPage('Invalid Link', 'The unsubscribe link is invalid or expired.'));
  }

  const email = verifyUnsubscribeToken(token);

  if (!email) {
    return res.status(400).send(htmlPage('Invalid Link', 'The unsubscribe link is invalid or expired.'));
  }

  try {
    await unsubscribeEmail(email);
    return res.status(200).send(htmlPage(
      'Unsubscribed',
      `<strong>${email}</strong> has been unsubscribed. You will no longer receive marketing emails from us.`
    ));
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).send(htmlPage('Error', 'Something went wrong. Please try again or contact support.'));
  }
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Receipt Generator</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f4f7fa; }
    .card { background: #fff; border-radius: 12px; padding: 48px; max-width: 480px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #111827; font-size: 24px; margin: 0 0 16px; }
    p { color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0; }
    strong { color: #111827; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
