/** Sección Música: banda sonora con reproductor global y subida desde la página. */
"use client";

import { motion, type Variants } from "motion/react";
import {
  Check,
  Cloud,
  Download,
  ExternalLink,
  HardDrive,
  Music,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useSongPlayer } from "@/components/musica/SongPlayerContext";
import { data } from "@/lib/data";
import type { Song, SpotifySyncTrack } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

import { SongComposer } from "./SongComposer";

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/** Barras de ecualizador animadas (se ven mientras suena la canción). */
function EqualizerBars() {
  return (
    <span className="flex size-5 items-end justify-center gap-[3px]" aria-hidden>
      {[0, 1, 2, 3].map((bar) => (
        <motion.span
          key={bar}
          className="w-[3px] rounded-full bg-blush-glow"
          animate={{ scaleY: [0.3, 1, 0.5, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: bar * 0.15,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "bottom" }}
        />
      ))}
    </span>
  );
}

interface SongRowProps {
  song: Song;
  index: number;
  isPlaying: boolean;
  editMode: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SongRow({
  song,
  index,
  isPlaying,
  editMode,
  onToggle,
  onEdit,
  onDelete,
}: SongRowProps) {
  return (
    <motion.li variants={itemVariants}>
      <div
        className={cn(
          "group relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-colors",
          isPlaying
            ? "border-blush-glow/50 bg-night-800/80"
            : "border-white/10 bg-night-900/60",
          editMode ? "cursor-default border-gold-glow/30" : "hover:border-blush-glow/30",
        )}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggle}
            disabled={editMode}
            aria-label={isPlaying ? `Pausar ${song.title}` : `Reproducir ${song.title}`}
            className="flex min-w-0 flex-1 items-center gap-4 text-left disabled:cursor-default"
          >
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full border text-xl transition-colors",
                isPlaying
                  ? "border-blush-glow/50 bg-night-800 text-blush-glow"
                  : "border-white/10 bg-night-800 group-hover:border-blush-glow/40",
              )}
            >
              {isPlaying ? <EqualizerBars /> : song.emoji ?? "🎵"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <span className="text-xs text-starlight/40">#{index + 1}</span>
                {song.title}
                {isPlaying && (
                  <span className="rounded-full bg-blush-glow/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-blush-glow">
                    Sonando
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-starlight/70">
                {song.artist} · para {song.author}
              </p>
            </div>
            {!editMode && (
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isPlaying
                    ? "border-blush-glow/50 text-blush-glow"
                    : "border-white/10 text-starlight/60 group-hover:border-blush-glow/40 group-hover:text-blush-glow",
                )}
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4 translate-x-[1px]" />
                )}
              </span>
            )}
          </button>

          {editMode && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Editar ${song.title}`}
                title="Editar"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-gold-glow/30 text-gold-glow transition-colors hover:bg-gold-glow/10"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Borrar ${song.title}`}
                title="Borrar"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-red-400/30 text-red-400 transition-colors hover:bg-red-400/10"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        </div>
        {song.reason && (
          <p className="text-xs italic leading-relaxed text-purple-200/80">
            “{song.reason}”
          </p>
        )}
      </div>
    </motion.li>
  );
}

export function MusicaIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-blush-200">
        <Music className="size-3.5 text-blush-glow" />
        Música
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
       Nuestras{" "}
        <span className="text-gradient">Playlists</span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Pulsa una canción para escucharla, o enciende la playlist con el
        botón de música de arriba y llévala a cualquier página.
      </p>
    </section>
  );
}

