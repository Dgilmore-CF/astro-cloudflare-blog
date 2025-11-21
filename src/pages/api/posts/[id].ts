import type { APIRoute } from 'astro';
import { BlogDB } from '../../../lib/db';

export const DELETE: APIRoute = async ({ locals, params }) => {
  const runtime = locals.runtime;
  if (!runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = parseInt(params.id || '0');
  if (!id) {
    return new Response(JSON.stringify({ error: 'Invalid post ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = new BlogDB(runtime.env.DB);
    await db.deletePost(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  const runtime = locals.runtime;
  if (!runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = parseInt(params.id || '0');
  if (!id) {
    return new Response(JSON.stringify({ error: 'Invalid post ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const db = new BlogDB(runtime.env.DB);
    
    await db.updatePost(id, {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      featured_image: body.featured_image,
      author: body.author,
      status: body.status,
      updated_date: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
