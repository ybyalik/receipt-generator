// Referenced from blueprint:javascript_object_storage
import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectStorageService } from '../../../server/objectStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filePath } = req.query;
  
  if (!filePath || !Array.isArray(filePath)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  const fullPath = filePath.join('/');
  const objectStorageService = new ObjectStorageService();
  
  try {
    const file = await objectStorageService.searchPublicObject(fullPath);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    await objectStorageService.downloadObject(file, res);
  } catch (error) {
    console.error('Error searching for public object:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
