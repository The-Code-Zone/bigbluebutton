#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
HOST_KEY="${1:?usage: apply.sh <host>   (a name from hosts/, e.g. stage)}"

set -a
source "$DIR/hosts/$HOST_KEY.env"
set +a

if [ -z "${SSH_TARGET:-}" ]; then
  echo "hosts/$HOST_KEY.env has no SSH_TARGET - that box is not provisioned yet" >&2
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
for f in "$DIR"/files/*; do
  sed -e "s|\${BBB_HOST}|$BBB_HOST|g" \
      -e "s|\${RECORDING_ROOT}|$RECORDING_ROOT|g" \
      -e "s|\${MP4_DIR}|$MP4_DIR|g" \
      -e "s|\${LOG_FILE}|$LOG_FILE|g" \
      "$f" > "$TMP/$(basename "$f")"
done

tar -C "$TMP" -cf - . | ssh "$SSH_TARGET" 'rm -rf /tmp/bbb-config && mkdir -p /tmp/bbb-config && tar -xf - -C /tmp/bbb-config'

ssh "$SSH_TARGET" bash -s <<'REMOTE'
set -euo pipefail
sudo cp /tmp/bbb-config/bbb-html5.yml /etc/bigbluebutton/bbb-html5.yml
sudo install -m 755 /tmp/bbb-config/cron.daily-bigbluebutton-published-deletion /etc/cron.daily/bigbluebutton-published-deletion

while IFS= read -r kv; do
  [ -z "$kv" ] && continue
  k="${kv%%=*}"
  sudo grep -q "^$k=" /etc/bigbluebutton/bbb-web.properties \
    && sudo sed -i "s/^$k=.*/$kv/" /etc/bigbluebutton/bbb-web.properties \
    || echo "$kv" | sudo tee -a /etc/bigbluebutton/bbb-web.properties >/dev/null
done < /tmp/bbb-config/bbb-web.overrides

TURN_SECRET=$(sudo grep -oP '^static-auth-secret=\K.+' /etc/turnserver.conf)
sudo install -m 640 -o root -g bigbluebutton /tmp/bbb-config/turn-stun-servers.xml /etc/bigbluebutton/turn-stun-servers.xml
sudo sed -i "s|\${TURN_SECRET}|$TURN_SECRET|g" /etc/bigbluebutton/turn-stun-servers.xml

sudo install -m 644 /tmp/bbb-config/base_worker.rb /usr/local/bigbluebutton/core/lib/recordandplayback/workers/base_worker.rb

sudo mkdir -p /etc/systemd/system/bbb-rap-resque-worker.service.d
sudo install -m 644 /tmp/bbb-config/systemd-bbb-rap-resque-worker-override.conf /etc/systemd/system/bbb-rap-resque-worker.service.d/tcz.conf
sudo systemctl daemon-reload

rm -rf /tmp/bbb-config
sudo bbb-conf --restart >/dev/null 2>&1
sudo bbb-conf --status | sed -n '1,4p'
REMOTE

echo "config applied to $HOST_KEY ($BBB_HOST)"
