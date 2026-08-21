/**
 * ============================================================
 * SPOTIFY — HELPERS PARA SINCRONIZAR PLAYLIST (FASE 16)
 * ============================================================
 *
 * ¿Qué hace?
 *   Autentica con Spotify usando el Refresh Token (dura para
 *   siempre) y trae todas las canciones de una playlist,
 *   paginando de 100 en 100.
 *
 * ¿Cómo funciona?
 *   1. getAccessToken() intercambia el REFRESH_TOKEN por un
 *      access_token de corta duración (1h) contra
 *      accounts.spotify.com/api/token.
 *   2. getPlaylistTracks() recorre la playlist con el token.
 *
 * ¿Dónde se usa?
 *   - src/app/api/spotify-sync/route.ts (cron)
 *   - scripts/get-spotify-token.mjs (solo para obtener el
 *     refresh_token la primera vez)
 */

export type SpotifyTrack = {
  spotify_id: string;
  title: string;
  artist: string;
  album: string | null;
  cover_url: string | null;
  preview_url: string | null;
  external_url: string;
  embed_url: string;
  duration_ms: number | null;
  added_at_spotify: string | null;
};

/** Intercambia REFRESH_TOKEN -> access_token (1h) — para playlists privadas/colaborativas. */
export async function getAccessToken(): Promise<string> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!id || !secret || !refresh) {
    throw new Error(
      'Faltan SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN en .env.local (y en Vercel > Environment Variables)',
    );
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/** Token de App (Client Credentials) — para playlists públicas, no necesita Premium ni usuario. */
export async function getClientCredentialsToken(): Promise<string> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!id || !secret) {
    throw new Error(
      'Faltan SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET en .env.local (y en Vercel > Environment Variables)',
    );
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify client_credentials failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/** Trae TODAS las canciones de una playlist, paginando automáticamente. */
export async function getPlaylistTracks(
  playlistId: string,
  accessToken: string,
): Promise<SpotifyTrack[]> {
  // Nota: /tracks está deprecado, usar /items
  let url: string | null =
    `https://api.spotify.com/v1/playlists/${playlistId}/items` + `?limit=100&offset=0`;

  const tracks: SpotifyTrack[] = [];

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Spotify playlist failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as {
      next: string | null;
      items: Array<{
        added_at: string | null;
        track: {
          id: string | null;
          name: string;
          artists: Array<{ name: string }>;
          album: { name: string | null; images: Array<{ url: string }> } | null;
          external_urls: { spotify: string };
          duration_ms: number | null;
          preview_url: string | null;
        } | null;
      }>;
    };

    for (const item of data.items) {
      // Compat: /items usa `item`, /tracks usa `track`
      const t: any = (item as any).track || (item as any).item;
      if (!t?.id) continue; // track eliminado, local o episodio
      tracks.push({
        spotify_id: t.id,
        title: t.name,
        artist: (t.artists as Array<{ name: string }>).map((a) => a.name).join(', '),
        album: t.album?.name ?? null,
        cover_url: t.album?.images?.[0]?.url ?? null,
        preview_url: t.preview_url,
        external_url: t.external_urls.spotify,
        embed_url: `https://open.spotify.com/embed/track/${t.id}`,
        duration_ms: t.duration_ms,
        added_at_spotify: item.added_at,
      });
    }

    url = data.next;
  }

  return tracks;
}
