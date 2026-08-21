/**
 * ============================================================
 * ROUTE HANDLER: /api/spotify-sync — SINCRONIZA PLAYLIST
 * ============================================================
 *
 * ¿Qué hace?
 *   Cada vez que se llama, trae la playlist de Spotify y guarda
 *   en Supabase solo las canciones nuevas (evita duplicados por
 *   spotify_id).
 *
 * ¿Cómo se dispara?
 *   - Automático: Vercel Cron (ver vercel.json -> crons)
 *   - Manual: GET https://tu-dominio.vercel.app/api/spotify-sync
 *             con header Authorization: Bearer <CRON_SECRET>
 *             o local: http://localhost:3000/api/spotify-sync
 *
 * Seguridad:
 *   Si configurás CRON_SECRET, las llamadas sin el header son
 *   rechazadas. Vercel Cron puede enviarlo si configurás el cron
 *   como protegido (o lo validamos opcionalmente).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAccessToken, getClientCredentialsToken, getPlaylistTracks } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

/** Verifica el secret del cron (opcional). */
function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // sin secret = abierto (útil en desarrollo)
  const auth = req.headers.get('authorization');
  // Acepta "Bearer <secret>" o header de Vercel "x-vercel-cron"
  if (auth === `Bearer ${secret}`) return true;
  // Vercel Cron manda este header en producción si usás vercel.json crons
  if (req.headers.get('x-vercel-cron') === '1') return true;
  return false;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
  if (!playlistId) {
    return NextResponse.json(
      { error: 'Falta SPOTIFY_PLAYLIST_ID en .env.local y en Vercel' },
      { status: 500 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Preferimos service_role para bypass RLS, pero si no existe usamos anon (tu proyecto usa políticas abiertas)
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY o ANON_KEY' },
      { status: 500 },
    );
  }

  try {
    // 1. Auth Spotify — prioriza usuario (REFRESH_TOKEN) porque tu playlist
    //    colaborativa/pública requiere "Valid user authentication".
    //    Si no hay refresh_token, cae a Client Credentials.
    let accessToken: string;
    let spotifyTracks: Awaited<ReturnType<typeof getPlaylistTracks>>;
    const hasRefresh = !!process.env.SPOTIFY_REFRESH_TOKEN;

    const tryUserToken = async () => {
      const tok = await getAccessToken();
      return getPlaylistTracks(playlistId, tok);
    };
    const tryClientToken = async () => {
      const tok = await getClientCredentialsToken();
      return getPlaylistTracks(playlistId, tok);
    };

    if (hasRefresh) {
      try {
        spotifyTracks = await tryUserToken();
      } catch (e) {
        console.warn('[spotify-sync] user token fallo, probando client_credentials:', e);
        spotifyTracks = await tryClientToken();
      }
    } else {
      try {
        spotifyTracks = await tryClientToken();
      } catch (e) {
        console.warn('[spotify-sync] client_credentials fallo, probando refresh_token:', e);
        spotifyTracks = await tryUserToken();
      }
    }

    if (spotifyTracks.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0, total: 0, message: 'Playlist vacía' });
    }

    // 3. Comparar con lo que ya existe
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existing, error: selErr } = await supabase
      .from('spotify_tracks')
      .select('spotify_id');

    if (selErr) throw new Error(`Supabase select failed: ${selErr.message}`);

    const existingIds = new Set((existing ?? []).map((r: { spotify_id: string }) => r.spotify_id));
    const newTracks = spotifyTracks.filter((t) => !existingIds.has(t.spotify_id));

    if (newTracks.length === 0) {
      return NextResponse.json({
        ok: true,
        inserted: 0,
        total: spotifyTracks.length,
        message: 'Sin canciones nuevas',
      });
    }

    // 4. Insertar solo nuevas
    const { error: insErr } = await supabase.from('spotify_tracks').insert(newTracks);
    if (insErr) throw new Error(`Supabase insert failed: ${insErr.message}`);

    console.log(`[spotify-sync] Insertadas ${newTracks.length}/${spotifyTracks.length}`);
    return NextResponse.json({
      ok: true,
      inserted: newTracks.length,
      total: spotifyTracks.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[spotify-sync] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
