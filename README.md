# bbb-microservices

Microservices built on top of BBB.

Each service folder contains an `install.sh` script for installation/updating. For services with a secret, a secret will be generated if an `.env` file isn't already present.

Currently deployed to `/srv/bbb-microservices` on the box.

## Services

- `bbb-mp4` converts a published recording into a single `.mp4` file on-demand or post-publish.
- `bbb-mp4-api/` is the API which controls `bbb-mp4`.
  - `POST /convert/:recordId` to request MP4 conversion of a recording.
  - `GET /statuses?ids=a,b,c` to get conversion status (`None` / `Queued` / `Converting` / `Available`).
