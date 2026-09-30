# TCZ BigBlueButton fork - Claude Context

The Code Zone's fork of BigBlueButton, forked from upstream **v3.0.x-release in June 2025** (BBB 3.0.8, merge-base `9bb82cd405`, 2025-06-12). It runs club video calls for the live site at **bigbluebutton.thecode.zone** — one Azure VM (`ssh bbb`, Ubuntu 22.04, hostname TheCodeZone-BigBlueButton) serving production directly. There is currently no stage box; treat anything that touches the box as touching prod.

Fuller operational docs (box layout, `tcz` CLI, provisioning a stage box, upstream catch-up plan) live in the main repo: `thecodezone/Docs/claude/bigbluebutton.md`.

## What is customized

**Only `bigbluebutton-html5` (the client) differs from upstream.** Every server-side component on the box (bbb-web, akka-apps, freeswitch, webrtc-sfu, …) is stock BBB 3.0.8 from apt. Our ~134 commits are UI/UX for kids' clubs: tiny-iframe layout (`isMicro()`), navbar/sidebar hiding, safeguarding camera rules, deafen support, flip-view button, branding. Config customizations live on the box in `/etc/bigbluebutton/`, not in git.

## Branches

- `v3.0.x-release` — our production branch (upstream branch name kept so upstream can be merged in).
- `unstable` — staging branch for features being tried on the live box; historically deployed directly.
- Feature branches (`service_only`, `individual-volume-test`, …) — experiments.

## Build and deploy

The client builds anywhere with node 22.16.0 — it does not need a BBB server to build.

- `scripts/tcz/build-html5.sh` — canonical build (npm ci, safari + default webpack builds, safari bundle-hash rename). CI runs exactly this.
- `.github/workflows/tcz-html5-build.yml` — builds on every push to `v3.0.x-release`/`unstable` touching the client; uploads `html5-client-<sha>` artifact (90-day retention).
- `scripts/tcz/deploy-html5.sh <ssh-host> <git-ref>` — run from a workstation, never on the box: downloads the CI artifact for that ref, copies it over `/usr/share/bigbluebutton/html5-client/`, points nginx at the static client config, reloads nginx, appends to `/etc/bigbluebutton/tcz-html5-deploys`. Rollback = deploy the previous good ref.

Legacy path (avoid): `tcz bbb pull <branch>` + `tcz bbb deploy html5` on the box builds in `/mnt/raw/bigbluebutton/dev/bigbluebutton` and copies to the same place. Old notes referencing `~/update_dev.sh`, `~/deploy_html5.sh`, `~/try_dev.sh` are outdated — those scripts no longer exist.

Deploys never delete old bundles from `html5-client/` — in-flight sessions still lazy-load chunks from the previously deployed bundle hash. That is deliberate; it is also why the directory grows (~4.3G as of Sep 2026).

## Upstream

Upstream `v3.0.x-release` continues past us (3.0.37+ with security fixes; 4.0 in RC). Catch-up strategy: merge upstream `v3.0.x-release` into ours (client-only conflicts), apt-upgrade the server packages on a **stage box first**, never in place on prod.
