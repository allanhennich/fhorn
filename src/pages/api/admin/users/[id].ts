/**
 * /api/admin/users/[id]
 *
 * GET    — Get a single user
 * PUT    — Update a user
 * DELETE — Delete a user
 */

import type { APIRoute } from 'astro';
import { listUsers, updateUser, deleteUser } from '../../../../data/admin/users.js';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'ID obrigatorio' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const users = await listUsers();
    const user = users.find((u) => u.id === id);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuario nao encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify(user),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar usuario' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'ID obrigatorio' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = await request.json();
    const updated = await updateUser(id, body);

    if (!updated) {
      return new Response(
        JSON.stringify({ error: 'Usuario nao encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify(updated),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao atualizar usuario' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'ID obrigatorio' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const deleted = await deleteUser(id);

    if (!deleted) {
      return new Response(
        JSON.stringify({ error: 'Usuario nao encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao excluir usuario' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
