#!/usr/bin/env bash
# One-time install of the deploy agent on VIDS; run as root from this directory.
set -euo pipefail
cd "$(dirname "$0")"
install -d -m 0700 /etc/infrax-site
install -d -m 0755 /var/lib/infrax-site
install -m 0755 infrax-site-deploy /usr/local/sbin/infrax-site-deploy
install -m 0644 compose.yml /etc/infrax-site/compose.yml
install -m 0644 infrax-site-deploy.service infrax-site-deploy.timer /etc/systemd/system/
for f in site.env tunnel.env; do
  [ -e "/etc/infrax-site/$f" ] || install -m 0600 /dev/null "/etc/infrax-site/$f"
done
command -v jq >/dev/null || { echo "jq is required"; exit 1; }
systemctl daemon-reload
echo "Fill /etc/infrax-site/site.env and tunnel.env (TUNNEL_TOKEN=...), then:"
echo "  systemctl enable --now infrax-site-deploy.timer"
