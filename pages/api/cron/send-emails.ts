import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import {
  getEmailCampaignEnabled,
  getEmailSequenceSteps,
  getEligibleEmailsForStep,
  logEmailSend,
} from '../../../server/storage';
import { generateWinBackEmail } from '../../../lib/email-templates';
import { getUnsubscribeUrl } from '../../../lib/unsubscribe';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate via bearer token
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token || token !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const enabled = await getEmailCampaignEnabled();
    if (!enabled) {
      return res.status(200).json({
        success: true,
        campaignEnabled: false,
        message: 'Campaign is disabled',
        processed: 0, sent: 0, failed: 0, skipped: 0,
      });
    }

    const steps = await getEmailSequenceSteps();
    const activeSteps = steps.filter(s => s.isActive);

    let totalSent = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalProcessed = 0;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@receiptgenerator.net';

    for (const step of activeSteps) {
      const eligible = await getEligibleEmailsForStep(
        step.stepNumber,
        step.delayMinutes,
        50
      );

      for (const lead of eligible) {
        totalProcessed++;

        try {
          const unsubscribeUrl = getUnsubscribeUrl(lead.email);
          const html = generateWinBackEmail({
            htmlBody: step.htmlBody,
            unsubscribeUrl,
          });

          const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: lead.email,
            subject: step.subject,
            html,
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
            },
          });

          if (error) {
            await logEmailSend({
              emailCaptureId: lead.id,
              email: lead.email,
              stepNumber: step.stepNumber,
              status: 'failed',
              errorMessage: error.message,
            });
            totalFailed++;
          } else {
            await logEmailSend({
              emailCaptureId: lead.id,
              email: lead.email,
              stepNumber: step.stepNumber,
              status: 'sent',
              resendMessageId: data?.id,
            });
            totalSent++;
          }
        } catch (err: any) {
          await logEmailSend({
            emailCaptureId: lead.id,
            email: lead.email,
            stepNumber: step.stepNumber,
            status: 'failed',
            errorMessage: err.message || 'Unknown error',
          });
          totalFailed++;
        }
      }
    }

    return res.status(200).json({
      success: true,
      campaignEnabled: true,
      processed: totalProcessed,
      sent: totalSent,
      failed: totalFailed,
      skipped: totalSkipped,
    });
  } catch (error: any) {
    console.error('Cron send-emails error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
