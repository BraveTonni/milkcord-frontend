# MilkCord Frontend

React client for the MilkCord messenger: chats with live WebSocket updates,
posts and friends, music, and WebRTC audio/video/screen calls.

## Stack

- React 19 + Vite 7, ESLint
- MUI icons, Tailwind CSS 4, react-toastify
- Axios API clients, react-router-dom 7
- WebRTC calls with a WebSocket signalling layer
- Docker (nginx), GitHub Actions CI

## Quick start

```bash
# 1. install dependencies
npm ci

# 2. point the app at your backend (defaults to http://127.0.0.1:7000)
cp .env.example .env

# 3. dev server with hot reload
npm run dev
```

Other scripts:

```bash
npm run lint      # eslint
npm run build     # production bundle in dist/
npm run preview   # serve the production bundle locally
```

## Configuration

The only build-time variable is the backend origin (no trailing slash):

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:7000` | REST + WebSocket base url |

It is read by every API client through `src/app/config.js`; the WebSocket
client automatically rewrites `http` → `ws`.

## Docker

```bash
docker compose up --build
# app is served on http://localhost:8080
```

The image is a two-stage build (node compiles the bundle, nginx serves it with
an SPA fallback — see `nginx.conf`).

## Layout

```
src/app/api         # axios clients per resource + websocket client
src/app/config.js   # backend origin (VITE_API_BASE_URL)
src/app/providers   # auth, router, websocket context
src/app/styles      # global css
src/components      # reusable ui: layout, header, profile, messenger, posts
src/features        # cross-page hooks: time, status, webrtc call feature
src/pages           # route components (home, auth, profile, settings, errors)
```

## Related repositories

- [milkcord](https://github.com/BraveTonni/milkcord) — umbrella repo
- [milkcord-backend](https://github.com/BraveTonni/milkcord-backend) — FastAPI backend
