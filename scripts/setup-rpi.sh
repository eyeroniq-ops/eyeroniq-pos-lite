#!/bin/bash

# Eyeroniq POS - Raspberry Pi Hotspot & Captive Portal Setup
# Run this script on a fresh Raspberry Pi OS Lite (64-bit) installation.
# WARNING: This will overwrite network configurations!

set -e

echo ">>> Updating system..."
sudo apt update && sudo apt upgrade -y

echo ">>> Installing dependencies..."
sudo apt install -y hostapd dnsmasq nginx nodejs npm git

echo ">>> Configuring Network Manager (dhcpcd)..."
# Stop interference from other network managers if any
sudo systemctl stop systemd-networkd
sudo systemctl disable systemd-networkd

# Define static IP for wlan0
cat <<EOF | sudo tee -a /etc/dhcpcd.conf
interface wlan0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
EOF

sudo service dhcpcd restart

echo ">>> Configuring DNSMasq (DHCP & DNS)..."
# Backup original config
sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig

# Create new config
# address=/#/192.168.4.1 -> Responds to ALL DNS queries with the Pi's IP (Captive Portal Magic)
cat <<EOF | sudo tee /etc/dnsmasq.conf
interface=wlan0
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
domain=wlan
address=/#/192.168.4.1
EOF

sudo systemctl restart dnsmasq

echo ">>> Configuring HostAPD (Access Point)..."
cat <<EOF | sudo tee /etc/hostapd/hostapd.conf
interface=wlan0
driver=nl80211
ssid=eyeroniq PoS Lite
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
EOF

# Point daemon to config
sudo sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' /etc/default/hostapd

sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl start hostapd

echo ">>> Configuring Nginx (Reverse Proxy & Captive Portal)..."
# Configure Nginx to catch all traffic and forward to Next.js (port 3000)
# Also handle Apple Captive Portal checks specifically if needed, but the DNS wildcard usually handles it.
cat <<EOF | sudo tee /etc/nginx/sites-available/eyeroniq
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    # Catch-all server name
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Optional: Fix for Apple Captive Portal detection
    location /hotspot-detect.html {
        return 302 http://192.168.4.1/;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/eyeroniq /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ">>> Setup Complete!"
echo "1. Deploy the Next.js app to /var/www/eyeroniq-pos"
echo "2. Run 'npm install' & 'npm run build'"
echo "3. Start with 'npm start' (use PM2 for production persistence)"
echo "   Connect to SSID: Eyeroniq_POS"
