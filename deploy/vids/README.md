# VIDS demo deploy

Pushing to `tarun/deploy-infraxai-vids` deploys the site to the VIDS server, behind the
Cloudflare Access hostname. Vercel (staging/prod) is separate and does not use these files.

## Flow
1. Push to `tarun/deploy-infraxai-vids` → GitHub Actions `deploy-vids` builds the image
   (tests + `next build`) and smoke-tests it.
2. On VIDS, `infrax-site-deploy.timer` checks every 2 min for the newest commit that passed.
   It builds that exact commit in a CPU/RAM-capped builder, swaps the container,
   and health-checks it. If the health check fails, it rolls back to the previous release by itself.

`GATE=branch` in `/etc/infrax-site/deploy.conf` makes the agent follow the branch head
instead of passed runs, for when Actions cannot run. The image build still runs the tests, so a
failing commit is never deployed.

VIDS needs no inbound access and holds no GitHub credentials. The agent, compose file and
units are installed on the host once (`install.sh`). Edits here change nothing on VIDS until
they are re-installed.

## Release
Merge or cherry-pick what should go live into the branch and push. Watch the run in Actions;
then on VIDS: `sudo infrax-site-deploy status`, or check the logs with `journalctl -u infrax-site-deploy`.

## Rollback
- Last release: `sudo infrax-site-deploy rollback` (pins it until a newer commit passes).
- Any commit that is still in the branch history: `sudo infrax-site-deploy redeploy <full sha>`.
- Whole host: stop the timer and `docker compose -f /etc/infrax-site/compose.yml down`,
  then point the hostname back at the previous tunnel.

## Secrets (on VIDS only, root 0600)
- `/etc/infrax-site/site.env`: the variables in `.env.example`.
- `/etc/infrax-site/tunnel.env`: `TUNNEL_TOKEN` for the site's Cloudflare tunnel.
