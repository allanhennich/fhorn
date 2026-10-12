/**
 * F.Horn Self Storage — Astro middleware for admin authentication.
 *
 * Protects all /admin/* pages and /api/admin/* routes,
 * except for the login page, login API, and analytics tracking.
 */

import { defineMiddleware } from 'astro:middleware';
import { validateSession } from './data/admin/sessions.js';
import { listUsers } from './data/admin/users.js';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // ── Public routes: pass through ──────────────────────────────────────
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return next();
  }

  // Login page is public
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return next();
  }

  // Login API is public
  if (pathname === '/api/admin/auth/login') {
    return next();
  }

  // Analytics tracking is public
  if (pathname === '/api/admin/analytics/track') {
    return next();
  }

  // ── Protected routes: require valid session ──────────────────────────
  const sessionCookie = context.cookies.get('fhorn_session');
  const isApiRoute = pathname.startsWith('/api/');

  if (!sessionCookie) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Autenticacao necessaria' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login/');
  }

  const token = sessionCookie.value;
  const session = await validateSession(token);

  if (!session) {
    // Session invalid or expired — clear cookie
    context.cookies.delete('fhorn_session', { path: '/' });

    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Sessao invalida ou expirada' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login/');
  }

  // Look up the user from the session's userId
  const allUsers = await listUsers();
  const user = allUsers.find((u) => u.id === session.userId);

  if (!user) {
    context.cookies.delete('fhorn_session', { path: '/' });

    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Usuario nao encontrado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login/');
  }

  // Attach user info to locals for downstream use
  context.locals.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return next();
});
