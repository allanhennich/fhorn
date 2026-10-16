import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'Nenhum arquivo enviado' }), { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Arquivo deve ser uma imagem' }), { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Imagem deve ter no maximo 5MB' }), { status: 400 });
    }

    // Generate filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const slug = formData.get('slug') as string || 'box';
    const filename = `${slug}-${Date.now()}.${ext}`;

    // Save to public/images/boxes/
    const uploadDir = join(process.cwd(), 'dist', 'client', 'images', 'boxes');
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Also save to public for dev mode
    const publicDir = join(process.cwd(), 'public', 'images', 'boxes');
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, filename), buffer);

    const imagePath = `/images/boxes/${filename}`;

    return new Response(JSON.stringify({
      success: true,
      path: imagePath,
      filename
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: 'Erro ao fazer upload' }), { status: 500 });
  }
};
