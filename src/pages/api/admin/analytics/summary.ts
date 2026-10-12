/**
 * GET /api/admin/analytics/summary
 *
 * Protected endpoint — returns analytics summary data.
 */

import type { APIRoute } from 'astro';
import { getAnalyticsSummary } from '../../../../data/admin/analytics.js';

export const GET: APIRoute = async () => {
  try {
    const summary = await getAnalyticsSummary();

    return new Response(
      JSON.stringify(summary),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar resumo de analytics' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
