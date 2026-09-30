#!/usr/bin/env bash
# Install or refresh the tcz symlink at /usr/local/bin/tcz.
# Safe to re-run.
set -euo pipefail

REPO_DIR="/opt/bbb-microservices"
TCZ_PATH="$REPO_DIR/cli/tcz"
LINK_PATH="/usr/local/bin/tcz"

if [ ! -x "$TCZ_PATH" ]; then
  echo "Error: $TCZ_PATH missing or not executable. Did you forget to chmod +x?"
  exit 1
fi

sudo ln -sf "$TCZ_PATH" "$LINK_PATH"
echo "Linked $LINK_PATH -> $TCZ_PATH"
