#!/bin/bash

DEV_SH="$HOME/bigbluebutton/bigbluebutton-html5/run-dev.sh"
PROD_SH="$HOME/bigbluebutton/bigbluebutton-html5/run-prod.sh"

prod() {
	if [ -f "$PROD_SH" ]; then
		$PROD_SH
		sudo bbb-conf --restart
	else
		echo "PROD_SH not found: $PROD_SH"
	fi
	exit 0
}

dev() {
	if [ -f "$DEV_SH" ]; then
		$DEV_SH
	else
		echo "DEV_SH not found: $DEV_SH"
	fi
}

dev
prod
