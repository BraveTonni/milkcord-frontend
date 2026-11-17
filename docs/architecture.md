# Architecture

## Module map

```
src/main.jsx                entry: providers + router
src/App.jsx                 route table
src/app/
  config.js                 backend origin (VITE_API_BASE_URL, build-time)
  api/                      one axios client per resource, BaseApi holds the
                            access_token cookie; WebSocketApi wraps the socket
                            with reconnect + event emitter
  providers/                AuthProvider (session), RouterProvider (routes),
                            WebSocketProvider (connection state, re-send loop)
  styles/                   global css: base, scrollbar, toasts
src/features/
  call/                     WebRTC: CallProvider (context + signalling glue),
                            useLocalMedia, usePeerConnection, useNegotiation,
                            useScreenShare, CallWindow and call modals
  Time / Title / UserStatus small shared hooks/components
src/components/             presentational blocks (header, profile, messenger,
                            posts, home sections, auth guards)
src/pages/                  route-level compositions of components
```

Import direction: `pages → components → features → app/api → app/config`.
Components never call axios directly — requests go through the api clients,
so the backend origin is defined in exactly one place.

## Auth

`BaseApi` stores `access_token` in a cookie (`SameSite=Lax`, `Secure` only
when the page is served over https). API clients read it per request and send
it as the `access_token` query/body field expected by the backend. `AuthProvider`
hydrates the current user on load and exposes login/logout to the router
guards (`ProtectedRoute`, `NoAuthRoute`).

## Realtime

`WebSocketProvider` owns a single `WebSocketAPI` instance:

- connects after the token is known, auto-reconnects on close with a fixed
  interval and shows a fullscreen overlay while `reconnecting`;
- `send/on/off` are exposed through context — components subscribe to server
  events (`message`, `message:*`, `friend:*`, `webrtc:*`) and never touch the
  socket directly;
- payload shape is `{ event, payload }`; unknown events fall back to the
  `message` channel for legacy handlers.

Message delivery itself is server-pushed from the REST layer; the socket is
used for live notifications and call signalling.

## Calls (WebRTC)

`CallProvider` is the state machine (`incoming/ringing/active/...`) and the
only place that sends `webrtc:offer|answer|ice` frames — each carries the
`call_id` the backend relays to the partner. Media capture, peer connection
and renegotiation are split into hooks (`useLocalMedia`, `usePeerConnection`,
`useNegotiation`, `useScreenShare`) so camera/screen tracks can be added
mid-call. UI lives in `CallWindow` plus incoming/outgoing modals.

## Styling

Tailwind 4 via the vite plugin for utility classes, MUI only for icons,
plus three global stylesheets (base tokens, custom scrollbar, toast theme).
Adaptive breakpoints follow `md:`/`lg:` with a mobile-first messenger layout.

## Build & runtime config

All `VITE_*` variables are inlined at build time — changing the backend url
means rebuilding (see `.env.example`). The production bundle is a single JS
chunk (~240 kB gzip) served by nginx with `try_files` SPA fallback; hashed
`/assets/*` are cached immutably, `index.html` is not.
