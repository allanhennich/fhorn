import type { APIRoute } from 'astro';
import { query } from '../../data/admin/db';
import { createHash, randomUUID } from 'node:crypto';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Hash the IP for privacy (not storing raw IP)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16);

    const userAgent = request.headers.get('user-agent') || '';

    await query(
      'INSERT INTO cookie_consents (id, ip_hash, user_agent, consent_type, cookies_accepted) VALUES (?, ?, ?, ?, ?)',
      [
        randomUUID(),
        ipHash,
        userAgent.slice(0, 500),
        data.type || 'accepted',
        JSON.stringify(data.cookies || { essential: true, analytics: true, marketing: true }),
      ]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Consent error:', err);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
};
