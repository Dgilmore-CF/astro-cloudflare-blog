import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals, params }) => {
  const runtime = locals.runtime;
  if (!runtime?.env?.IMAGES) {
    return new Response('Image storage not configured', { status: 500 });
  }

  const key = params.key;
  if (!key) {
    return new Response('Image key required', { status: 400 });
  }

  try {
    const object = await runtime.env.IMAGES.get(key);
    
    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    const arrayBuffer = await object.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new Response('Failed to retrieve image', { status: 500 });
  }
};
