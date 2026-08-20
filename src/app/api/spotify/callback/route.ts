/**
 * Callback seguro para obtener REFRESH_TOKEN.
 * Usa: https://fyez.vercel.app/api/spotify/callback
 * Este endpoint es solo para el setup inicial (una sola vez).
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new NextResponse(`<h1>Error Spotify: ${error}</h1>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (!code) {
    // Si entras sin ?code, te muestra el link para autorizar
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = 'https://fyez.vercel.app/api/spotify/callback';
    const scopes = 'playlist-read-private playlist-read-collaborative';
    const authUrl =
      'https://accounts.spotify.com/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: clientId || '60f33b02f6ad4dd899de20750b281d29',
        scope: scopes,
        redirect_uri: redirectUri,
      });

    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:40px;background:#0e1530;color:#e9edf6">
        <h1>🎵 Conectar Spotify</h1>
        <p>1) Asegúrate que en <a href="https://developer.spotify.com/dashboard/60f33b02f6ad4dd899de20750b281d29/settings" style="color:#a08ad8">Spotify Dashboard > Settings</a> tengas como Redirect URI:</p>
        <code style="background:#1c2649;padding:8px 12px;border-radius:8px;display:inline-block">https://fyez.vercel.app/api/spotify/callback</code>
        <p>2) Click para autorizar:</p>
        <a href="${authUrl}" style="display:inline-block;background:#1DB954;color:white;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:bold;margin-top:12px">Autorizar con Spotify</a>
        <p style="margin-top:24px;opacity:.7;font-size:13px">Te pedirá login de Spotify y volverá acá mostrando tu REFRESH_TOKEN.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } },
    );
  }

  // Intercambiar code por tokens
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = 'https://fyez.vercel.app/api/spotify/callback';

  if (!clientId || !clientSecret) {
    return new NextResponse('<h1>Faltan SPOTIFY_CLIENT_ID / SECRET en Vercel env</h1>', {
      headers: { 'Content-Type': 'text/html' },
      status: 500,
    });
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    return new NextResponse(`<h1>Error al obtener tokens</h1><pre>${JSON.stringify(data, null, 2)}</pre>`, {
      headers: { 'Content-Type': 'text/html' },
      status: 500,
    });
  }

  // data.refresh_token es el que dura para siempre
  return new NextResponse(
    `<html><body style="font-family:sans-serif;padding:40px;background:#0e1530;color:#e9edf6;word-break:break-all">
      <h1 style="color:#8fae8f">✅ ¡Conectado!</h1>
      <p>Copia este valor y ponlo en tu <b>.env.local</b> y en <b>Vercel > Settings > Environment Variables</b>:</p>
      <div style="background:#1c2649;border:1px solid #2a3560;padding:16px;border-radius:12px;margin:16px 0">
        <div style="font-size:11px;letter-spacing:.15em;opacity:.6">SPOTIFY_REFRESH_TOKEN</div>
        <code style="font-size:14px;color:#d8bd8f">${data.refresh_token}</code>
      </div>
      <p style="font-size:13px;opacity:.7">access_token de prueba (expira en 1h):<br><code>${data.access_token.slice(0, 60)}...</code></p>
      <p style="margin-top:24px"><b>Siguiente:</b> ya puedes cerrar esto y probar <code>/api/spotify-sync</code></p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } },
  );
}
