# bbb-microservices

Microservices built on top of BBB.

Each service folder contains an `install.sh` script for installation/updating. For services with a secret, a secret will be generated if an `.env` file isn't already present.

Currently deployed to `/opt/bbb-microservices` on the box. Per-service config lives at `/etc/<service>/env`.

## Services

- `bbb-mp4` converts a published recording into a single `.mp4` file on-demand or post-publish.
- `bbb-mp4-api/` is the API which controls `bbb-mp4`.
  - `GET /health` for liveness, uptime, version, queue size. Unauthenticated.
  - `GET /queue` to list every tracked record ID with its current status.
  - `GET /statuses?ids=a,b,c` to get conversion status (`None` / `Queued` / `Converting` / `Available`).
  - `POST /convert/:recordId` to request MP4 conversion of a recording.
  - `DELETE /convert/:recordId` to cancel a queued conversion. `?force=true` aborts an in-progress one.
- `cli/` contains the `tcz` CLI tool for managing these services and BBB itself.
  - `tcz <service> <command>`
  - Run `tcz` for usage text.
