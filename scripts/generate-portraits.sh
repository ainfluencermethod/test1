#!/usr/bin/env bash
# Generate 13 Syndicate character portraits via fal.ai nano-banana-pro
# Works with bash 3.x (macOS default)
set -euo pipefail

FAL_KEY="ce18cf8f-0281-436c-a2f1-7c94dc488f86:c3636853817364148f0e71c8a11ff33e"
MODEL="fal-ai/nano-banana-pro"
OUT_DIR="/Users/jarvis/.openclaw/workspace/content-dashboard/public/syndicate"
mkdir -p "$OUT_DIR"

BASE="cinematic portrait, dramatic lighting, dark moody atmosphere, film grain, GTA V loading screen style, photorealistic, 8k, upper body portrait, dark background"

# Arrays of keys and prompts (parallel arrays)
KEYS=(
  el-patron
  the-partner
  the-sniper
  the-hitman
  the-architect
  the-ghost
  the-face
  the-chemist
  the-forger
  the-fox
  the-informant
  the-banker
  the-oracle
)

PROMPTS=(
  "young man in his late 20s, gold chain necklace, dark tailored suit, cigar smoke wisps, dramatic side lighting, luxury dark office with leather chair background, confident smirk, slicked back hair, $BASE"
  "young man in his mid 20s, black leather jacket, confident powerful stance, neon city backdrop at night, determined look, short dark hair, slightly rugged, $BASE"
  "young woman, tactical black outfit, focused intense gaze, sniper scope lens reflection in eye, sharp features, ponytail, green night vision glow accents, $BASE"
  "man in sleek black suit and tie, trimmed beard, intensely focused dark eyes, rain drops and wet hair, dark moody rain backdrop, John Wick style, $BASE"
  "mysterious hooded figure, dark hood covering upper face, holographic blue-teal displays floating around, futuristic cyberpunk aesthetic, teal and blue glow, digital matrix background, $BASE"
  "faceless dark silhouette figure, hood pulled deep over face, purple smoke wisps, dark alley background, purple and blue glow from behind, anonymous infiltrator, $BASE"
  "glamorous young woman, elegant red dress, spotlight from above, paparazzi camera flash effects, confident alluring smile, dark hair flowing, luxury event backdrop, $BASE"
  "person in lab setting, safety goggles pushed up on forehead, green chemical glow illuminating face, beakers and lab equipment, Breaking Bad style, intense focused expression, $BASE"
  "creative artist figure, paint splashes on clothes and face, colorful neon paint drips, creative chaos surrounding, canvas and brushes, vibrant purple and orange accent lighting, $BASE"
  "sleek mysterious figure, ornate fox mask half-removed revealing clever eyes, standing on city rooftop at night, orange ambient city glow, cunning expression, $BASE"
  "man in dark trenchcoat with collar up, holding folded newspaper, dramatic shadows from street lamp, film noir aesthetic, black and white tones with warm highlights, $BASE"
  "person in sharp pinstripe suit, gold watch, standing before massive gold vault door, golden ambient light, calculating cold expression, Wall Street power, $BASE"
  "mystical figure, glowing third eye on forehead, floating data streams and numbers surrounding head, purple aura glow, meditative pose, cosmic dark background, $BASE"
)

echo "🎨 Generating 13 Syndicate portraits..."
echo ""

# Store request IDs in a temp file
TMPFILE=$(mktemp /tmp/syndicate-ids.XXXXX)

# Submit all requests
for i in "${!KEYS[@]}"; do
  key="${KEYS[$i]}"
  prompt="${PROMPTS[$i]}"
  echo "📤 Submitting: $key"
  
  BODY=$(jq -n --arg p "$prompt" '{prompt: $p, num_images: 1, aspect_ratio: "3:4"}')
  
  RESPONSE=$(curl -s -X POST "https://queue.fal.run/$MODEL" \
    -H "Authorization: Key $FAL_KEY" \
    -H "Content-Type: application/json" \
    -d "$BODY")
  
  REQUEST_ID=$(echo "$RESPONSE" | jq -r '.request_id // empty')
  
  if [ -z "$REQUEST_ID" ]; then
    echo "   ❌ Failed: $RESPONSE"
    echo "$key=" >> "$TMPFILE"
    continue
  fi
  
  echo "$key=$REQUEST_ID" >> "$TMPFILE"
  echo "   ✅ Queued: $REQUEST_ID"
  sleep 0.3
done

echo ""
echo "⏳ Polling for results..."
echo ""

# Poll and download
while IFS='=' read -r key request_id; do
  if [ -z "$request_id" ]; then
    echo "⏭️  Skipping $key (no request ID)"
    continue
  fi
  
  echo "🔄 Waiting: $key"
  
  for attempt in $(seq 1 60); do
    STATUS_RESP=$(curl -s "https://queue.fal.run/$MODEL/requests/$request_id/status" \
      -H "Authorization: Key $FAL_KEY")
    
    STATUS=$(echo "$STATUS_RESP" | jq -r '.status // "UNKNOWN"')
    
    if [ "$STATUS" = "COMPLETED" ]; then
      RESULT=$(curl -s "https://queue.fal.run/$MODEL/requests/$request_id" \
        -H "Authorization: Key $FAL_KEY")
      
      IMAGE_URL=$(echo "$RESULT" | jq -r '.images[0].url // empty')
      
      if [ -z "$IMAGE_URL" ]; then
        echo "   ❌ No image URL found"
        echo "   Debug: $(echo "$RESULT" | jq -c 'keys')"
        break
      fi
      
      curl -s -L -o "$OUT_DIR/$key.png" "$IMAGE_URL"
      SIZE=$(wc -c < "$OUT_DIR/$key.png" | tr -d ' ')
      echo "   ✅ Downloaded: $key.png (${SIZE} bytes)"
      break
    elif [ "$STATUS" = "FAILED" ]; then
      echo "   ❌ Failed: $(echo "$STATUS_RESP" | jq -r '.error // "unknown"')"
      break
    fi
    
    sleep 2
  done
done < "$TMPFILE"

rm -f "$TMPFILE"
echo ""
echo "🎬 Done!"
ls -lh "$OUT_DIR"/ 2>/dev/null
