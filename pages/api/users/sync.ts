import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByFirebaseUid, createUser } from '../../../server/storage';
import { Resend } from 'resend';

function generateWelcomeEmail(displayName: string) {
  const name = displayName || 'there';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Receipt Generator</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Receipt Generator</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Welcome to the Family!</p>
            </td>
          </tr>
          
          <!-- Welcome Message -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1e3a5f; font-size: 24px;">Hi ${name}!</h2>
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for joining Receipt Generator! We're excited to have you on board.
              </p>
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                With Receipt Generator, you can create professional receipts in seconds using our easy-to-use templates and customization tools.
              </p>
              
              <!-- Features -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px; color: #1e3a5f; font-size: 18px;">What you can do:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #4a5568; line-height: 1.8;">
                      <li>Browse and use professional receipt templates</li>
                      <li>Customize receipts with your business details</li>
                      <li>Download receipts as high-quality images</li>
                      <li>Save your favorite templates for quick access</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Ready to get started? Click the button below to explore our templates:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://receiptgenerator.net/templates" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Browse Templates
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Premium Upsell -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                <tr>
                  <td style="padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <h4 style="margin: 0 0 10px; color: #92400e; font-size: 16px;">Upgrade to Premium</h4>
                    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                      Remove watermarks and unlock all features with our Premium subscription. Starting at just $4.99/week!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f8fafc; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                Questions? Contact us at <a href="mailto:contact@receiptgenerator.net" style="color: #2d5a87; text-decoration: none;">contact@receiptgenerator.net</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Receipt Generator. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function sendWelcomeEmail(email: string, displayName: string | null) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping welcome email');
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@receiptgenerator.net';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to Receipt Generator!',
      html: generateWelcomeEmail(displayName || ''),
    });
    
    console.log(`Welcome email sent to ${email}:`, JSON.stringify(result));
  } catch (error: any) {
    console.error('Failed to send welcome email:', error.message);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firebaseUid, email, displayName, photoURL } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let user = await getUserByFirebaseUid(firebaseUid);
    let isNewUser = false;

    if (!user) {
      user = await createUser({
        firebaseUid,
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
        isPremium: false,
      });
      isNewUser = true;
    }

    // Send welcome email for new users (async, don't wait)
    if (isNewUser) {
      sendWelcomeEmail(email, displayName).catch(err => 
        console.error('Welcome email error:', err)
      );
    }

    return res.status(200).json(user);
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
