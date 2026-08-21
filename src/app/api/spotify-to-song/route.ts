/**
 * POST /api/spotify-to-song — Convierte una canción de Spotify en una Canción de la app.
 * Body: { spotifyId: string }
 * Flujo: Spotify track -> busca en YouTube (Piped) -> descarga audio -> sube a Supabase Storage -> crea fila en `songs`.
 * Requiere Premium en la cuenta de Spotify para leer la playlist, pero no para descargar de YouTube.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAccessToken } from '@/lib/spotify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel: permite hasta 60s para descargar/subir

type SpotifyTrackDetail = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  duration_ms: number;
  external_urls: { spotify: string };
};

async function searchYoutubeVideoId(query: string): Promise<string | null> {
  // Piped API (instancia pública) — sin key, busca en YouTube
  const searchUrl = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=music_songs`;
  const res = await fetch(searchUrl, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: Array<{ url?: string }> };
  const first = data.items?.[0]?.url;
  if (!first) return null;
  // url es "/watch?v=VIDEO_ID"
  const m = first.match(/v=([^&]+)/);
  return m ? m[1] : null;
}

async function getPipedAudioUrl(videoId: string): Promise<string | null> {
  const res = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = (await res.json()) as { audioStreams?: Array<{ url: string; mimeType?: string }> };
  // Prefer opus/webm, si no mp4
  const audio = data.audioStreams?.[0];
  return audio?.url ?? null;
}

export async function POST(req: Request) {
  try {
    const { spotifyId } = (await req.json()) as { spotifyId?: string };
    if (!spotifyId) return NextResponse.json({ error: 'Falta spotifyId' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Traer detalle de Spotify
    const accessToken = await getAccessToken();
    const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!trackRes.ok) {
      const t = await trackRes.text();
      return NextResponse.json({ error: `Spotify track failed: ${t}` }, { status: 500 });
    }
    const track = (await trackRes.json()) as SpotifyTrackDetail;
    const artist = track.artists.map((a) => a.name).join(', ');
    const title = track.name;

    // 3. Buscar en YouTube y obtener stream de audio
    const query = `${artist} - ${title} official audio`;
    const videoId = await searchYoutubeVideoId(query);
    if (!videoId) return NextResponse.json({ error: 'No se encontró en YouTube' }, { status: 404 });

    const audioUrl = await getPipedAudioUrl(videoId);
    if (!audioUrl) return NextResponse.json({ error: 'No se pudo obtener el audio' }, { status: 500 });

    // 4. Descargar audio (Piped da URL directa, la descargamos)
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) return NextResponse.json({ error: 'Fallo al descargar audio' }, { status: 500 });
    const audioBlob = await audioRes.blob();

    // 5. Subir a Supabase Storage (bucket `songs`)
    const ext = audioBlob.type.includes('webm') ? 'webm' : 'mp3';
    const path = `spotify/${spotifyId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('songs')
      .upload(path, audioBlob, { contentType: audioBlob.type || 'audio/mpeg', upsert: false });
    if (upErr) return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });

    const {
      data: { publicUrl },
    } = supabase.storage.from('songs').getPublicUrl(path);

    // 6. Crear fila en `songs` (como lo hace SongComposer)
    // Nota: songs no tiene spotify_id, lo guardamos en reason para trazabilidad
    const { data: song, error: insErr } = await supabase
      .from('songs')
      .insert({
        title,
        artist,
        reason: `De Spotify · ${track.album.name}`,
        author: 'Spotify',
        audio_url: publicUrl,
        emoji: '🎵',
      })
      .select()
      .single();

    if (insErr) return NextResponse.json({ error: `Insert failed: ${insErr.message}` }, { status: 500 });

    return NextResponse.json({ ok: true, song });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[spotify-to-song]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
