import type { APIRoute } from 'astro';
import { Auth, createSessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = locals.runtime;
  if (!runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const auth = new Auth(runtime.env.DB);
    const user = await auth.authenticate(username, password);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionId = await auth.createSession(user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        } 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': createSessionCookie(sessionId),
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
