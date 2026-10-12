/**
 * /api/admin/boxes/[id]
 *
 * GET    — Get a single box
 * PUT    — Update a box
 * DELETE — Delete a box
 */

import type { APIRoute } from 'astro';
import { getBox, updateBox, deleteBox } from '../../../../data/admin/boxes.js';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'ID obrigatorio' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const box = await getBox(id);

    if (!box) {
      return new Response(
        JSON.stringify({ error: 'Box nao encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify(box),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar box' }),
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
    const updated = await updateBox(id, body);

    if (!updated) {
      return new Response(
        JSON.stringify({ error: 'Box nao encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify(updated),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao atualizar box' }),
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
    const deleted = await deleteBox(id);

    if (!deleted) {
      return new Response(
        JSON.stringify({ error: 'Box nao encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao excluir box' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
