import type { APIRoute } from 'astro';
import { ImageStorage } from '../../../lib/r2';

export const POST: APIRoute = async ({ locals, request }) => {
  const runtime = locals.runtime;
  if (!runtime?.env?.IMAGES) {
    return new Response(JSON.stringify({ error: 'Image storage not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'File must be an image' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const imageStorage = new ImageStorage(runtime.env.IMAGES);
    const key = imageStorage.generateKey(file.name);
    
    await imageStorage.uploadImage(key, file, {
      originalName: file.name,
      size: String(file.size),
    });

    const url = `/api/images/${key}`;

    return new Response(JSON.stringify({ key, url, success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
