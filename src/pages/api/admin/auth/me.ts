/**
 * GET /api/admin/auth/me
 *
 * Returns the currently authenticated user's info.
 * The user object is populated by the auth middleware.
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(
      JSON.stringify({ error: 'Nao autenticado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ user: locals.user }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
