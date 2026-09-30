#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../../bigbluebutton-html5"

if [ ! -d node_modules ]; then
  npm ci --no-progress
fi

rm -rf dist
npm run build-safari
npm run build

cd dist
HASH=$(ls | grep -Eo 'bundle\.[a-f0-9]{20}\.js' | head -n 1 | grep -Eo '[a-f0-9]{20}')
if [ -z "$HASH" ]; then
  echo "bundle hash not found in dist/" >&2
  exit 1
fi

for FILE in *.safari.js *.safari.js.map; do
  if [[ "$FILE" == *"$HASH"* ]]; then
    continue
  fi
  PREFIX="${FILE%%.safari.js*}"
  SUFFIX="${FILE#*.safari.js}"
  mv "$FILE" "${PREFIX}.${HASH}.safari.js${SUFFIX}"
done

echo "built html5 client, bundle hash $HASH"
