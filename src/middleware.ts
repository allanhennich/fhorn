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

  let session;
  try {
    session = await validateSession(token);
  } catch (err) {
    console.error('[middleware] Erro de conexão ao validar sessão:', (err as any)?.code || err);
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Erro de conexão com o banco de dados. Tente novamente.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '5' },
      });
    }
    return new Response(
      `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Erro de Conexão | F.Horn Admin</title><style>body{font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb;color:#374151}.card{text-align:center;padding:3rem;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.1);max-width:480px}h1{font-size:1.5rem;color:#0c2340;margin:0 0 .75rem}p{color:#6b7280;line-height:1.6;margin:0 0 1.5rem}.btn{display:inline-block;padding:.75rem 1.5rem;background:#0c2340;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;transition:background .2s}.btn:hover{background:#1a3a5c}.icon{font-size:2.5rem;margin-bottom:1rem}</style></head><body><div class="card"><div class="icon">⚠️</div><h1>Erro de Conexão</h1><p>Não foi possível conectar ao banco de dados. Isso geralmente é temporário. Aguarde alguns segundos e tente novamente.</p><a class="btn" href="${pathname}">Tentar novamente</a></div></body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '5' } },
    );
  }

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
  let allUsers;
  try {
    allUsers = await listUsers();
  } catch (err) {
    console.error('[middleware] Erro de conexão ao buscar usuário:', (err as any)?.code || err);
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Erro de conexão com o banco de dados. Tente novamente.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '5' },
      });
    }
    return new Response(
      `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Erro de Conexão | F.Horn Admin</title><style>body{font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb;color:#374151}.card{text-align:center;padding:3rem;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.1);max-width:480px}h1{font-size:1.5rem;color:#0c2340;margin:0 0 .75rem}p{color:#6b7280;line-height:1.6;margin:0 0 1.5rem}.btn{display:inline-block;padding:.75rem 1.5rem;background:#0c2340;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;transition:background .2s}.btn:hover{background:#1a3a5c}.icon{font-size:2.5rem;margin-bottom:1rem}</style></head><body><div class="card"><div class="icon">⚠️</div><h1>Erro de Conexão</h1><p>Não foi possível conectar ao banco de dados. Isso geralmente é temporário. Aguarde alguns segundos e tente novamente.</p><a class="btn" href="${pathname}">Tentar novamente</a></div></body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '5' } },
    );
  }

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
