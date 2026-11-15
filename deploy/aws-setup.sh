#!/bin/bash
# First-boot setup for a plain Amazon Linux 2023 EC2 instance (run as root from user data).
# Serves the site on ports 80/443. Needs no secrets: the app only reads public data.
# Updating later: push to the branch, then reboot the instance (the service pulls on start).
set -eux
APP=/opt/spherex-blink
# Optional: your own address, e.g. DOMAIN=skyrevisit.example.com. Point its DNS A record
# at this instance's Elastic IP first; Caddy then fetches the HTTPS certificate by itself.
DOMAIN="${DOMAIN:-}"
REPO="${REPO:-https://github.com/kisakosemedya/spherex-blink.git}"
BRANCH="${BRANCH:-main}"

# 1 GB machines need swap for the image re-projection step
if [ ! -f /swapfile ]; then
  dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

dnf install -y git python3 python3-pip
[ -d "$APP/.git" ] || git clone --branch "$BRANCH" "$REPO" "$APP"
id app >/dev/null 2>&1 || useradd --system --home-dir "$APP" --shell /sbin/nologin app
python3 -m venv /opt/venv
/opt/venv/bin/pip install --no-cache-dir -r "$APP/backend/requirements.txt"
mkdir -p "$APP/cache"
chown -R app:app "$APP"

cat > /etc/systemd/system/spherex-blink.service <<UNIT
[Unit]
Description=SPHEREx Blink (FastAPI)
After=network-online.target
Wants=network-online.target

[Service]
User=app
WorkingDirectory=$APP
ExecStartPre=-/usr/bin/git -C $APP pull --ff-only
ExecStart=/opt/venv/bin/uvicorn backend.app:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

# Caddy: plain HTTP on the IP address, automatic HTTPS on $DOMAIN (or <ip-with-dashes>.sslip.io)
curl -fsSL "https://caddyserver.com/api/download?os=linux&arch=amd64" -o /usr/local/bin/caddy
chmod +x /usr/local/bin/caddy
TOKEN=$(curl -fsS -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 300")
IP=$(curl -fsS -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)
mkdir -p /etc/caddy /var/lib/caddy
cat > /etc/caddy/Caddyfile <<CADDY
http:// {
	reverse_proxy 127.0.0.1:8000
}
${DOMAIN:-${IP//./-}.sslip.io} {
	reverse_proxy 127.0.0.1:8000
}
CADDY

cat > /etc/systemd/system/caddy.service <<UNIT
[Unit]
Description=Caddy reverse proxy
After=network-online.target
Wants=network-online.target

[Service]
Environment=XDG_DATA_HOME=/var/lib/caddy
Environment=XDG_CONFIG_HOME=/var/lib/caddy
ExecStart=/usr/local/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
Restart=always
RestartSec=3
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now spherex-blink caddy
