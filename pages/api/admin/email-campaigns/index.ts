import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminEmail } from '../../../../server/auth';
import {
  getEmailCampaignEnabled,
  setEmailCampaignEnabled,
  getEmailSequenceSteps,
  getEmailSequenceStep,
  createEmailSequenceStep,
  updateEmailSequenceStep,
  deleteEmailSequenceStep,
  getEmailCampaignStats,
  getRecentSendLogs,
  getEmailCaptureLeads,
} from '../../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const userEmail = req.query.userEmail as string;
      if (!userEmail || !isAdminEmail(userEmail)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      try {
        const [campaignEnabled, steps, stats, recentLogs, leads] = await Promise.all([
          getEmailCampaignEnabled(),
          getEmailSequenceSteps(),
          getEmailCampaignStats(),
          getRecentSendLogs(50),
          getEmailCaptureLeads(100),
        ]);

        return res.status(200).json({
          campaignEnabled,
          steps,
          stats,
          recentLogs,
          leads,
        });
      } catch (error: any) {
        console.error('Email campaigns GET error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    case 'PUT': {
      const { userEmail, action, ...data } = req.body;
      if (!userEmail || !isAdminEmail(userEmail)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      try {
        switch (action) {
          case 'toggle': {
            await setEmailCampaignEnabled(data.enabled);
            return res.status(200).json({ success: true, enabled: data.enabled });
          }

          case 'updateStep': {
            const { step } = data;
            if (!step?.id) {
              return res.status(400).json({ error: 'Step ID required' });
            }
            const updated = await updateEmailSequenceStep(step.id, {
              subject: step.subject,
              htmlBody: step.htmlBody,
              delayMinutes: step.delayMinutes,
              isActive: step.isActive,
              stepNumber: step.stepNumber,
            });
            return res.status(200).json({ success: true, step: updated });
          }

          case 'createStep': {
            const { step } = data;
            if (!step?.subject || !step?.htmlBody || !step?.delayMinutes || !step?.stepNumber) {
              return res.status(400).json({ error: 'Missing required step fields' });
            }
            const created = await createEmailSequenceStep({
              stepNumber: step.stepNumber,
              delayMinutes: step.delayMinutes,
              subject: step.subject,
              htmlBody: step.htmlBody,
            });
            return res.status(201).json({ success: true, step: created });
          }

          case 'deleteStep': {
            const { stepId } = data;
            if (!stepId) {
              return res.status(400).json({ error: 'Step ID required' });
            }
            await deleteEmailSequenceStep(stepId);
            return res.status(200).json({ success: true });
          }

          default:
            return res.status(400).json({ error: `Unknown action: ${action}` });
        }
      } catch (error: any) {
        console.error('Email campaigns PUT error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
