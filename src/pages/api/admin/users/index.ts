/**
 * /api/admin/users
 *
 * GET  — List all users
 * POST — Create a new user
 */

import type { APIRoute } from 'astro';
import { listUsers, createUser } from '../../../../data/admin/users.js';

export const GET: APIRoute = async () => {
  try {
    const users = await listUsers();

    return new Response(
      JSON.stringify(users),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao listar usuarios' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, password, role } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: 'admin' | 'editor';
    };

    if (!name || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Nome, email, senha e papel sao obrigatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const user = await createUser({ name, email, password, role });

    return new Response(
      JSON.stringify(user),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao criar usuario' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
