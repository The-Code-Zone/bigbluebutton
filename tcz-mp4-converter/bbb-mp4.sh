#!/bin/bash

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

reload_env() {
	set -a
	source <(cat "$BASE_DIR/.env" | \
    		sed -e '/^#/d;/^\s*$/d' -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
	set +a
}

log() {
        local timestamp
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        echo "[$timestamp] $1" | tee -a "$LOG_FILE" | systemd-cat -p "${2:-info}" -t bbb-mp4
}

reload_env
MEETING_ID=$1

# run this in a separate sub-shell
# this is somewhat flimsy and should ideally rely on an
# auto restarting service, but ultimately we rarely need
# to download an MP4 and if we happen to miss one we can
# manually process it.
(
	log "adding $MEETING_ID to queue" warning

	WAIT_LOG_COUNTER=0

	while true; do
		reload_env

		CURRENT_HOUR=$(date +%H)

		if [ "$CURRENT_HOUR" -ge "$DAY_START_HOUR" ] && [ "$CURRENT_HOUR" -lt "$DAY_END_HOUR" ]; then
			MAX_CONCURRENT_DOCKER_INSTANCES="$MAX_CONCURRENT_DOCKER_INSTANCES_DAY"
		else
			MAX_CONCURRENT_DOCKER_INSTANCES="$MAX_CONCURRENT_DOCKER_INSTANCES_NIGHT"
		fi

		RUNNING_CONTAINERS=$(docker ps --filter "ancestor=manishkatyan/bbb-mp4" --format '{{.ID}}' | wc -l)

		if [ "$RUNNING_CONTAINERS" -lt "$MAX_CONCURRENT_DOCKER_INSTANCES" ]; then
			break
		fi

		if (( WAIT_LOG_COUNTER % (WAIT_LOG_INTERVAL_SECONDS / WAIT_CHECK_INTERVAL_SECONDS) == 0 )); then
			log "$MEETING_ID waiting for empty thread (running: $RUNNING_CONTAINERS, limit: $MAX_CONCURRENT_DOCKER_INSTANCES)" warning
		fi

		sleep "$WAIT_CHECK_INTERVAL_SECONDS"
		((WAIT_LOG_COUNTER++))
	done

	log "starting container for $MEETING_ID" warning

	docker run --rm -d \
			--name $MEETING_ID \
			-v $COPY_TO_LOCATION:/usr/src/app/processed \
			-v "$BASE_DIR/bbb-mp4.js":/usr/src/app/bbb-mp4.js \
			--env REC_URL=https://$BBB_DOMAIN_NAME/playback/presentation/2.3/$MEETING_ID \
			manishkatyan/bbb-mp4

	log "converting $MEETING_ID to mp4" warning
) >/dev/null 2>&1 &

# exit immediately so rap:publish doesn't hang
exit 0
