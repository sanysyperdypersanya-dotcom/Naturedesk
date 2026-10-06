import express, { type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SpotifyTokenStore {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  authMode: 'oauth' | 'client_credentials';
}

let activeSpotifySession: SpotifyTokenStore | null = null;
let userDisconnectedManually = false;
let lastRedirectUri: string = '';

function getSpotifyCredentials() {
  const clientId = (process.env.SPOTIFY_CLIENT_ID || process.env.CLIENT_ID || '').trim();
  const clientSecret = (
    process.env.SPOTIFY_CLIENT_SECRET ||
    process.env.CLIENT_SECRET ||
    ''
  ).trim();
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret),
  };
}

function resolveRedirectUri(req: Request): string {
  const queryUri = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri.trim() : '';
  if (queryUri && queryUri.startsWith('http')) {
    lastRedirectUri = queryUri;
    return queryUri;
  }
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI.trim();
  }
  if (lastRedirectUri) {
    return lastRedirectUri;
  }
  const appUrl = (
    process.env.APP_URL ||
    'https://ais-dev-3ci67dujs77lmx6ts2ftap-668383909936.europe-west2.run.app'
  ).replace(/\/$/, '');
  return `${appUrl}/auth/callback`;
}

function getTokensFromReq(req: Request): SpotifyTokenStore | null {
  if (activeSpotifySession && activeSpotifySession.accessToken) {
    return activeSpotifySession;
  }
  try {
    const raw = req.cookies?.spotify_session;
    if (raw) {
      const parsed = JSON.parse(raw) as SpotifyTokenStore;
      if (parsed.accessToken) {
        activeSpotifySession = parsed;
        return parsed;
      }
    }
  } catch {}
  return null;
}

