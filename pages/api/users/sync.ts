import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByFirebaseUid, createUser } from '../../../server/storage';

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

    if (!user) {
      user = await createUser({
        firebaseUid,
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
        isPremium: false,
      });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
