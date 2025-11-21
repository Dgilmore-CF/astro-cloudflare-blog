import type { APIRoute } from 'astro';
import { Auth } from '../../../lib/auth';

// SECURITY: This endpoint should be disabled after creating the first admin
// or protected with a setup token
export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = locals.runtime;
  if (!runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Check if any users exist (only allow if no users exist)
    const existingUsers = await runtime.env.DB
      .prepare('SELECT COUNT(*) as count FROM users')
      .first() as any;

    if (existingUsers && existingUsers.count > 0) {
      return new Response(JSON.stringify({ error: 'User registration is disabled' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: 'All fields required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const auth = new Auth(runtime.env.DB);
    const userId = await auth.createUser(username, email, password, 'admin');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        userId 
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Registration failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
