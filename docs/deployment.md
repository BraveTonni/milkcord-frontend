# Deployment

## Docker Compose (recommended)

```bash
cp .env.example .env           # set VITE_API_BASE_URL to your backend
docker compose up --build -d
curl -fsS http://localhost:8080/
```

The image is built in two stages:

1. `node:24-alpine` — `npm ci` + `vite build` (the `VITE_*` variables are
   baked in here, so pass them as build args when needed);
2. `nginx:1.27-alpine` — serves `dist/` with an SPA fallback (`nginx.conf`),
   gzip enabled, hashed assets cached for a year.

`docker-compose.yml` exposes the app on port 8080; put a TLS terminator in
front of it in production — the `Secure` cookie flag activates automatically
once the page is served over https.

### Passing the API url at build time

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com .
```

Add the line `ARG VITE_API_BASE_URL` / `ENV VITE_API_BASE_URL=$VITE_API_BASE_URL`
to the builder stage if you build this way (Vite reads `VITE_*` from the
environment during `npm run build`).

## Without Docker

```bash
npm ci
npm run build        # outputs dist/
npm run preview      # local check of the production bundle
```

Serve `dist/` from any static host; every unknown path must fall back to
`index.html` (react-router owns the URLs).

## CI

`.github/workflows/ci.yml` runs `npm ci`, `npm run lint` and `npm run build`
on every push and pull request to `main` — a red lint or a broken bundle
blocks the merge.

## Operational notes

- No secrets ship with the bundle: only `VITE_*` values are inlined, and the
  app holds just the access-token cookie.
- `.env` files are git-ignored; `.env.example` documents the expected keys.
- The bundle size warning (>500 kB chunk) is known — the call feature and MUI
  icons dominate it; route-level `React.lazy` is the next step if it matters.
