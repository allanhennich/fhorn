/**
 * POST /api/admin/auth/login
 *
 * Authenticates an admin user and creates a session.
 */

import type { APIRoute } from 'astro';
import { verifyPassword } from '../../../../data/admin/users.js';
import { createSession } from '../../../../data/admin/sessions.js';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha sao obrigatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const user = await verifyPassword(email, password);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Credenciais invalidas' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const token = await createSession(user.id);

    cookies.set('fhorn_session', token, {
      httpOnly: true,
      path: '/',
      maxAge: 86400, // 24 hours
      sameSite: 'lax',
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
