import type { APIRoute } from 'astro';
import { Auth, getSessionFromCookie, clearSessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = locals.runtime;
  if (!runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionId = getSessionFromCookie(request.headers.get('cookie'));

  if (sessionId) {
    const auth = new Auth(runtime.env.DB);
    await auth.deleteSession(sessionId);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    },
  });
};
