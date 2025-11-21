import { defineMiddleware } from 'astro:middleware';
import { Auth, getSessionFromCookie } from './lib/auth';

export const onRequest = defineMiddleware(async ({ locals, request, url }, next) => {
  // Skip auth check for public routes
  const publicRoutes = ['/api/auth/login', '/api/posts', '/api/images', '/posts', '/about', '/'];
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route) || url.pathname === route);
  
  // Check if accessing admin area
  const isAdminRoute = url.pathname.startsWith('/admin');

  if (isAdminRoute && locals.runtime?.env?.DB) {
    const sessionId = getSessionFromCookie(request.headers.get('cookie'));
    
    if (sessionId) {
      const auth = new Auth(locals.runtime.env.DB);
      const session = await auth.getSession(sessionId);
      
      if (session) {
        // Store user info in locals for use in pages
        locals.user = {
          username: session.username,
          role: session.role,
          userId: session.userId,
        };
      }
    }

    // If no valid session, redirect to login
    if (!locals.user) {
      return Response.redirect(new URL('/login', url.origin), 302);
    }
  }

  return next();
});
