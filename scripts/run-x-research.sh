#!/bin/bash
# Run X research report generation
# Called by cron at midnight Pacific time
cd "$(dirname "$0")/.."
export $(grep -v '^#' .env.local | xargs)
npx tsx scripts/x-research.ts "$@"