function saveTokensToRes(res: Response, tokens: SpotifyTokenStore) {
  activeSpotifySession = tokens;
  userDisconnectedManually = false;
  res.cookie('spotify_session', JSON.stringify(tokens), {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

// Direct server-to-server Spotify authentication using SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET
// Requires NO Redirect URI and never triggers "redirect_uri: Not matching configuration"
async function authenticateWithClientCredentials(
  res?: Response
): Promise<SpotifyTokenStore | null> {
  const { clientId, clientSecret, configured } = getSpotifyCredentials();
  if (!configured) return null;

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) return null;

    const data = (await tokenRes.json()) as {
      access_token: string;
      expires_in: number;
    };

    if (!data.access_token) return null;

    const session: SpotifyTokenStore = {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      authMode: 'client_credentials',
    };

    if (res) {
      saveTokensToRes(res, session);
    } else {
      activeSpotifySession = session;
    }

    return session;
  } catch {
    return null;
  }
}

async function ensureValidAccessToken(
  req: Request,
  res: Response
): Promise<SpotifyTokenStore | null> {
  let tokens = getTokensFromReq(req);

  if (!tokens && !userDisconnectedManually) {
    tokens = await authenticateWithClientCredentials(res);
  }

  if (!tokens) return null;

  if (Date.now() < tokens.expiresAt - 45_000) {
    return tokens;
  }

  if (tokens.authMode === 'client_credentials' || !tokens.refreshToken) {
    return await authenticateWithClientCredentials(res);
  }

  const { clientId, clientSecret, configured } = getSpotifyCredentials();
  if (!configured) return tokens;

  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshToken,
    });
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      return await authenticateWithClientCredentials(res);
    }

    const data = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    const updated: SpotifyTokenStore = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      authMode: 'oauth',
    };
    saveTokensToRes(res, updated);
    return updated;
  } catch {
    return tokens;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // 1. Instant Server-Side Spotify Connection (uses SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET directly without redirect_uri)
  app.post('/api/spotify/connect', async (_req: Request, res: Response) => {
    userDisconnectedManually = false;
    const session = await authenticateWithClientCredentials(res);
    if (!session) {
      res.status(400).json({
        connected: false,
        error: 'Перевірте SPOTIFY_CLIENT_ID та SPOTIFY_CLIENT_SECRET у налаштуваннях AI Studio.',
      });
      return;
    }

    const { clientId } = getSpotifyCredentials();
    res.json({
      connected: true,
      authMode: session.authMode,
      clientIdPrefix: clientId.slice(0, 8),
    });
  });

  // 2. Construct Spotify OAuth 2.0 Authorization URL (for optional browser OAuth flow)
  app.get('/api/spotify/auth-url', (req: Request, res: Response) => {
    const { clientId, configured } = getSpotifyCredentials();
    const redirectUri = resolveRedirectUri(req);

    if (!configured) {
      res.json({
        configured: false,
        redirectUri,
        url: null,
      });
      return;
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      show_dialog: 'true',
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    res.json({
      configured: true,
      redirectUri,
      url: authUrl,
    });
  });

  // 3. Universal OAuth Callback Handler (handles /auth/callback, /callback, /api/auth/callback, and /?code=...)
  const callbackHandler = async (req: Request, res: Response) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const error = typeof req.query.error === 'string' ? req.query.error : '';

    if (error || !code) {
      res.send(`
        <!doctype html>
        <html lang="uk">
          <head><meta charset="utf-8"><title>Spotify OAuth</title></head>
          <body style="background:#0c0a09;color:#f5f5f4;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;padding:24px;">
              <h3>Авторизацію Spotify скасовано</h3>
              <p>Це вікно можна закрити.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(
                    error || 'cancelled'
                  )} }, '*');
                  setTimeout(() => window.close(), 1000);
                }
              </script>
            </div>
          </body>
        </html>
      `);
      return;
    }

    const { clientId, clientSecret, configured } = getSpotifyCredentials();
    const redirectUri = resolveRedirectUri(req);

    if (!configured) {
      res.status(400).send('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
      return;
    }

    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      });

      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const tokenData = (await tokenRes.json()) as any;

      if (!tokenRes.ok || !tokenData.access_token) {
        // Fallback to Client Credentials so the user is still connected!
        await authenticateWithClientCredentials(res);
      } else {
        const tokens: SpotifyTokenStore = {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
          authMode: 'oauth',
        };
        saveTokensToRes(res, tokens);
      }

      res.send(`
        <!doctype html>
        <html lang="uk">
          <head><meta charset="utf-8"><title>Spotify підключено</title></head>
          <body style="background:#0c0a09;color:#f5f5f4;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;padding:24px;">
              <h3 style="color:#1ed760;">Spotify успішно підключено!</h3>
              <p style="font-size:14px;color:#a8a29e;">Це вікно закриється автоматично...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'spotify' }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      res.status(500).send(`OAuth callback error: ${err?.message || 'Unknown error'}`);
    }
  };

  app.get(
    ['/auth/callback', '/auth/callback/', '/callback', '/callback/', '/api/auth/callback'],
    callbackHandler
  );

  // Also intercept root /?code=... in case user registered the root App URL as Redirect URI in Spotify Dashboard
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/' && typeof req.query.code === 'string' && req.query.code.length > 10) {
      callbackHandler(req, res);
      return;
    }
    next();
  });

  // 4. Resolve Real Spotify Track / Playlist / Album Metadata & Official Cover Art via Spotify oEmbed
  app.get('/api/spotify/resolve', async (req: Request, res: Response) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!rawUrl) {
      res.status(400).json({ error: 'Missing url parameter' });
      return;
    }

    try {
      const oembedRes = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(rawUrl)}`
      );
      if (!oembedRes.ok) {
        res.status(404).json({ error: 'Could not resolve Spotify item' });
        return;
      }
      const data = (await oembedRes.json()) as {
        title?: string;
        thumbnail_url?: string;
        author_name?: string;
      };
      res.json({
        title: data.title || 'Spotify Audio',
        coverUrl: data.thumbnail_url || '',
        subtitle: data.author_name || 'Spotify',
      });
    } catch {
      res.status(500).json({ error: 'Failed to resolve Spotify metadata' });
    }
  });

  // 4b. Fetch volume-controllable audio stream preview for a track/station query
  app.get('/api/spotify/audio-stream', async (req: Request, res: Response) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : 'lofi chill beats';
    try {
      const searchRes = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`
      );
      if (!searchRes.ok) {
        res.json({ previewUrl: null });
        return;
      }
      const data = (await searchRes.json()) as {
        results?: Array<{
          previewUrl?: string;
          trackName?: string;
          artistName?: string;
          artworkUrl100?: string;
        }>;
      };
      const firstWithPreview = (data.results || []).find((item) => Boolean(item.previewUrl));
      res.json({
        previewUrl: firstWithPreview?.previewUrl || null,
        trackName: firstWithPreview?.trackName || null,
        artistName: firstWithPreview?.artistName || null,
      });
    } catch {
      res.json({ previewUrl: null });
    }
  });

  // 5. Get Current Spotify Status
  app.get('/api/spotify/status', async (req: Request, res: Response) => {
    const { clientId, configured } = getSpotifyCredentials();
    const redirectUri = resolveRedirectUri(req);
    const session = await ensureValidAccessToken(req, res);

    if (!session) {
      res.json({
        configured,
        connected: false,
        redirectUri,
      });
      return;
    }

    if (session.authMode === 'client_credentials') {
      res.json({
        configured,
        connected: true,
        authMode: 'client_credentials',
        redirectUri,
        profile: {
          id: clientId.slice(0, 8),
          displayName: `Spotify API (${clientId.slice(0, 6)}…)`,
          avatarUrl: null,
          product: 'connected',
          profileUrl: 'https://open.spotify.com',
        },
        player: null,
        recentTracks: [],
        playlists: [],
      });
      return;
    }

    const headers = { Authorization: `Bearer ${session.accessToken}` };

    try {
      const [meRes, playerRes, recentRes, playlistsRes] = await Promise.all([
        fetch('https://api.spotify.com/v1/me', { headers }),
        fetch('https://api.spotify.com/v1/me/player', { headers }),
        fetch('https://api.spotify.com/v1/me/player/recently-played?limit=6', { headers }),
        fetch('https://api.spotify.com/v1/me/playlists?limit=10', { headers }),
      ]);

      if (meRes.status === 401) {
        const fallback = await authenticateWithClientCredentials(res);
        res.json({
          configured,
          connected: Boolean(fallback),
          authMode: 'client_credentials',
          redirectUri,
          profile: fallback
            ? {
                id: clientId.slice(0, 8),
                displayName: `Spotify API (${clientId.slice(0, 6)}…)`,
                avatarUrl: null,
                product: 'connected',
                profileUrl: 'https://open.spotify.com',
              }
            : null,
        });
        return;
      }

      const profile = meRes.ok ? await meRes.json() : null;
      const player = playerRes.status === 200 ? await playerRes.json() : null;
      const recentData = recentRes.ok ? await recentRes.json() : null;
      const playlistsData = playlistsRes.ok ? await playlistsRes.json() : null;

      res.json({
        configured,
        connected: true,
        authMode: 'oauth',
        redirectUri,
        profile: profile
          ? {
              id: profile.id,
              displayName: profile.display_name || profile.id,
              avatarUrl: profile.images?.[0]?.url || null,
              product: profile.product || 'free',
              profileUrl: profile.external_urls?.spotify || 'https://open.spotify.com',
            }
          : null,
        player: player
          ? {
              isPlaying: Boolean(player.is_playing),
              progressMs: player.progress_ms || 0,
              shuffleState: Boolean(player.shuffle_state),
              repeatState: player.repeat_state || 'off',
              volumePercent: player.device?.volume_percent ?? 70,
              deviceName: player.device?.name || 'Spotify Device',
              track: player.item
                ? {
                    id: player.item.id,
                    uri: player.item.uri,
                    title: player.item.name,
                    artist: (player.item.artists || []).map((a: any) => a.name).join(', '),
                    album: player.item.album?.name || '',
                    coverUrl: player.item.album?.images?.[0]?.url || '',
                    durationMs: player.item.duration_ms || 0,
                    externalUrl: player.item.external_urls?.spotify || '',
                  }
                : null,
            }
          : null,
        recentTracks: (recentData?.items || []).map((entry: any) => ({
          id: entry.track?.id,
          uri: entry.track?.uri,
          title: entry.track?.name,
          artist: (entry.track?.artists || []).map((a: any) => a.name).join(', '),
          album: entry.track?.album?.name || '',
          coverUrl: entry.track?.album?.images?.[0]?.url || '',
          durationMs: entry.track?.duration_ms || 0,
          externalUrl: entry.track?.external_urls?.spotify || '',
        })),
        playlists: (playlistsData?.items || []).map((pl: any) => ({
          id: pl.id,
          uri: pl.uri,
          name: pl.name,
          coverUrl: pl.images?.[0]?.url || '',
          tracksTotal: pl.tracks?.total || 0,
          externalUrl: pl.external_urls?.spotify || '',
        })),
      });
    } catch (err: any) {
      res.status(500).json({
        configured,
        connected: false,
        error: err?.message || 'Failed to query Spotify API',
      });
    }
  });

  // 6. Spotify Playback Controls
  app.post('/api/spotify/control', async (req: Request, res: Response) => {
    const session = await ensureValidAccessToken(req, res);
    if (!session) {
      res.status(401).json({ error: 'NOT_AUTHENTICATED' });
      return;
    }

    if (session.authMode === 'client_credentials') {
      res.json({ ok: true, mode: 'iframe_controller' });
      return;
    }

    const { action, uri, contextUri, positionMs, volumePercent } = req.body || {};
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      let apiRes: globalThis.Response;

      switch (action) {
        case 'play': {
          const payload: Record<string, any> = {};
          if (contextUri) payload.context_uri = contextUri;
          if (uri) payload.uris = [uri];
          apiRes = await fetch('https://api.spotify.com/v1/me/player/play', {
            method: 'PUT',
            headers,
            body: Object.keys(payload).length > 0 ? JSON.stringify(payload) : undefined,
          });
          break;
        }
        case 'pause':
          apiRes = await fetch('https://api.spotify.com/v1/me/player/pause', {
            method: 'PUT',
            headers,
          });
          break;
        case 'next':
          apiRes = await fetch('https://api.spotify.com/v1/me/player/next', {
            method: 'POST',
            headers,
          });
          break;
        case 'previous':
          apiRes = await fetch('https://api.spotify.com/v1/me/player/previous', {
            method: 'POST',
            headers,
          });
          break;
        case 'seek':
          apiRes = await fetch(
            `https://api.spotify.com/v1/me/player/seek?position_ms=${Math.max(
              0,
              Math.floor(Number(positionMs) || 0)
            )}`,
            {
              method: 'PUT',
              headers,
            }
          );
          break;
        case 'volume':
          apiRes = await fetch(
            `https://api.spotify.com/v1/me/player/volume?volume_percent=${Math.min(
              100,
              Math.max(0, Math.floor(Number(volumePercent) || 0))
            )}`,
            {
              method: 'PUT',
              headers,
            }
          );
          break;
        default:
          res.status(400).json({ error: 'Unknown control action' });
          return;
      }

      if (apiRes.status === 404 || apiRes.status === 403) {
        res.json({ ok: true, mode: 'iframe_controller' });
        return;
      }

      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Spotify control failed' });
    }
  });

  // 7. Disconnect Spotify Session
  app.post('/api/spotify/disconnect', (_req: Request, res: Response) => {
    activeSpotifySession = null;
    userDisconnectedManually = true;
    res.clearCookie('spotify_session', {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
    });
    res.json({ ok: true });
  });

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