export function SongsList() {
  const { current, isPlaying, playSong, toggle, stop, syncPlaylist } = useSongPlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifySyncTrack[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Carga de canciones: de la más antigua a la más reciente.
  useEffect(() => {
    let active = true;
    data
      .getSongs()
      .then((items) => {
        if (!active) return;
        const sorted = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        setSongs(sorted);
      })
      .catch(() => {
        if (active) setSongs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadSpotify = useCallback(async () => {
    try {
      const items = await data.getSpotifyTracks();
      setSpotifyTracks(items);
    } catch {
      setSpotifyTracks([]);
    }
  }, []);

  useEffect(() => {
    void loadSpotify();
  }, [loadSpotify]);

  const handlePlaySpotify = useCallback(
    (track: SpotifySyncTrack) => {
      if (!track.preview_url) {
        showToast('Sin preview', 'Esta canción no tiene preview de 30s, abriendo en Spotify');
        window.open(track.external_url, '_blank');
        return;
      }
      const song: Song = {
        id: `spotify-${track.spotify_id}`,
        title: track.title,
        artist: track.artist,
        reason: track.album ? `Álbum: ${track.album}` : '',
        author: 'Spotify',
        audioUrl: track.preview_url,
        emoji: '🎵',
        createdAt: track.created_at,
      };
      playSong(song);
    },
    [playSong],
  );

  const handleSaveToApp = useCallback(
    async (track: SpotifySyncTrack) => {
      if (savingId) return;
      setSavingId(track.spotify_id);
      try {
        const res = await fetch('/api/spotify-to-song', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spotifyId: track.spotify_id }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al guardar');
        showToast('Guardada en la app', `"${track.title}" ya está en tu banda sonora completa`);
        // Recarga la lista de canciones normales
        const items = await data.getSongs();
        setSongs([...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      } catch (e) {
        showToast('No se pudo guardar', e instanceof Error ? e.message : 'Inténtalo de nuevo');
      } finally {
        setSavingId(null);
      }
    },
    [savingId],
  );

  const handleToggle = useCallback(
    (song: Song) => {
      if (current?.id === song.id) {
        toggle();
        return;
      }
      playSong(song);
    },
    [current, playSong, toggle],
  );

  const handleCreated = useCallback((song: Song) => {
    setComposing(false);
    setEditingSong(null);
    setSongs((previous) => {
      const exists = previous.some((item) => item.id === song.id);
      return exists
        ? previous.map((item) => (item.id === song.id ? song : item))
        : [...previous, song];
    });
  }, []);

  // Mantiene la playlist del reproductor global al día con esta lista.
  useEffect(() => {
    if (songs.length === 0) return;
    syncPlaylist(songs);
  }, [songs, syncPlaylist]);

  const handleDelete = useCallback(
    async (target: Song) => {
      try {
        await data.deleteSong(target.id);
        // Si la canción borrada estaba sonando, se apaga.
        if (current?.id === target.id) {
          stop();
        }
        setSongs((previous) => previous.filter((item) => item.id !== target.id));
        playChime(true);
        showToast("Canción borrada", `"${target.title}" salió de la banda sonora.`);
        setDeletingSong(null);
      } catch {
        showToast("No se pudo borrar", "Inténtalo de nuevo en un momento.");
        setDeletingSong(null);
      }
    },
    [current, stop],
  );

  return (
    <section
      data-songs-list
      aria-label="Canciones"
      className="relative mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6"
    >
      {/* Barra superior: insignia de nube + editar + subir canción */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs",
            data.name === "supabase"
              ? "border-green-glow/25 bg-white/[0.03] text-green-glow/90"
              : "border-white/10 bg-white/[0.03] text-starlight/70",
          )}
        >
          {data.name === "supabase" ? (
            <>
              <Cloud className="size-3.5" />
              Nube conectada
            </>
          ) : (
            <>
              <HardDrive className="size-3.5" />
              Este dispositivo
            </>
          )}
        </span>

        <button
          type="button"
          onClick={() => setEditMode((value) => !value)}
          aria-pressed={editMode}
          className={cn(
            "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97]",
            editMode
              ? "border-gold-glow/50 bg-gold-glow/10 text-gold-glow"
              : "glass text-starlight/85 hover:border-white/25 hover:text-primary",
          )}
        >
          {editMode ? <Check className="size-4" /> : <Pencil className="size-4" />}
          {editMode ? "Hecho" : "Editar"}
        </button>

        <button
          type="button"
          onClick={() => setComposing(true)}
          className={cn(
            "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium",
            "bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow text-primary",
            "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
          )}
        >
          <Plus className="size-4" />
          Subir canción
        </button>

        <button
          type="button"
          onClick={async () => {
            if (syncing) return;
            setSyncing(true);
            try {
              const res = await fetch('/api/spotify-sync');
              const json = await res.json();
              if (!res.ok) throw new Error(json.error || 'Error al sincronizar');
              if (json.inserted > 0) {
                showToast('Spotify sincronizado', `${json.inserted} canciones nuevas guardadas`);
              } else {
                showToast('Spotify al día', json.message || 'No hay canciones nuevas');
              }
              void loadSpotify();
            } catch (e) {
              showToast('No se pudo sincronizar', e instanceof Error ? e.message : 'Inténtalo de nuevo');
            } finally {
              setSyncing(false);
            }
          }}
          disabled={syncing}
          title="Sincroniza tu playlist de Spotify al instante (sin esperar al cron diario)"
          className={cn(
            'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97]',
            'border-green-glow/30 bg-green-glow/10 text-green-glow hover:bg-green-glow/15 disabled:opacity-50',
          )}
        >
          <RefreshCw className={cn('size-4', syncing && 'animate-spin')} />
          {syncing ? 'Sincronizando…' : 'Sincronizar Spotify'}
        </button>
      </div>

      {/* Aviso del modo edición */}
      {editMode && (
        <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-gold-glow/25 bg-gold-glow/5 px-5 py-3 text-center text-xs leading-relaxed text-gold-glow">
          Modo edición: usa <Pencil className="inline size-3.5" /> para corregir
          (título, frase, cantante, autor, emoji o audio) y{" "}
          <Trash2 className="inline size-3.5" /> para borrar. La música se
          detiene mientras editas.
        </div>
      )}

      {/* Lista de canciones */}
      {loading ? (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          Afinando los instrumentos…
        </p>
      ) : songs.length > 0 ? (
        <motion.ul
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col gap-4"
        >
          {songs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              isPlaying={current?.id === song.id && isPlaying}
              editMode={editMode}
              onToggle={() => handleToggle(song)}
              onEdit={() => {
                setEditingSong(song);
                setEditMode(false);
              }}
              onDelete={() => setDeletingSong(song)}
            />
          ))}
        </motion.ul>
      ) : (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          Todavía no hay canciones en la banda sonora.
        </p>
      )}

      {/* Playlist de Spotify sincronizada */}
      {spotifyTracks.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-primary">
            <span className="inline-flex size-2 rounded-full bg-green-400" />
            De Spotify
            <span className="text-xs font-normal text-starlight/60">({spotifyTracks.length})</span>
          </h2>
          <motion.ul
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-col gap-4"
          >
            {spotifyTracks.map((track, index) => {
              const isThisPlaying = current?.id === `spotify-${track.spotify_id}` && isPlaying;
              return (
                <motion.li key={track.spotify_id} variants={itemVariants}>
                  <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-night-900/60 p-4 transition-colors hover:border-green-400/30">
                    <button
                      type="button"
                      onClick={() => handlePlaySpotify(track)}
                      className="flex min-w-0 flex-1 items-center gap-4 text-left"
                    >
                      {track.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={track.cover_url}
                          alt={track.title}
                          className="size-14 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-night-800 text-xl">
                          🎵
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 truncate text-sm font-semibold text-primary">
                          <span className="text-xs text-starlight/40">#{index + 1}</span>
                          {track.title}
                          {isThisPlaying && (
                            <span className="rounded-full bg-green-400/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-green-400">
                              Sonando
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-starlight/70">
                          {track.artist}
                          {track.album ? ` · ${track.album}` : ''}
                        </p>
                      </div>
                      <span
                        className={
                          isThisPlaying
                            ? 'flex size-9 shrink-0 items-center justify-center rounded-full border border-green-400/50 bg-night-800 text-green-400'
                            : 'flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-starlight/60 transition-colors group-hover:border-green-400/40 group-hover:text-green-400'
                        }
                      >
                        {isThisPlaying ? <Pause className="size-4" /> : <Play className="size-4 translate-x-[1px]" />}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveToApp(track)}
                      disabled={savingId === track.spotify_id}
                      title="Guardar en la app (descarga completa)"
                      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-starlight/60 transition-colors hover:border-blush-glow/40 hover:text-blush-glow disabled:opacity-50"
                    >
                      <Download className={savingId === track.spotify_id ? 'size-3.5 animate-pulse' : 'size-3.5'} />
                    </button>
                    <a
                      href={track.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir en Spotify"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-starlight/40 transition-colors hover:text-green-400"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      )}

      {/* Compositor / editor */}
      {composing && (
        <SongComposer onClose={() => setComposing(false)} onCreated={handleCreated} />
      )}
      {editingSong && (
        <SongComposer
          song={editingSong}
          onClose={() => setEditingSong(null)}
          onCreated={handleCreated}
        />
      )}

      {/* Confirmación de borrado */}
      {deletingSong && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Borrar canción"
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-night-950/95 p-4"
          onClick={() => setDeletingSong(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-night-900/95 p-8 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="text-3xl">🗑️</span>
            <h3 className="mt-3 font-display text-xl font-semibold text-primary">
              ¿Borrar “{deletingSong.title}”?
            </h3>
            <p className="mt-2 text-sm text-starlight/75">
              Saldrá de la banda sonora y su audio se eliminará de la nube.
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingSong(null)}
                className="glass inline-flex h-10 cursor-pointer items-center justify-center rounded-full px-6 text-sm font-medium text-starlight transition-all duration-300 hover:border-white/25 hover:text-primary active:scale-[0.97]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(deletingSong)}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400/40 px-6 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-400/10 active:scale-[0.97]"
              >
                <Trash2 className="size-4" />
                Borrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}