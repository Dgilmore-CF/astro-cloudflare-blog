import type { R2Bucket } from '@cloudflare/workers-types';

export interface ImageMetadata {
  contentType: string;
  size: number;
  uploadedAt: string;
  width?: number;
  height?: number;
}

export class ImageStorage {
  constructor(private bucket: R2Bucket) {}

  async uploadImage(key: string, file: File | Blob, metadata?: Record<string, string>): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    
    const customMetadata: Record<string, string> = {
      uploadedAt: new Date().toISOString(),
      contentType: file.type,
      ...metadata,
    };

    await this.bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata,
    });
  }

  async getImage(key: string): Promise<R2ObjectBody | null> {
    const object = await this.bucket.get(key);
    return object;
  }

  async getImageUrl(key: string): Promise<string | null> {
    const object = await this.bucket.get(key);
    if (!object) return null;
    
    // For production, you'd use a public R2 domain or custom domain
    // For now, we'll return the key which can be used with an API endpoint
    return `/api/images/${key}`;
  }

  async deleteImage(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async listImages(prefix?: string, limit = 100): Promise<string[]> {
    const options: R2ListOptions = { limit };
    if (prefix) options.prefix = prefix;
    
    const listed = await this.bucket.list(options);
    return listed.objects.map(obj => obj.key);
  }

  async getImageMetadata(key: string): Promise<ImageMetadata | null> {
    const object = await this.bucket.head(key);
    if (!object) return null;

    return {
      contentType: object.httpMetadata?.contentType || 'image/jpeg',
      size: object.size,
      uploadedAt: object.customMetadata?.uploadedAt || new Date().toISOString(),
      width: object.customMetadata?.width ? parseInt(object.customMetadata.width) : undefined,
      height: object.customMetadata?.height ? parseInt(object.customMetadata.height) : undefined,
    };
  }

  generateKey(filename: string, prefix = 'uploads'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = filename.split('.').pop();
    return `${prefix}/${timestamp}-${random}.${ext}`;
  }
}

// Type augmentation for R2 types not exported
type R2ObjectBody = Awaited<ReturnType<R2Bucket['get']>>;

interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiter?: string;
}
