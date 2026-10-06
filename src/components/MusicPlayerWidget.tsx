import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  RefreshCw,
  ExternalLink,
  LogOut,
  Check,
  Copy,
  Link2,
  ListMusic,
  Disc,
  Radio,
  Settings,
} from 'lucide-react';

export interface CuratedSpotifyItem {
  id: string;
  spotifyType: 'playlist' | 'track' | 'album';
  spotifyId: string;
  uri: string;
  title: string;
  subtitle: string;
  coverSrc: string;
}

// Official Spotify Playlists & Tracks with verified Spotify CDN Cover Art
const CURATED_SPOTIFY_ITEMS: CuratedSpotifyItem[] = [
  {
    id: 'lofi-beats',
    spotifyType: 'playlist',
    spotifyId: '37i9dQZF1DWWQRwui0ExPn',
    uri: 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn',
    title: 'lofi beats · Спокій та фокус',
    subtitle: 'Spotify Official Playlist',
    coverSrc: 'https://i.scdn.co/image/ab67706f00000002266beb50b0032b0f140a749e',
  },
  {
    id: 'peaceful-piano',
    spotifyType: 'playlist',
    spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
    uri: 'spotify:playlist:37i9dQZF1DX4sWSpwq3LiO',
    title: 'Peaceful Piano · Тихе фортепіано',
    subtitle: 'Spotify Official Playlist',
    coverSrc: 'https://i.scdn.co/image/ab67706f0000000270e1fb7db7b45809d6a80377',
  },
  {
    id: 'deep-focus',
    spotifyType: 'playlist',
    spotifyId: '37i9dQZF1DWZeKCadgRdKQ',
    uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ',
    title: 'Deep Focus · Глибока концентрація',
    subtitle: 'Spotify Official Playlist',
    coverSrc: 'https://i.scdn.co/image/ab67706f000000026020f2f6476db518ef747da4',
  },
  {
    id: 'nature-sounds',
    spotifyType: 'playlist',
    spotifyId: '37i9dQZF1DX4PP3DA4J0N8',
    uri: 'spotify:playlist:37i9dQZF1DX4PP3DA4J0N8',
    title: 'Nature Sounds · Звуки дикої природи',
    subtitle: 'Spotify Official Playlist',
    coverSrc: 'https://i.scdn.co/image/ab67706f00000002e909a20522cfdb017c798ba8',
  },
  {
    id: 'blinding-lights',
    spotifyType: 'track',
    spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',
    uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b',
    title: 'Blinding Lights',
    subtitle: 'The Weeknd · After Hours',
    coverSrc:
      'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e028863bc11d2aa12b54f5aeb36',
  },
  {
    id: 'chill-tracks',
    spotifyType: 'playlist',
    spotifyId: '37i9dQZF1DX6VdMW310YC7',
    uri: 'spotify:playlist:37i9dQZF1DX6VdMW310YC7',
    title: 'Chill Tracks · Вечірній чіл',
    subtitle: 'Spotify Official Playlist',
    coverSrc: 'https://i.scdn.co/image/ab67706f00000002266beb50b0032b0f140a749e',
  },
];

interface SpotifyTrackInfo {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  durationMs: number;
  externalUrl: string;
}

interface SpotifyPlaylistInfo {
  id: string;
  uri: string;
  name: string;
  coverUrl: string;
  tracksTotal: number;
  externalUrl: string;
}

interface SpotifyStatusResponse {
  configured: boolean;
  connected: boolean;
  authMode?: 'oauth' | 'client_credentials';
  redirectUri?: string;
  profile?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    product: string;
    profileUrl: string;
  } | null;
  player?: {
    isPlaying: boolean;
    progressMs: number;
    shuffleState: boolean;
    repeatState: string;
    volumePercent: number;
    deviceName: string;
    track: SpotifyTrackInfo | null;
  } | null;
  recentTracks?: SpotifyTrackInfo[];
  playlists?: SpotifyPlaylistInfo[];
  error?: string;
}

interface MusicPlayerWidgetProps {
  onPlaybackChange?: (isPlaying: boolean, trackTitle: string) => void;
}

