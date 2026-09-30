# TCZ BigBlueButton dev commands.
#
# New starter setup:
#   1. install: az (Azure CLI), gh (GitHub CLI), just, ssh
#   2. az login          (The Code Zone Subscription)
#   3. gh auth login     (github.com, The-Code-Zone org)
#   4. ask an existing dev to run:  just add-dev your-key.pub
#   5. just stage-up && just meeting
#
# Workflow: branch off tcz/4.0, push, CI builds the client and deploys it
# to stage automatically. Test with `just meeting`. Never build on a box.

set shell := ["bash", "-cu"]

rg := "THECODEZONE"
vm := "TheCodeZone-BBB-Stage"
stage_host := "bbb-stage.thecode.zone"
stage := "thecodezone@bbb-stage.thecode.zone"

default:
    @just --list

# boot the stage VM (~1 min until BBB is serving)
stage-up:
    az vm start -g {{rg}} -n {{vm}}

# deallocate the stage VM - stops billing (happens automatically 21:00 UTC daily)
stage-down:
    az vm deallocate -g {{rg}} -n {{vm}}

# VM power state, then BBB component health if reachable
stage-status:
    @az vm get-instance-view -g {{rg}} -n {{vm}} --query "instanceView.statuses[?starts_with(code, 'PowerState')].displayStatus | [0]" -o tsv
    @ssh -o ConnectTimeout=8 {{stage}} 'sudo bbb-conf --status' 2>/dev/null || echo "(box unreachable - just stage-up)"

# shell on the stage box
stage-ssh:
    ssh {{stage}}

# create a meeting on stage, print a moderator join link
meeting name="Dev Test":
    #!/usr/bin/env bash
    set -euo pipefail
    SECRET=$(ssh {{stage}} 'sudo bbb-conf --secret 2>/dev/null' | grep -oP 'Secret: \K\S+')
    ID="dev-$RANDOM"
    Q="name=$(echo '{{name}}' | sed 's/ /+/g')&meetingID=$ID&record=false&meetingExpireIfNoUserJoinedInMinutes=180"
    C=$(printf 'create%s%s' "$Q" "$SECRET" | sha256sum | cut -d' ' -f1)
    curl -sf "https://{{stage_host}}/bigbluebutton/api/create?$Q&checksum=$C" >/dev/null
    JQ="fullName=$USER&meetingID=$ID&role=MODERATOR&redirect=true"
    JC=$(printf 'join%s%s' "$JQ" "$SECRET" | sha256sum | cut -d' ' -f1)
    echo "https://{{stage_host}}/bigbluebutton/api/join?$JQ&checksum=$JC"

# like `meeting`, but with the production club lockdown (disabledFeatures) applied
club-meeting name="Club Test":
    #!/usr/bin/env bash
    set -euo pipefail
    SECRET=$(ssh {{stage}} 'sudo bbb-conf --secret 2>/dev/null' | grep -oP 'Secret: \K\S+')
    ID="club-$RANDOM"
    DF="breakoutRooms%2Cchat%2CprivateChat%2Cpolls%2CsharedNotes%2Ctimer%2CinfiniteWhiteboard%2Cpresentation%2CexternalVideos"
    Q="name=$(echo '{{name}}' | sed 's/ /+/g')&meetingID=$ID&record=false&meetingExpireIfNoUserJoinedInMinutes=180&disabledFeatures=$DF"
    C=$(printf 'create%s%s' "$Q" "$SECRET" | sha256sum | cut -d' ' -f1)
    curl -sf "https://{{stage_host}}/bigbluebutton/api/create?$Q&checksum=$C" >/dev/null
    JQ="fullName=$USER&meetingID=$ID&role=MODERATOR&redirect=true"
    JC=$(printf 'join%s%s' "$JQ" "$SECRET" | sha256sum | cut -d' ' -f1)
    echo "https://{{stage_host}}/bigbluebutton/api/join?$JQ&checksum=$JC"

# what CI has deployed to stage (newest last)
stage-deploys:
    @ssh {{stage}} 'tail -5 /etc/bigbluebutton/tcz-html5-deploys 2>/dev/null'

# recent CI builds/deploys
runs:
    gh run list -R The-Code-Zone/bigbluebutton --workflow tcz-html5-build.yml --limit 5

# build the client locally (rarely needed - CI builds on every push)
build:
    bash scripts/tcz/build-html5.sh

# grant a dev SSH access to stage: just add-dev path/to/their-key.pub
add-dev pubkey:
    ssh {{stage}} "echo '$(cat {{pubkey}})' >> ~/.ssh/authorized_keys && echo access granted"
