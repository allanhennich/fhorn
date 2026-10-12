/**
 * /api/admin/boxes
 *
 * GET  — List all boxes
 * POST — Create a new box
 */

import type { APIRoute } from 'astro';
import { listBoxes, createBox } from '../../../../data/admin/boxes.js';

export const GET: APIRoute = async () => {
  try {
    const boxes = await listBoxes();

    return new Response(
      JSON.stringify(boxes),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao listar boxes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const box = await createBox(body);

    return new Response(
      JSON.stringify(box),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao criar box' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
