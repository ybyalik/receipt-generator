import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { testEmail } = req.body;
  
  if (!testEmail) {
    return res.status(400).json({ error: 'testEmail is required in the request body' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  console.log('Test email config:', {
    resendApiKey: resendApiKey ? `${resendApiKey.substring(0, 10)}...` : 'NOT SET',
    fromEmail: fromEmail || 'NOT SET',
    testEmail,
  });

  if (!resendApiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
  }

  if (!fromEmail) {
    return res.status(500).json({ error: 'RESEND_FROM_EMAIL is not configured' });
  }

  const resend = new Resend(resendApiKey);

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: 'Test Email from Receipt Generator',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the Resend configuration is working.</p>
        <p>From: ${fromEmail}</p>
        <p>To: ${testEmail}</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    });

    console.log('Test email result:', JSON.stringify(result));

    return res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully',
      result 
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error.message
    });
  }
}
