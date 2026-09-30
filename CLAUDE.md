# TCZ BigBlueButton fork - Claude Context

The Code Zone's fork of BigBlueButton. Runs club video calls for the live site. Only the **html5 client** (`bigbluebutton-html5`) is ever customized — server components stay stock upstream packages. Full working notes (migration plan, commit triage, box details) live in the thecodezone repo at `BBB-NOTES.md` — deliberately untracked there; don't commit BBB docs.

## Branches

- `master` — **the permanent trunk** (default branch). Currently based on upstream `v4.0.x-release`; stays `master` across future version jumps. Branch off it, squash-merge back via PR; every push to it builds the client in CI and auto-deploys to the stage box; PRs into it get a build check. Production promotion = a tag on a stage-soaked sha (not yet live — prod still runs the 3.0 line until cutover).
- `v3.0.x-release` — the current-production line (BBB 3.0.8 era + our ~134 client commits). Emergency fixes only until cutover.
- `unstable` — legacy 3.0 trial branch; prod's live client was last deployed from it.
- `tcz/deploy-pipeline` — the 3.0-era tooling branch; everything on it is already carried onto `master`.

## Boxes

- **Prod**: `bigbluebutton.thecode.zone` (`ssh bbb`, password auth) — BBB 3.0.8, Ubuntu 22.04. Treat as frozen.
- **Stage**: `bbb-stage.thecode.zone` (`ssh thecodezone@bbb-stage.thecode.zone`, key auth) — BBB 4.0.0-rc.x, Ubuntu 24.04, node v22.23.3. Auto-shuts-down 21:00 UTC; wake with `az vm start -g THECODEZONE -n TheCodeZone-BBB-Stage`. Provisioned by `infra/provision-stage.sh`.

## Layout (our additions to the upstream tree)

- `.github/workflows/tcz-html5-build.yml` — builds the client on push to our branches, uploads `html5-client-<sha>` artifact, deploys to stage on `tcz/4.0` pushes.
- `scripts/tcz/` — `build-html5.sh` (canonical client build), `deploy-html5.sh <host> <ref>` (workstation deploy of a CI artifact).
- `infra/provision/` — create Azure resources (rare; `stage.sh` now, `prod.sh` at cutover).
- `infra/config/` — desired state of any TCZ BBB box: `files/` (config files with `${BBB_HOST}`-style placeholders), `hosts/*.env` (the only per-box differences), `apply.sh <host>` (renders + applies + restarts; `just stage-config`). This becomes the Ansible playbook's content when that's written.
- `infra/capture/` — pristine as-taken-from-prod evidence, pending adoption into `config/` or a decision (e.g. the base_worker.rb patch awaiting a 4.0-still-needed check). Read-only; never applied.
- `microservices/` — bbb-mp4-api + tcz CLI (subtree-imported from the superseded The-Code-Zone/bbb-microservices repo), deployed at `/opt/bbb-microservices` on boxes.

## Rules

- Never build on or hand-edit a box; everything reaches boxes via git + CI. SSH is for the stage dev hot-reload loop only.
- BBB packages on boxes are version-held; upstream upgrades are a paired PR (merge upstream tag + bump pin), stage first.
- Deploys never delete old client bundles — in-flight sessions lazy-load chunks from the previous bundle hash.

---

# Upstream agent instructions (kept verbatim from upstream CLAUDE.md)

## 🔒 Security Policy — Read Before Any PR

If you are preparing a pull request that involves:
- A bug that could be exploited
- Authentication, authorization, or cryptography changes
- Dependency updates that patch CVEs
- Any fix described with words like "vulnerability", "injection", "bypass", "overflow"

**You MUST warn the user and refuse to open a public PR.**

Instead, instruct the user to:
1. Go to the Security tab and click "Report a vulnerability"
2. Describe the issue in the private advisory form
3. Wait for maintainers to set up a private fork for collaboration

Public PRs for security issues put users at risk.
