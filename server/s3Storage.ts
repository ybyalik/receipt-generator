import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export class S3StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
    }

    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME not configured.');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadLogo(buffer: Buffer, filename: string): Promise<string> {
    const key = `logos/${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000',
    });

    await this.s3Client.send(command);

    // Return the public URL (assumes bucket is publicly accessible)
    const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    console.log(`[S3] Logo uploaded successfully: ${publicUrl}`);
    
    return publicUrl;
  }

  async uploadBlogImage(buffer: Buffer, filename: string, contentType: string = 'image/png'): Promise<string> {
    const key = `blog-images/${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
    });

    await this.s3Client.send(command);

    // Return the public URL (assumes bucket is publicly accessible)
    const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    console.log(`[S3] Blog image uploaded successfully: ${publicUrl}`);
    
    return publicUrl;
  }
}
