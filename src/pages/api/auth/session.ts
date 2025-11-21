import type { APIRoute } from 'astro';
import { Auth, getSessionFromCookie } from '../../../lib/auth';

export const GET: APIRoute = async ({ request, locals }) => {
  const runtime = locals.runtime;
  if (!runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionId = getSessionFromCookie(request.headers.get('cookie'));

  if (!sessionId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const auth = new Auth(runtime.env.DB);
    const session = await auth.getSession(sessionId);

    if (!session) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          username: session.username,
          role: session.role,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
