#!/bin/bash
# Argo Maps — OSM Armenia Data Import
# Downloads the latest Armenia OSM extract and imports into PostGIS
set -euo pipefail

OSM_URL="https://download.geofabrik.de/asia/armenia-latest.osm.pbf"
DATA_DIR="/tmp/argo-osm"

echo "═══════════════════════════════════════"
echo "  Argo Maps — OSM Import for Armenia"
echo "═══════════════════════════════════════"

# Install tools if missing
apt-get update -qq && apt-get install -y -qq wget osm2pgsql > /dev/null 2>&1 || true

mkdir -p "$DATA_DIR"

# Download Armenia extract (~35 MB)
if [ ! -f "$DATA_DIR/armenia.osm.pbf" ]; then
  echo "→ Downloading Armenia OSM data..."
  wget -q --show-progress -O "$DATA_DIR/armenia.osm.pbf" "$OSM_URL"
else
  echo "→ Using cached Armenia OSM data"
fi

echo "→ Importing into PostGIS (this takes 2-5 minutes)..."

osm2pgsql \
  --create \
  --slim \
  --database "$PGDATABASE" \
  --host "$PGHOST" \
  --username "$PGUSER" \
  --port 5432 \
  --proj 3857 \
  --multi-geometry \
  --hstore \
  --style /scripts/argo.style \
  --tag-transform-script /scripts/argo-transform.lua \
  "$DATA_DIR/armenia.osm.pbf" \
  2>&1 || {
    echo "⚠ osm2pgsql with custom style failed, trying default import..."
    osm2pgsql \
      --create \
      --slim \
      --database "$PGDATABASE" \
      --host "$PGHOST" \
      --username "$PGUSER" \
      --port 5432 \
      --proj 3857 \
      --multi-geometry \
      --hstore \
      "$DATA_DIR/armenia.osm.pbf" \
      2>&1
  }

echo ""
echo "✓ OSM import complete!"
echo "→ Tables created:"
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c "\dt" 2>/dev/null || true
echo "═══════════════════════════════════════"
