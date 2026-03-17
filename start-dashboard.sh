#!/bin/bash
# Auto-restarting dashboard server
# Restarts Next.js dev server if it crashes, with a 5-second cooldown
# Usage: nohup bash start-dashboard.sh &

cd "$(dirname "$0")"
LOG_FILE="dashboard.log"

while true; do
  echo "$(date) — Starting Next.js dev server..." >> "$LOG_FILE"
  npx next dev --hostname 0.0.0.0 --port 3000 >> "$LOG_FILE" 2>&1
  EXIT_CODE=$?
  echo "$(date) — Server exited with code $EXIT_CODE, restarting in 5s..." >> "$LOG_FILE"
  sleep 5
done
