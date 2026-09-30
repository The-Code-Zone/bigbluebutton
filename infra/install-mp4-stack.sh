#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$DIR/.." && pwd)"
HOST_KEY="${1:?usage: install-mp4-stack.sh <host>   (a name from config/hosts/, e.g. stage)}"

set -a
source "$DIR/config/hosts/$HOST_KEY.env"
set +a

if [ -z "${SSH_TARGET:-}" ]; then
  echo "hosts/$HOST_KEY.env has no SSH_TARGET - that box is not provisioned yet" >&2
  exit 1
fi

tar -C "$REPO" -cf - tcz-mp4-converter tcz-mp4-api \
  | ssh "$SSH_TARGET" 'rm -rf /tmp/tcz-mp4 && mkdir -p /tmp/tcz-mp4 && tar -xf - -C /tmp/tcz-mp4'

ssh "$SSH_TARGET" "BBB_HOST='$BBB_HOST' MP4_DIR='$MP4_DIR'" 'bash -s' <<'REMOTE'
set -euo pipefail

if ! command -v docker >/dev/null; then
  sudo apt-get update -q
  sudo apt-get install -yq docker.io
fi
sudo usermod -aG docker bigbluebutton

CONVERTER=/opt/tcz/bbb-mp4-converter
API=/opt/tcz/bbb-mp4-api

sudo mkdir -p /opt/tcz
sudo rm -rf "$CONVERTER.new" "$API.new"
sudo cp -r /tmp/tcz-mp4/tcz-mp4-converter "$CONVERTER.new"
sudo cp -r /tmp/tcz-mp4/tcz-mp4-api "$API.new"

sudo tee "$CONVERTER.new/.env" >/dev/null <<ENV
BBB_DOMAIN_NAME=$BBB_HOST
COPY_TO_LOCATION=$MP4_DIR
LOG_FILE=$CONVERTER/log
DAY_START_HOUR=7
DAY_END_HOUR=22
MAX_CONCURRENT_DOCKER_INSTANCES_DAY=0
MAX_CONCURRENT_DOCKER_INSTANCES_NIGHT=3
WAIT_LOG_INTERVAL_SECONDS=600
WAIT_CHECK_INTERVAL_SECONDS=30
ENV

[ -f "$CONVERTER/log" ] && sudo cp -p "$CONVERTER/log" "$CONVERTER.new/log"
sudo rm -rf "$CONVERTER" "$API"
sudo mv "$CONVERTER.new" "$CONVERTER"
sudo mv "$API.new" "$API"
sudo touch "$CONVERTER/log"
sudo chown -R bigbluebutton:bigbluebutton "$CONVERTER" "$API"
rm -rf /tmp/tcz-mp4

sudo mkdir -p "$MP4_DIR"
sudo chown bigbluebutton:bigbluebutton "$MP4_DIR"

sudo docker pull -q manishkatyan/bbb-mp4

sudo mkdir -p /etc/bbb-mp4-api /var/lib/bbb-mp4-api
sudo chown bigbluebutton:bigbluebutton /var/lib/bbb-mp4-api
if [ ! -f /etc/bbb-mp4-api/env ]; then
  SECRET=$(openssl rand -hex 32)
  sudo tee /etc/bbb-mp4-api/env >/dev/null <<ENV
API_SECRET=$SECRET
MP4_DIR=$MP4_DIR
BBB_MP4_SCRIPT=$CONVERTER/bbb-mp4.sh
QUEUE_FILE=/var/lib/bbb-mp4-api/queue.json
ENV
  sudo chmod 600 /etc/bbb-mp4-api/env
  sudo chown bigbluebutton:bigbluebutton /etc/bbb-mp4-api/env
  echo "generated /etc/bbb-mp4-api/env - API_SECRET stays on the box; read it there when wiring the app"
else
  sudo sed -i "s|^MP4_DIR=.*|MP4_DIR=$MP4_DIR|; s|^BBB_MP4_SCRIPT=.*|BBB_MP4_SCRIPT=$CONVERTER/bbb-mp4.sh|" /etc/bbb-mp4-api/env
fi

cd "$API"
sudo -u bigbluebutton env HOME=/var/lib/bbb-mp4-api npm install --omit=dev --no-audit --no-fund

sudo ln -sf "$API/bbb-mp4-api.service" /etc/systemd/system/bbb-mp4-api.service
sudo ln -sf "$API/bbb-mp4-api.nginx" /usr/share/bigbluebutton/nginx/bbb-mp4-api.nginx
sudo systemctl daemon-reload
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable -q bbb-mp4-api
sudo systemctl restart bbb-mp4-api

sleep 2
curl -sf http://127.0.0.1:8479/health && echo
REMOTE

echo "mp4 stack installed on $HOST_KEY ($BBB_HOST)"
