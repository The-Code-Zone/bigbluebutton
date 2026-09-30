#!/usr/bin/env bash
set -euo pipefail

RG="THECODEZONE"
DNS_RG="TheCodeZone"
NAME="TheCodeZone-BBB-Stage"
LOCATION="uksouth"
SIZE="Standard_D4s_v3"
IMAGE="Canonical:ubuntu-24_04-lts:server:latest"
DISK_GB=128
ADMIN_USER="thecodezone"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519.pub}"
ZONE="thecode.zone"
SUBDOMAIN="bbb-stage"
SHUTDOWN_TIME_UTC="2100"

az vm create \
  --resource-group "$RG" \
  --name "$NAME" \
  --location "$LOCATION" \
  --image "$IMAGE" \
  --size "$SIZE" \
  --os-disk-size-gb "$DISK_GB" \
  --storage-sku StandardSSD_LRS \
  --admin-username "$ADMIN_USER" \
  --ssh-key-values "$SSH_KEY" \
  --vnet-name TheCodeZone \
  --subnet default \
  --public-ip-sku Standard \
  --public-ip-address-allocation static \
  --output table

az vm open-port --resource-group "$RG" --name "$NAME" --port 80,443 --priority 900 --output none
az vm open-port --resource-group "$RG" --name "$NAME" --port 16384-32768 --priority 901 --output none

az vm auto-shutdown --resource-group "$RG" --name "$NAME" --time "$SHUTDOWN_TIME_UTC" --output none

IP=$(az vm show -d --resource-group "$RG" --name "$NAME" --query publicIps -o tsv)

az network dns record-set a add-record \
  --resource-group "$DNS_RG" \
  --zone-name "$ZONE" \
  --record-set-name "$SUBDOMAIN" \
  --ipv4-address "$IP" \
  --output none

echo
echo "$NAME: $IP"
echo "$SUBDOMAIN.$ZONE -> $IP"
echo "auto-shutdown: $SHUTDOWN_TIME_UTC UTC daily"
echo
echo "install BBB 4.0 with:"
echo "  ssh $ADMIN_USER@$SUBDOMAIN.$ZONE"
echo "  wget -qO- https://raw.githubusercontent.com/bigbluebutton/bbb-install/v4.0.x-release/bbb-install.sh | bash -s -- -w -v noble-400 -s $SUBDOMAIN.$ZONE -e lewis@thecodezone.co.uk"
