/**
 * POST /api/admin/boxes/[id]/toggle
 *
 * Toggle a box's active status.
 */

import type { APIRoute } from 'astro';
import { toggleBox } from '../../../../../data/admin/boxes.js';

export const POST: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'ID obrigatorio' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const box = await toggleBox(id);

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
      JSON.stringify({ error: 'Erro ao alternar status do box' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
