/**
 * POST /api/admin/analytics/track
 *
 * Public endpoint — records a page view.
 * No authentication required.
 */

import type { APIRoute } from 'astro';
import { trackPageView } from '../../../../data/admin/analytics.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { path, referrer } = body as {
      path?: string;
      referrer?: string;
    };

    if (!path) {
      return new Response(
        JSON.stringify({ error: 'Path e obrigatorio' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const userAgent = request.headers.get('user-agent') ?? '';

    const pageView = await trackPageView({
      path,
      referrer: referrer ?? '',
      userAgent,
    });

    return new Response(
      JSON.stringify({ success: true, id: pageView.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao registrar visualizacao' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
