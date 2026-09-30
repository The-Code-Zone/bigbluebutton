#!/usr/bin/env bash
set -euo pipefail

REPO="The-Code-Zone/bigbluebutton"
WORKFLOW="tcz-html5-build.yml"
CLIENT_DIR="/usr/share/bigbluebutton/html5-client"

usage() {
  echo "usage: $0 [--yes] <ssh-host> <git-ref>"
  echo
  echo "Deploys the CI-built html5 client for <git-ref> to <ssh-host>."
  echo "The build must already exist: push the ref and wait for the"
  echo "'TCZ html5 client build' workflow to go green, or run:"
  echo "  gh run list -R $REPO --workflow $WORKFLOW"
  echo
  echo "Rollback is deploying the previous known-good ref."
  exit 1
}

YES=0
if [ "${1:-}" = "--yes" ]; then
  YES=1
  shift
fi
HOST="${1:-}"
REF="${2:-}"
[ -n "$HOST" ] && [ -n "$REF" ] || usage

SHA=$(gh api "repos/$REPO/commits/$REF" -q .sha)
echo "resolved $REF -> $SHA"

RUN_ID=$(gh run list -R "$REPO" --workflow "$WORKFLOW" --commit "$SHA" \
  --status success --limit 1 --json databaseId -q '.[0].databaseId')
if [ -z "$RUN_ID" ]; then
  echo "no successful $WORKFLOW run found for $SHA" >&2
  echo "check: gh run list -R $REPO --workflow $WORKFLOW --commit $SHA" >&2
  exit 1
fi

if [ "$YES" -ne 1 ]; then
  read -r -p "deploy $SHA to $HOST (this replaces the live client)? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || { echo "aborted"; exit 1; }
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
gh run download -R "$REPO" "$RUN_ID" -n "html5-client-$SHA" -D "$TMP"

scp "$TMP/html5-client.tar.gz" "$HOST:/tmp/html5-client-$SHA.tar.gz"

ssh "$HOST" "SHA=$SHA CLIENT_DIR=$CLIENT_DIR bash -s" <<'REMOTE'
set -euo pipefail
STAGE=$(mktemp -d)
tar -xzf "/tmp/html5-client-$SHA.tar.gz" -C "$STAGE"
test -f "$STAGE/index.html"
sudo cp -rf "$STAGE"/. "$CLIENT_DIR"/
sudo ln -sf /usr/share/bigbluebutton/nginx/bbb-html5.nginx.static /usr/share/bigbluebutton/nginx/bbb-html5.nginx
sudo systemctl reload nginx
echo "$(date -u +%FT%TZ) $SHA" | sudo tee -a /etc/bigbluebutton/tcz-html5-deploys >/dev/null
rm -rf "$STAGE" "/tmp/html5-client-$SHA.tar.gz"
REMOTE

echo
echo "deployed $SHA to $HOST"
echo "deploy history on box: /etc/bigbluebutton/tcz-html5-deploys"
