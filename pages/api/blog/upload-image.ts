import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { S3StorageService } from '../../../server/s3Storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

const getContentType = (extension: string): string => {
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return types[extension.toLowerCase()] || 'image/png';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const tempDir = '/tmp/blog-uploads';
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir: tempDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }

    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const timestamp = Date.now();
      const originalName = (file as File).originalFilename || 'image';
      const extension = path.extname(originalName);
      const newFileName = `${timestamp}${extension}`;
      const contentType = getContentType(extension);

      // Read the file into a buffer
      const fileBuffer = fs.readFileSync((file as File).filepath);

      // Upload to S3
      const s3Service = new S3StorageService();
      const imageUrl = await s3Service.uploadBlogImage(fileBuffer, newFileName, contentType);

      // Clean up temp file
      fs.unlinkSync((file as File).filepath);

      console.log(`Blog image uploaded to S3: ${imageUrl}`);
      res.status(200).json({ url: imageUrl });
    } catch (error: any) {
      console.error('S3 upload error:', error);
      
      // Clean up temp file on error
      try {
        fs.unlinkSync((file as File).filepath);
      } catch {}
      
      return res.status(500).json({ error: 'Failed to upload image to storage' });
    }
  });
}
