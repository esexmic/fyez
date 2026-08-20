/**
 * Script para obtener SPOTIFY_REFRESH_TOKEN (se ejecuta una sola vez).
 *
 * Uso:
 *   1. Asegurate de tener en .env.local:
 *      SPOTIFY_CLIENT_ID=xxx
 *      SPOTIFY_CLIENT_SECRET=yyy
 *   2. Corre: node scripts/get-spotify-token.mjs
 *   3. Se abre el navegador -> Acepta permisos -> te muestra el REFRESH_TOKEN
 *
 * Requisitos: redirect URI en tu App de Spotify debe ser exactamente
 *             http://localhost:8888/callback
 *             (Spotify Dashboard > tu App > Edit Settings > Redirect URIs)
 */

import http from 'http';
import { exec } from 'child_process';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8888/callback';
const SCOPES = 'playlist-read-private playlist-read-collaborative';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Falta SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET en env. Ej:');
  console.error('  $env:SPOTIFY_CLIENT_ID="xxx"; $env:SPOTIFY_CLIENT_SECRET="yyy"; node scripts/get-spotify-token.mjs (PowerShell)');
  process.exit(1);
}

const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
  });

console.log('\n1) Abre esta URL en tu navegador y acepta:\n');
console.log(authUrl + '\n');
console.log('2) Esperando callback en http://localhost:8888/callback ...\n');

// Intenta abrir el navegador automáticamente (falla silencioso en algunos SO)
exec(`start "" "${authUrl}"`, () => {});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:8888');
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.end(`Error Spotify: ${error}`);
    console.error('Spotify error:', error);
    process.exit(1);
  }
  if (!code) {
    res.end('Falta ?code en la URL');
    return;
  }

  console.log('Código recibido, intercambiando por tokens...');

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error('Fallo al obtener tokens:', data);
    res.end(`Error: ${JSON.stringify(data)}`);
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('¡Listo! Copia esto a tu .env.local y a Vercel:');
  console.log('========================================\n');
  console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`);
  console.log(`\n(access_token de prueba, expira en 1h): ${data.access_token}\n`);
  console.log('También necesitas SPOTIFY_PLAYLIST_ID (lo que va después de /playlist/ en la URL de Spotify)\n');

  res.end(
    '<h2>¡Listo!</h2><p>Revisa tu terminal. Ya podés cerrar esta pestaña.</p><p>REFRESH_TOKEN copiado en consola.</p>',
  );
  setTimeout(() => process.exit(0), 500);
});

server.listen(8888, () => console.log('Servidor escuchando...'));
