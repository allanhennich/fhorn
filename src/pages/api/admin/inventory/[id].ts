import type { APIRoute } from 'astro';
import { query } from '../../../../data/admin/db';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const data = await request.json();

    await query(
      `UPDATE box_units SET status=?, category=?, tenant_name=?, tenant_phone=?, tenant_email=?, tenant_notes=? WHERE id=?`,
      [
        data.status,
        data.category || '',
        data.tenant_name || '',
        data.tenant_phone || '',
        data.tenant_email || '',
        data.tenant_notes || '',
        id,
      ]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Inventory update error:', err);
    return new Response(JSON.stringify({ error: 'Erro ao atualizar box' }), { status: 500 });
  }
};
