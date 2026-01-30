#!/usr/bin/env bash
set -euo pipefail

echo "[AIOS] Validating environment..."

required_bins=(docker docker-compose git node npm)
missing=()

for b in "${required_bins[@]}"; do
  if ! command -v "$b" >/dev/null 2>&1; then
    missing+=("$b")
  fi
done

if [ "${#missing[@]}" -gt 0 ]; then
  echo "[AIOS] Missing required tools: ${missing[*]}"
  exit 1
fi

echo "[AIOS] Tool versions:"
docker --version
docker-compose --version || true
git --version
node --version
npm --version

echo "[AIOS] Docker daemon check..."
docker info >/dev/null 2>&1 || { echo "[AIOS] Docker daemon not running or not accessible."; exit 1; }

echo "[AIOS] OK"