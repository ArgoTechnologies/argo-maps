#!/bin/bash
# Argo Maps — Build Offline Tiles (Planetiler)

# set -euo pipefail

# TILES_DIR="$(dirname "$0")/../tiles"
#mkdir -p "$TILES_DIR"

#echo "═══════════════════════════════════════"
#echo "  Argo Maps — Building Offline vector tiles"
#echo "═══════════════════════════════════════"
#echo ""
#echo "This will download OpenStreetMap data for Armenia"
#echo "and compile it into a highly efficient PMTiles format."
#echo "This might take 3-5 minutes depending on your CPU."
#echo ""

#sudo docker run --rm -v "$TILES_DIR":/data ghcr.io/onthegomap/planetiler:latest --area=armenia --bounds=43.43,38.83,46.63,41.30 --output=/data/armenia.pmtiles --force --download

#echo "✓ Build complete! Offline tiles saved to infrastructure/tiles/armenia.pmtiles"
