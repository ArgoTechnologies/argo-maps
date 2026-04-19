# 🗺️ Argo Maps — Tile Server Infrastructure

Self-hosted vector tile infrastructure for Armenia's native map platform.

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   Argo Maps                       │
│                                                   │
│  Client (MapLibre GL)                             │
│       ↓ GET /tiles/{z}/{x}/{y}.mvt                │
│  ┌─────────┐                                      │
│  │  Nginx  │ :8080  ← CORS + Cache (7 days)      │
│  └────┬────┘                                      │
│       ↓                                           │
│  ┌─────────┐                                      │
│  │ Martin  │ :3100  ← Rust tile server            │
│  └────┬────┘                                      │
│       ↓                                           │
│  ┌──────────┐                                     │
│  │ PostGIS  │ :5432 ← OSM Armenia data            │
│  └──────────┘                                     │
└──────────────────────────────────────────────────┘
```

## Quick Start

```bash
cd infrastructure

# Start the stack
docker compose up -d

# The OSM import runs automatically on first boot (~5 min)
# Watch progress:
docker compose logs -f osm-import

# Once complete, verify tiles:
curl -s http://localhost:8080/health
curl -s http://localhost:3100/catalog | jq
```

## Endpoints

| URL | Description |
|-----|-------------|
| `http://localhost:8080/tiles/{z}/{x}/{y}.mvt` | Vector tiles (via Nginx cache) |
| `http://localhost:8080/style.json` | Argo Light style |
| `http://localhost:8080/health` | Health check |
| `http://localhost:3100/catalog` | Martin tile catalog (debug) |

## Connect to Your App

Once tiles are running, update the map component:

```tsx
// Before (uses CARTO public tiles)
style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

// After (uses YOUR tiles)
style: 'http://localhost:8080/style.json'
```

Or for production with your domain:

```tsx
style: 'https://api.argotech.am/maps/style.json?key=YOUR_KEY'
```

## Updating OSM Data

To refresh with latest OpenStreetMap data:

```bash
docker compose run --rm osm-import
```

## File Structure

```
infrastructure/
├── docker-compose.yml      # Full stack definition
├── martin/
│   └── config.yaml         # Martin tile server config
├── nginx/
│   └── default.conf        # Reverse proxy + CORS + cache
├── scripts/
│   ├── init-db.sql         # PostGIS schema
│   └── import-osm.sh       # OSM data downloader & importer
└── styles/
    └── argo-light.json     # Production map style
```

## Requirements

- Docker 24+ with Compose v2
- ~2 GB disk space (Armenia OSM data + tiles cache)
- ~1 GB RAM minimum
