#!/usr/bin/env bash
set -euo pipefail

HOST="${1:-thecodezone@bbb-stage.thecode.zone}"
DIR="$(dirname "$0")"

scp "$DIR/bbb-html5.yml" "$HOST:/tmp/bbb-html5.yml"
ssh "$HOST" bash -s <<'REMOTE'
set -euo pipefail
sudo cp /tmp/bbb-html5.yml /etc/bigbluebutton/bbb-html5.yml
rm /tmp/bbb-html5.yml
for kv in "maxUserConcurrentAccesses=1" "allowRequestsWithoutSession=true" "audioBridge=livekit"; do
  k="${kv%%=*}"
  sudo grep -q "^$k=" /etc/bigbluebutton/bbb-web.properties \
    && sudo sed -i "s/^$k=.*/$kv/" /etc/bigbluebutton/bbb-web.properties \
    || echo "$kv" | sudo tee -a /etc/bigbluebutton/bbb-web.properties >/dev/null
done
sudo bbb-conf --restart >/dev/null 2>&1
sudo bbb-conf --status | head -6
REMOTE
echo "stage config applied and BBB restarted"
