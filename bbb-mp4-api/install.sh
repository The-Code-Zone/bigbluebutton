#!/usr/bin/env bash
# Install or redeploy bbb-mp4-api on the BBB box.
# Safe to re-run. Only generates a secret on first install.
set -euo pipefail

REPO_DIR="/opt/bbb-microservices"
API_DIR="$REPO_DIR/bbb-mp4-api"
ETC_DIR="/etc/bbb-mp4-api"
ENV_FILE="$ETC_DIR/env"

sudo mkdir -p "$ETC_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "Generating config at $ENV_FILE"
  SECRET=$(openssl rand -hex 32)
  sudo tee "$ENV_FILE" >/dev/null <<EOF
API_SECRET=$SECRET
MP4_DIR=/mnt/raw/bbb/recording/mp4
BBB_MP4_SCRIPT=/mnt/raw/bbb-mp4/bbb-mp4.sh
EOF
  sudo chmod 600 "$ENV_FILE"
  sudo chown bigbluebutton:bigbluebutton "$ENV_FILE"
  echo
  echo "Generated API_SECRET: $SECRET"
  echo "Paste into TCZ Settings.BigBlueButton.OnDemandApiSecret."
  echo
fi

echo "Installing npm deps"
cd "$API_DIR"
sudo -u bigbluebutton npm install --omit=dev

echo "Linking systemd unit + nginx config"
sudo ln -sf "$API_DIR/bbb-mp4-api.service" /etc/systemd/system/bbb-mp4-api.service
sudo ln -sf "$API_DIR/bbb-mp4-api.nginx" /usr/share/bigbluebutton/nginx/bbb-mp4-api.nginx

echo "Reloading systemd + nginx"
sudo systemctl daemon-reload
sudo nginx -t
sudo nginx -s reload

echo "Enabling + restarting service"
sudo systemctl enable bbb-mp4-api
sudo systemctl restart bbb-mp4-api

echo
echo "Done. Service status:"
sudo systemctl status bbb-mp4-api --no-pager -l | head -10
