import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    // TODO: Integrar com Brevo para envio de e-mail de recuperação
    // 1. Verificar se o email existe no banco
    // 2. Gerar token de recuperação
    // 3. Salvar token no banco com expiração
    // 4. Enviar e-mail via Brevo com link de reset

    console.log(`[Forgot Password] Solicitação para: ${email}`);

    // Sempre retorna sucesso (não revelar se email existe)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
