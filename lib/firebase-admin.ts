import admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  } else if (projectId) {
    // Fallback: initialize without service account (won't be able to verify tokens)
    admin.initializeApp({ projectId });
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns the decoded token or null if invalid/missing.
 */
export async function verifyAuthToken(authHeader: string | undefined) {
  if (!adminAuth || !authHeader?.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}
