/**
 * POST /api/admin/auth/logout
 *
 * Destroys the current session and clears the cookie.
 */

import type { APIRoute } from 'astro';
import { destroySession } from '../../../../data/admin/sessions.js';

export const POST: APIRoute = async ({ cookies }) => {
  const sessionCookie = cookies.get('fhorn_session');

  if (sessionCookie) {
    await destroySession(sessionCookie.value);
    cookies.delete('fhorn_session', { path: '/' });
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