function parseSpotifyInput(
  input: string
): { type: 'track' | 'playlist' | 'album'; id: string; uri: string; webUrl: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const uriMatch = trimmed.match(/spotify:(track|playlist|album):([a-zA-Z0-9]+)/i);
  if (uriMatch) {
    const type = uriMatch[1].toLowerCase() as 'track' | 'playlist' | 'album';
    const id = uriMatch[2];
    return {
      type,
      id,
      uri: `spotify:${type}:${id}`,
      webUrl: `https://open.spotify.com/${type}/${id}`,
    };
  }

  const urlMatch = trimmed.match(
    /open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|playlist|album)\/([a-zA-Z0-9]+)/i
  );
  if (urlMatch) {
    const type = urlMatch[1].toLowerCase() as 'track' | 'playlist' | 'album';
    const id = urlMatch[2];
    return {
      type,
      id,
      uri: `spotify:${type}:${id}`,
      webUrl: `https://open.spotify.com/${type}/${id}`,
    };
  }

  return null;
}

export const MusicPlayerWidget: React.FC<MusicPlayerWidgetProps> = ({ onPlaybackChange }) => {
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showOAuthSettings, setShowOAuthSettings] = useState<boolean>(false);
  const [copiedCallback, setCopiedCallback] = useState<boolean>(false);

  const defaultCallbackUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'https://ais-dev-3ci67dujs77lmx6ts2ftap-668383909936.europe-west2.run.app/auth/callback';

  const [customRedirectUri, setCustomRedirectUri] = useState<string>(defaultCallbackUrl);

  // Selected Spotify item
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [customEmbed, setCustomEmbed] = useState<{
    type: 'track' | 'playlist' | 'album';
    id: string;
    uri: string;
    title: string;
    subtitle: string;
    coverSrc: string;
  } | null>(null);

  const [spotifyUrlInput, setSpotifyUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  // Live playback state from Spotify IFrame API, direct audio stream, or Spotify Connect
  const [isEmbedPlaying, setIsEmbedPlaying] = useState<boolean>(false);
  const [isDirectAudioPlaying, setIsDirectAudioPlaying] = useState<boolean>(false);
  const [positionMs, setPositionMs] = useState<number>(0);
  const [durationMs, setDurationMs] = useState<number>(0);

  // Volume state (0 - 100%) with Mute toggle, persisted in localStorage
  const [volumePercent, setVolumePercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('naturedesk_spotify_volume_v1');
      if (saved !== null) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) return Math.min(100, Math.max(0, parsed));
      }
    } catch {}
    return 75;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const embedHostRef = useRef<HTMLDivElement | null>(null);
  const embedControllerRef = useRef<any>(null);
  const directAudioRef = useRef<HTMLAudioElement | null>(null);
  const volumeDebounceRef = useRef<number | null>(null);
  const onPlaybackChangeRef = useRef(onPlaybackChange);
  onPlaybackChangeRef.current = onPlaybackChange;

  const effectiveVolume = isMuted ? 0 : volumePercent;

  const currentCurated = CURATED_SPOTIFY_ITEMS[activeIndex] || CURATED_SPOTIFY_ITEMS[0];
  const activeEmbed = customEmbed || {
    type: currentCurated.spotifyType,
    id: currentCurated.spotifyId,
    uri: currentCurated.uri,
    title: currentCurated.title,
    subtitle: currentCurated.subtitle,
    coverSrc: currentCurated.coverSrc,
  };

  const formatMs = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const fetchSpotifyStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/spotify/status?redirect_uri=${encodeURIComponent(customRedirectUri)}`,
        { credentials: 'include' }
      );
      if (!res.ok) return;
      const data = (await res.json()) as SpotifyStatusResponse;
      setSpotifyStatus(data);
      if (data.player?.progressMs !== undefined) {
        setPositionMs(data.player.progressMs);
      }
      if (data.player?.track?.durationMs) {
        setDurationMs(data.player.track.durationMs);
      }
      if (typeof data.player?.volumePercent === 'number') {
        setVolumePercent(data.player.volumePercent);
      }
    } catch {
      // Ignore transient network errors
    } finally {
      setLoadingStatus(false);
    }
  }, [customRedirectUri]);

  useEffect(() => {
    fetchSpotifyStatus();
  }, [fetchSpotifyStatus]);

  // Initialize Official Spotify IFrame API Controller so our custom Play/Pause/Next buttons control real Spotify playback
  useEffect(() => {
    let isMounted = true;

    const initController = (IFrameAPI: any) => {
      if (!isMounted || !embedHostRef.current || embedControllerRef.current) return;
      const options = {
        uri: activeEmbed.uri,
        width: '100%',
        height: 152,
      };
      IFrameAPI.createController(embedHostRef.current, options, (EmbedController: any) => {
        if (!isMounted) return;
        embedControllerRef.current = EmbedController;
        EmbedController.addListener('playback_update', (e: any) => {
          if (!isMounted || !e?.data) return;
          const playing = !e.data.isPaused;
          setIsEmbedPlaying(playing);
          if (playing && directAudioRef.current && !directAudioRef.current.paused) {
            directAudioRef.current.pause();
            setIsDirectAudioPlaying(false);
          }
          if (typeof e.data.position === 'number') {
            setPositionMs(e.data.position);
          }
          if (typeof e.data.duration === 'number' && e.data.duration > 0) {
            setDurationMs(e.data.duration);
          }
        });
      });
    };

    if ((window as any).SpotifyIframeApi) {
      initController((window as any).SpotifyIframeApi);
    } else {
      const prevCallback = (window as any).onSpotifyIframeApiReady;
      (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
        (window as any).SpotifyIframeApi = IFrameAPI;
        if (prevCallback) prevCallback(IFrameAPI);
        initController(IFrameAPI);
      };

      if (!document.getElementById('spotify-iframe-api-script')) {
        const script = document.createElement('script');
        script.id = 'spotify-iframe-api-script';
        script.src = 'https://open.spotify.com/embed/iframe-api/v1';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Load new URI into Spotify IFrame Controller & prepare volume-controllable audio stream whenever activeEmbed changes
  useEffect(() => {
    if (embedControllerRef.current && typeof embedControllerRef.current.loadUri === 'function') {
      try {
        embedControllerRef.current.loadUri(activeEmbed.uri);
      } catch {}
    }

    let cancelled = false;
    const loadAudioStream = async () => {
      try {
        const searchQuery = activeEmbed.title.split('·')[0].trim();
        const res = await fetch(`/api/spotify/audio-stream?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled || !data.previewUrl) return;
        if (!directAudioRef.current) {
          directAudioRef.current = new Audio();
          directAudioRef.current.loop = true;
          directAudioRef.current.addEventListener('timeupdate', () => {
            if (directAudioRef.current && !directAudioRef.current.paused) {
              setPositionMs(directAudioRef.current.currentTime * 1000);
              setDurationMs((directAudioRef.current.duration || 30) * 1000);
            }
          });
        }
        const wasPlaying = isDirectAudioPlaying;
        directAudioRef.current.src = data.previewUrl;
        directAudioRef.current.volume = effectiveVolume / 100;
        if (wasPlaying) {
          directAudioRef.current.play().catch(() => {});
        }
      } catch {}
    };
    loadAudioStream();

    return () => {
      cancelled = true;
    };
  }, [activeEmbed.uri, activeEmbed.title]);

  // Apply volume changes in real time to direct audio stream, embedded iframe, and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('naturedesk_spotify_volume_v1', String(volumePercent));
    } catch {}

    if (directAudioRef.current) {
      directAudioRef.current.volume = effectiveVolume / 100;
    }

    // Also post volume message to embedded Spotify iframe if supported
    const iframeEl = embedHostRef.current?.querySelector('iframe');
    if (iframeEl?.contentWindow) {
      try {
        iframeEl.contentWindow.postMessage(
          { command: 'volume', volume: effectiveVolume / 100 },
          '*'
        );
      } catch {}
    }
  }, [volumePercent, effectiveVolume]);

  useEffect(() => {
    return () => {
      if (directAudioRef.current) {
        directAudioRef.current.pause();
      }
      if (volumeDebounceRef.current) {
        window.clearTimeout(volumeDebounceRef.current);
      }
    };
  }, []);

  // Listen for optional OAuth popup completion via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin || '';
      if (
        origin &&
        !origin.endsWith('.run.app') &&
        !origin.includes('localhost') &&
        origin !== window.location.origin
      ) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setStatusMessage('Акаунт Spotify успішно авторизовано!');
        setShowOAuthSettings(false);
        fetchSpotifyStatus();
        window.setTimeout(() => setStatusMessage(null), 4000);
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setStatusMessage(`Помилка OAuth: ${event.data?.error || ''}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchSpotifyStatus]);

  // Report current track title & playing state to parent DraggableWidget summary
  const displayedTrack: SpotifyTrackInfo | null =
    spotifyStatus?.player?.track || spotifyStatus?.recentTracks?.[0] || null;
  const isPlaying =
    Boolean(spotifyStatus?.player?.isPlaying) || isEmbedPlaying || isDirectAudioPlaying;
  const summaryTitle = displayedTrack
    ? `${displayedTrack.title} — ${displayedTrack.artist}`
    : activeEmbed.title;

  useEffect(() => {
    if (onPlaybackChangeRef.current) {
      onPlaybackChangeRef.current(isPlaying, summaryTitle);
    }
  }, [isPlaying, summaryTitle]);

  // Instant Direct Spotify Connection (uses SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET on backend — never fails with redirect_uri error!)
  const handleInstantConnectSpotify = async () => {
    setStatusMessage(null);
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/spotify/connect', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.connected) {
        await fetchSpotifyStatus();
        setStatusMessage('Spotify API успішно підключено!');
        window.setTimeout(() => setStatusMessage(null), 3500);
      } else {
        setShowOAuthSettings(true);
        setStatusMessage(data.error || 'Не вдалося підключити Spotify API.');
      }
    } catch {
      setStatusMessage('Помилка з’єднання з сервером Spotify API.');
    } finally {
      setLoadingStatus(false);
    }
  };

  // Optional Browser OAuth Popup Login (with configurable Redirect URI)
  const handleBrowserOAuthLogin = async () => {
    setStatusMessage(null);
    try {
      const res = await fetch(
        `/api/spotify/auth-url?redirect_uri=${encodeURIComponent(customRedirectUri.trim())}`,
        { credentials: 'include' }
      );
      const data = await res.json();

      if (!data.configured || !data.url) {
        setStatusMessage('Додайте SPOTIFY_CLIENT_ID та SPOTIFY_CLIENT_SECRET у змінні середовища.');
        return;
      }

      const authWindow = window.open(
        data.url,
        'spotify_oauth_popup',
        'width=560,height=720,menubar=no,toolbar=no,location=no,status=no'
      );

      if (!authWindow) {
        setStatusMessage('Дозвольте спливаючі вікна (popups) у браузері.');
      }
    } catch {
      setStatusMessage('Не вдалося відкрити вікно авторизації Spotify.');
    }
  };

  const handleDisconnectSpotify = async () => {
    try {
      await fetch('/api/spotify/disconnect', {
        method: 'POST',
        credentials: 'include',
      });
      setSpotifyStatus((prev) =>
        prev ? { ...prev, connected: false, profile: null, player: null } : null
      );
      setStatusMessage('Сесію Spotify вимкнено');
      window.setTimeout(() => setStatusMessage(null), 3000);
    } catch {}
  };

  // Volume Slider Change Handler (updates local audio immediately + syncs with Spotify Connect API)
  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(newVol)));
    setVolumePercent(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }

    if (directAudioRef.current) {
      directAudioRef.current.volume = clamped / 100;
    }

    if (spotifyStatus?.connected && spotifyStatus.authMode === 'oauth') {
      if (volumeDebounceRef.current) {
        window.clearTimeout(volumeDebounceRef.current);
      }
      volumeDebounceRef.current = window.setTimeout(() => {
        fetch('/api/spotify/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'volume', volumePercent: clamped }),
        }).catch(() => {});
      }, 180);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const targetVol = nextMuted ? 0 : volumePercent;

    if (directAudioRef.current) {
      directAudioRef.current.volume = targetVol / 100;
    }

    if (spotifyStatus?.connected && spotifyStatus.authMode === 'oauth') {
      fetch('/api/spotify/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'volume', volumePercent: targetVol }),
      }).catch(() => {});
    }
  };

  // Play / Pause button handler (controls direct volume-adjustable stream + Spotify IFrame API Controller + Spotify Connect)
  const handleTogglePlayPause = async () => {
    if (isEmbedPlaying && embedControllerRef.current?.togglePlay) {
      try {
        embedControllerRef.current.togglePlay();
      } catch {}
      return;
    }

    if (directAudioRef.current && directAudioRef.current.src) {
      if (isDirectAudioPlaying) {
        directAudioRef.current.pause();
        setIsDirectAudioPlaying(false);
      } else {
        directAudioRef.current.volume = effectiveVolume / 100;
        directAudioRef.current
          .play()
          .then(() => setIsDirectAudioPlaying(true))
          .catch(() => {
            if (embedControllerRef.current?.togglePlay) {
              embedControllerRef.current.togglePlay();
            }
          });
      }
    } else if (
      embedControllerRef.current &&
      typeof embedControllerRef.current.togglePlay === 'function'
    ) {
      try {
        embedControllerRef.current.togglePlay();
      } catch {}
    }

    if (spotifyStatus?.connected && spotifyStatus.authMode === 'oauth') {
      const action = isPlaying ? 'pause' : 'play';
      await fetch('/api/spotify/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      }).catch(() => {});
    }
  };

  // Next / Previous handler
  const handleStepTrack = async (direction: 'next' | 'previous') => {
    setCustomEmbed(null);
    setPositionMs(0);
    setActiveIndex((prev) => {
      const nextIdx =
        direction === 'next'
          ? (prev + 1) % CURATED_SPOTIFY_ITEMS.length
          : (prev - 1 + CURATED_SPOTIFY_ITEMS.length) % CURATED_SPOTIFY_ITEMS.length;
      const nextItem = CURATED_SPOTIFY_ITEMS[nextIdx];
      if (embedControllerRef.current && typeof embedControllerRef.current.loadUri === 'function') {
        try {
          embedControllerRef.current.loadUri(nextItem.uri);
          embedControllerRef.current.play();
        } catch {}
      }
      return nextIdx;
    });

    if (spotifyStatus?.connected && spotifyStatus.authMode === 'oauth') {
      await fetch('/api/spotify/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: direction }),
      }).catch(() => {});
    }
  };

  const handleApplyCustomSpotifyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseSpotifyInput(spotifyUrlInput);
    if (!parsed) {
      setStatusMessage(
        'Вставте коректне посилання Spotify (наприклад, https://open.spotify.com/track/... або /playlist/...)'
      );
      return;
    }

    // Resolve real Spotify title & official cover art via server oEmbed proxy
    let resolvedTitle = `Spotify ${
      parsed.type === 'track' ? 'Трек' : parsed.type === 'album' ? 'Альбом' : 'Плейлист'
    }`;
    let resolvedCover = currentCurated.coverSrc;
    let resolvedSubtitle = 'Spotify Streaming';

    try {
      const res = await fetch(
        `/api/spotify/resolve?url=${encodeURIComponent(parsed.webUrl)}`
      );
      if (res.ok) {
        const meta = await res.json();
        if (meta.title) resolvedTitle = meta.title;
        if (meta.coverUrl) resolvedCover = meta.coverUrl;
        if (meta.subtitle) resolvedSubtitle = meta.subtitle;
      }
    } catch {}

    setCustomEmbed({
      type: parsed.type,
      id: parsed.id,
      uri: parsed.uri,
      title: resolvedTitle,
      subtitle: resolvedSubtitle,
      coverSrc: resolvedCover,
    });
    setSpotifyUrlInput('');
    setShowUrlInput(false);
    setStatusMessage(null);
  };

  const handleCopyCallbackUrl = () => {
    navigator.clipboard?.writeText(customRedirectUri);
    setCopiedCallback(true);
    window.setTimeout(() => setCopiedCallback(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Top Header: Spotify Brand + Connection Status */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#1ED760]/20 border border-[#1ED760]/40 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#1ED760]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white truncate">
                  Spotify Плеєр
                </h3>
                {spotifyStatus?.connected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1ED760]/20 text-[#1ED760] border border-[#1ED760]/40">
                    ● Підключено
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 truncate">
                {spotifyStatus?.connected && spotifyStatus.profile
                  ? `${spotifyStatus.profile.displayName} · Spotify Web Player`
                  : 'Натисніть «Підключити Spotify» для миттєвого з’єднання'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                showUrlInput
                  ? 'bg-[#1ED760]/25 text-[#1ED760] border border-[#1ED760]/40'
                  : 'glass-pill text-stone-300 hover:text-white'
              }`}
              title="Вставити будь-яке посилання на трек або плейлист Spotify"
            >
              <Link2 className="w-3 h-3" />
              <span>Посилання</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOAuthSettings(!showOAuthSettings)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showOAuthSettings
                  ? 'bg-[#1ED760]/25 text-[#1ED760] border border-[#1ED760]/40'
                  : 'glass-pill text-stone-300 hover:text-white'
              }`}
              title="Налаштування OAuth Redirect URI"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {spotifyStatus?.connected ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={fetchSpotifyStatus}
                  className="p-1.5 rounded-lg glass-pill text-stone-300 hover:text-white cursor-pointer"
                  title="Оновити статус Spotify"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectSpotify}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:bg-rose-500/30 transition-colors cursor-pointer"
                  title="Відключити сесію Spotify"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Вийти</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstantConnectSpotify}
                disabled={loadingStatus}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1ED760] hover:bg-[#1fdf64] text-stone-950 shadow-md transition-all cursor-pointer"
                title="Миттєво підключити Spotify через SPOTIFY_CLIENT_ID та SPOTIFY_CLIENT_SECRET"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Підключити Spotify</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between gap-2 text-xs text-emerald-200">
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-stone-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* OAuth Redirect URI Configuration Panel (fixes "redirect_uri: Not matching configuration" if user wants popup OAuth) */}
        {showOAuthSettings && (
          <div className="mt-3 p-3.5 rounded-xl bg-stone-950/90 border border-[#1ED760]/40 text-xs text-stone-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">
                Налаштування Redirect URI для Spotify Dashboard:
              </span>
              <button
                type="button"
                onClick={() => setShowOAuthSettings(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-stone-300 leading-relaxed">
              Пряме підключення через ваш <code>SPOTIFY_CLIENT_ID</code> вже працює автоматично без Redirect URI! Якщо ж ви хочете відкривати окреме вікно входу OAuth, скопіюйте цю адресу і додайте її в поле <strong>Redirect URIs</strong> у вашому{' '}
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1ED760] underline"
              >
                Spotify Developer Dashboard
              </a>
              , або впишіть сюди ту адресу, яку ви вже вказали в Spotify:
            </p>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customRedirectUri}
                onChange={(e) => setCustomRedirectUri(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 font-data-mono text-[11px] text-emerald-300 focus:outline-none focus:border-[#1ED760]"
              />
              <button
                type="button"
                onClick={handleCopyCallbackUrl}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 shrink-0 cursor-pointer text-[11px]"
              >
                {copiedCallback ? (
                  <Check className="w-3.5 h-3.5 text-[#1ED760]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCallback ? 'Скопійовано' : 'Копіювати'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400">
                Після збереження Redirect URI у Spotify Dashboard натисніть:
              </span>
              <button
                type="button"
                onClick={handleBrowserOAuthLogin}
                className="px-3 py-1 rounded-lg bg-[#1ED760]/20 hover:bg-[#1ED760]/30 text-[#1ED760] border border-[#1ED760]/40 font-semibold text-[11px] cursor-pointer"
              >
                Увійти через вікно OAuth ↗
              </button>
            </div>
          </div>
        )}

        {/* Custom Spotify Link Input Form */}
        {showUrlInput && (
          <form onSubmit={handleApplyCustomSpotifyUrl} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={spotifyUrlInput}
              onChange={(e) => setSpotifyUrlInput(e.target.value)}
              placeholder="Вставте посилання Spotify (open.spotify.com/track/... або /playlist/...)"
              className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#1ED760]/60"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-[#1ED760] hover:bg-[#1fdf64] text-stone-950 font-semibold text-xs cursor-pointer shrink-0"
            >
              Відкрити
            </button>
          </form>
        )}

        {/* Current Song & Official Spotify Cover Art + Basic Playback Controls (Play/Pause/Next/Prev) */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
          {/* Album / Playlist Cover with Spinning Vinyl Disc */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
            <div
              className={`absolute -right-2.5 top-1.5 bottom-1.5 w-20 rounded-full bg-stone-950 border border-white/20 shadow-lg flex items-center justify-center transition-transform duration-700 ${
                isPlaying ? 'translate-x-2 animate-spin' : 'translate-x-0'
              }`}
              style={{ animationDuration: '8s' }}
            >
              <Disc className="w-7 h-7 text-[#1ED760]/70" />
            </div>

            <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/20 shadow-lg bg-stone-900">
              <img
                src={displayedTrack?.coverUrl || activeEmbed.coverSrc}
                alt={displayedTrack?.title || activeEmbed.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-semibold text-[#1ED760] uppercase tracking-wider">
                  Spotify
                </span>
              </div>
            </div>
          </div>

          {/* Track Metadata & Controls */}
          <div className="flex-1 min-w-0 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-between gap-2">
              <span className="text-[11px] text-[#1ED760] font-medium truncate">
                {displayedTrack
                  ? `${displayedTrack.artist}${displayedTrack.album ? ` · ${displayedTrack.album}` : ''}`
                  : activeEmbed.subtitle}
              </span>
              {durationMs > 0 && (
                <span className="text-[10px] font-data-mono text-stone-400">
                  {formatMs(positionMs)} / {formatMs(durationMs)}
                </span>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-semibold text-white font-serif-display tracking-wide truncate mt-0.5">
              {displayedTrack ? displayedTrack.title : activeEmbed.title}
            </h4>

            {/* Live Progress Bar */}
            {durationMs > 0 && (
              <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1ED760] transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (positionMs / Math.max(1, durationMs)) * 100)}%`,
                  }}
                />
              </div>
            )}

            {/* Playback Transport Buttons (Prev / Play-Pause / Next / Open in Spotify) */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepTrack('previous')}
                  className="p-2 rounded-xl glass-pill text-stone-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  title="Попередній трек або плейлист"
                  aria-label="Попередній"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlayPause}
                  className="px-4 py-1.5 rounded-xl bg-[#1ED760] hover:bg-[#1fdf64] text-stone-950 font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  title={isPlaying ? 'Пауза' : 'Грати'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Пауза</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Грати</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleStepTrack('next')}
                  className="p-2 rounded-xl glass-pill text-stone-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  title="Наступний трек або плейлист"
                  aria-label="Наступний"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
                {/* Always-Visible Interactive Spotify Volume Slider */}
                <div
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/35 border border-white/10"
                  title="Регулювання гучності безпосередньо у віджеті"
                >
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="text-stone-300 hover:text-[#1ED760] transition-colors cursor-pointer shrink-0"
                    title={isMuted || effectiveVolume === 0 ? 'Увімкнути звук' : 'Вимкнути звук'}
                    aria-label={
                      isMuted || effectiveVolume === 0 ? 'Увімкнути звук' : 'Вимкнути звук'
                    }
                  >
                    {isMuted || effectiveVolume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : effectiveVolume < 50 ? (
                      <Volume1 className="w-4 h-4 text-[#1ED760]" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#1ED760]" />
                    )}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={effectiveVolume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    aria-label="Гучність віджета Spotify"
                    style={{
                      background: `linear-gradient(to right, #1ED760 0%, #1ED760 ${effectiveVolume}%, rgba(255,255,255,0.18) ${effectiveVolume}%, rgba(255,255,255,0.18) 100%)`,
                    }}
                    className="w-24 sm:w-28 h-1.5 rounded-lg appearance-none accent-[#1ED760] cursor-pointer"
                  />

                  <span className="text-[11px] font-data-mono text-stone-300 w-8 text-right select-none">
                    {effectiveVolume}%
                  </span>
                </div>

                <a
                  href={
                    displayedTrack?.externalUrl ||
                    `https://open.spotify.com/${activeEmbed.type}/${activeEmbed.id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] glass-pill text-stone-300 hover:text-[#1ED760] transition-colors shrink-0"
                  title="Відкрити у застосунку Spotify"
                >
                  <span>Spotify</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Official Spotify IFrame API Player Container */}
        <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 bg-stone-950/60 shadow-inner min-h-[152px]">
          <div ref={embedHostRef} className="w-full" />
        </div>
      </div>

      {/* Playlists & Tracks Selector */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-[11px] text-stone-400 mb-2">
          <span className="flex items-center gap-1.5">
            <ListMusic className="w-3.5 h-3.5 text-[#1ED760]" />
            <span>Добірка треків та плейлистів Spotify:</span>
          </span>
          {customEmbed && (
            <button
              type="button"
              onClick={() => setCustomEmbed(null)}
              className="text-[10px] text-amber-300 hover:underline cursor-pointer"
            >
              Повернути стандартні
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-1">
          {CURATED_SPOTIFY_ITEMS.map((item, idx) => {
            const active = !customEmbed && idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCustomEmbed(null);
                  setActiveIndex(idx);
                }}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1ED760]/20 border-[#1ED760]/50 text-white'
                    : 'bg-white/5 border-white/5 text-stone-300 hover:border-white/15 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={item.coverSrc}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-md object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{item.title}</div>
                    <div className="text-[10px] text-stone-400 truncate">{item.subtitle}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
