#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
HOST_KEY="${1:?usage: install-monitoring.sh <host>   (a name from config/hosts/, e.g. stage)}"

set -a
source "$DIR/config/hosts/$HOST_KEY.env"
set +a

if [ -z "${SSH_TARGET:-}" ]; then
  echo "hosts/$HOST_KEY.env has no SSH_TARGET - that box is not provisioned yet" >&2
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
for f in "$DIR"/monitoring/*; do
  sed -e "s|\${BBB_HOST}|$BBB_HOST|g" "$f" > "$TMP/$(basename "$f")"
done

tar -C "$TMP" -cf - . | ssh "$SSH_TARGET" 'rm -rf /tmp/tcz-monitoring && mkdir -p /tmp/tcz-monitoring && tar -xf - -C /tmp/tcz-monitoring'

ssh "$SSH_TARGET" "BBB_HOST='$BBB_HOST'" 'bash -s' <<'REMOTE'
set -euo pipefail

if ! command -v docker >/dev/null; then
  sudo apt-get update -q
  sudo apt-get install -yq docker.io
fi
if ! sudo docker compose version >/dev/null 2>&1; then
  sudo apt-get install -yq docker-compose-v2
fi

STACK=/opt/tcz/bbb-monitoring
sudo mkdir -p "$STACK"
sudo cp /tmp/tcz-monitoring/docker-compose.yaml /tmp/tcz-monitoring/prometheus.yaml "$STACK/"
sudo cp /tmp/tcz-monitoring/monitoring.nginx /usr/share/bigbluebutton/nginx/monitoring.nginx
rm -rf /tmp/tcz-monitoring

if [ ! -f "$STACK/bbb_exporter_secrets.env" ]; then
  SECRET=$(sudo bbb-conf --secret | grep -oP 'Secret: \K\S+')
  sudo install -m 600 /dev/null "$STACK/bbb_exporter_secrets.env"
  sudo tee "$STACK/bbb_exporter_secrets.env" >/dev/null <<ENV
API_BASE_URL=https://$BBB_HOST/bigbluebutton/api/
API_SECRET=$SECRET
ENV
fi

sudo nginx -t
sudo systemctl reload nginx

cd "$STACK"
sudo docker compose up -d --quiet-pull

sleep 5
echo "--- container state ---"
sudo docker compose ps --format '{{.Name}} {{.State}}'
echo "--- exporter scrape ---"
(curl -sf http://127.0.0.1:9688/metrics || echo "exporter not answering yet") | head -2
echo "--- grafana ---"
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/login || true
REMOTE

echo "monitoring stack installed on $HOST_KEY ($BBB_HOST) - grafana at https://$BBB_HOST/monitoring/"
