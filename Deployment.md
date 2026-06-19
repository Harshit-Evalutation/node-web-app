# 🚀 Deployment Guide — OpsCenter Dashboard on AWS EC2

> Full step-by-step guide to deploy the Node.js OpsCenter Dashboard on AWS EC2 with Docker, Nginx, SSL/HTTPS via Certbot, and GitHub Actions CI/CD.

---

## Table of Contents

1. [AWS EC2 Setup](#1-aws-ec2-setup)
2. [Node.js Installation](#2-nodejs-installation)
3. [Docker Installation](#3-docker-installation)
4. [Docker Compose Installation](#4-docker-compose-installation)
5. [Application Deployment](#5-application-deployment)
6. [Nginx Reverse Proxy](#6-nginx-reverse-proxy)
7. [DNS Configuration](#7-dns-configuration)
8. [Certbot SSL Setup](#8-certbot-ssl-setup)
9. [HTTPS Verification](#9-https-verification)
10. [Certificate Renewal](#10-certificate-renewal)
11. [Verification Checklist](#11-verification-checklist)
12. [Troubleshooting Guide](#12-troubleshooting-guide)

---

## 1. AWS EC2 Setup

### 1.1 Launch EC2 Instance

1. Log into the **AWS Management Console**
2. Navigate to **EC2 → Instances → Launch Instance**
3. Configure the instance:

| Setting | Value |
|---------|-------|
| **Name** | `opscenter-node-prod` |
| **AMI** | Ubuntu Server 22.04 LTS (HVM) |
| **Instance Type** | `t3.medium` (2 vCPU, 4 GB RAM) |
| **Key Pair** | Create or use existing `.pem` key |
| **Storage** | 20 GB gp3 SSD |

### 1.2 Configure Security Group

Create a security group named `opscenter-sg` with the following inbound rules:

| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| SSH | TCP | 22 | Your IP | Admin access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP + Certbot validation |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure traffic |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Direct app access (optional) |

### 1.3 Allocate Elastic IP

```bash
# In AWS Console: EC2 → Elastic IPs → Allocate
# Then associate with your instance for a static public IP
```

### 1.4 Connect to EC2

```bash
# Set permissions on key file
chmod 400 your-key.pem

# SSH into instance
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### 1.5 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates
```

---

## 2. Node.js Installation

> **Note**: Node.js is installed inside the Docker container via the Dockerfile. However, the host system also benefits from having Node.js for local testing and npm operations.

```bash
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version   # Should output: v20.x.x
npm --version    # Should output: 10.x.x

# Verify Node.js is the correct version
node -e "console.log('Node.js', process.version, 'running on', process.platform)"
```

---

## 3. Docker Installation

```bash
# Remove any old Docker versions
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install Docker using the official script
curl -fsSL https://get.docker.com | sudo sh

# Add ubuntu user to the docker group (avoid sudo for docker commands)
sudo usermod -aG docker ubuntu

# Apply group membership without logging out
newgrp docker

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Verify Docker installation
docker --version        # Docker version 24.x.x
docker info             # Should show server details
docker run hello-world  # Test container pull and run
```

---

## 4. Docker Compose Installation

Docker Compose v2 is bundled with Docker Engine. Verify it's available:

```bash
# Verify Docker Compose v2 (plugin)
docker compose version
# Output: Docker Compose version v2.x.x

# If not available, install the plugin manually
sudo apt install -y docker-compose-plugin

# Alternative: install as standalone binary
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

---

## 5. Application Deployment

### 5.1 Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/node-web-app.git
cd node-web-app
```

### 5.2 Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit with production values
nano .env
```

Minimum required `.env` values:

```env
NODE_ENV=production
PORT=3000
APP_NAME=OpsCenter Dashboard
APP_VERSION=1.0.0
SESSION_SECRET=<generate-a-64-char-random-string>
API_KEY=<generate-a-secure-api-key>
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Generate a secure `SESSION_SECRET`:

```bash
openssl rand -base64 64
```

### 5.3 Deploy with Docker Compose

```bash
# Build and start the application container
docker compose up -d

# Verify the container is running and healthy
docker compose ps

# Check application logs
docker compose logs -f app

# Test the application responds
curl http://localhost:3000/health
```

Expected health response:
```json
{
  "status": "healthy",
  "application": "DevOps Command Center",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## 6. Nginx Reverse Proxy

### 6.1 Install Nginx

```bash
sudo apt install -y nginx

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

### 6.2 Configure Nginx Virtual Host

Create the Nginx server block:

```bash
sudo nano /etc/nginx/sites-available/node-app
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name node-app.tryagentikai.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Proxy to Node.js container
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check endpoint - direct pass
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }
}
```

### 6.3 Enable the Configuration

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/node-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 7. DNS Configuration

### 7.1 Get Your EC2 Public IP

```bash
# From EC2 terminal
curl -s http://169.254.169.254/latest/meta-data/public-ipv4

# Or check AWS Console: EC2 → Instances → Public IPv4 address
```

### 7.2 Add DNS A Record

In your domain registrar or DNS provider (e.g., Namecheap, Route 53, Cloudflare):

| Type | Host/Name | Value | TTL |
|------|-----------|-------|-----|
| A | `node-app` | `<EC2-PUBLIC-IP>` | 300 |

> For `node-app.tryagentikai.com`, add an **A record** with:
> - **Host**: `node-app`
> - **Value**: your EC2 Elastic IP
> - **TTL**: 300 (5 minutes)

### 7.3 Verify DNS Propagation

```bash
# Check from EC2
nslookup node-app.tryagentikai.com

# Check with dig
dig node-app.tryagentikai.com +short

# Check global propagation (repeat until consistent)
curl -s https://dns.google/resolve?name=node-app.tryagentikai.com | python3 -m json.tool

# Test HTTP before SSL
curl -v http://node-app.tryagentikai.com
```

> ⚠️ DNS propagation can take 5 minutes to 48 hours. Wait until `nslookup` returns your EC2 IP before proceeding.

---

## 8. Certbot SSL Setup

### 8.1 Install Certbot

```bash
# Install Certbot with Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

### 8.2 Obtain SSL Certificate

```bash
# Run Certbot with the Nginx plugin
sudo certbot --nginx -d node-app.tryagentikai.com

# Follow prompts:
# - Enter your email address (for renewal notifications)
# - Agree to Terms of Service: Y
# - Optionally share email with EFF: Y/N
# - Choose redirect option: 2 (Redirect HTTP → HTTPS)
```

Certbot will:
1. Verify domain ownership via HTTP challenge (port 80)
2. Download the SSL certificate from Let's Encrypt
3. Configure Nginx with SSL settings automatically
4. Set up HTTP → HTTPS redirect

### 8.3 Verify Certificate

```bash
# Check certificates stored
sudo certbot certificates

# Expected output:
# Certificate Name: node-app.tryagentikai.com
# Domains: node-app.tryagentikai.com
# Expiry Date: YYYY-MM-DD (VALID: XX days)
# Certificate Path: /etc/letsencrypt/live/node-app.tryagentikai.com/fullchain.pem
# Private Key Path: /etc/letsencrypt/live/node-app.tryagentikai.com/privkey.pem
```

---

## 9. HTTPS Verification

```bash
# 1. Test HTTPS connection
curl -I https://node-app.tryagentikai.com
# Expect: HTTP/2 200 or HTTP/1.1 200 OK

# 2. Verify SSL certificate details
echo | openssl s_client -connect node-app.tryagentikai.com:443 -servername node-app.tryagentikai.com 2>/dev/null \
  | openssl x509 -noout -issuer -subject -dates

# 3. Check HTTP → HTTPS redirect
curl -I http://node-app.tryagentikai.com
# Expect: 301 Moved Permanently → https://

# 4. Test application health over HTTPS
curl https://node-app.tryagentikai.com/health

# 5. Test SSL with verbose output
curl -v https://node-app.tryagentikai.com 2>&1 | grep -E "SSL|TLS|certificate|HTTP"

# 6. Check Nginx SSL configuration
sudo nginx -t && sudo systemctl status nginx
```

---

## 10. Certificate Renewal

Let's Encrypt certificates expire every 90 days. Certbot sets up automatic renewal.

### 10.1 Verify Auto-Renewal Timer

```bash
# Check systemd timer
sudo systemctl status certbot.timer
sudo systemctl list-timers | grep certbot

# Check cron job (if using cron instead of systemd)
sudo crontab -l | grep certbot
```

### 10.2 Test Renewal (Dry Run)

```bash
# Simulate renewal without actually renewing
sudo certbot renew --dry-run

# Expected output: "Congratulations, all simulated renewals succeeded"
```

### 10.3 Manual Renewal (If Needed)

```bash
# Force certificate renewal
sudo certbot renew --force-renewal

# Reload Nginx after renewal
sudo systemctl reload nginx
```

### 10.4 Set Up Renewal Hook

```bash
# Create a renewal hook to reload Nginx after renewal
sudo nano /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

```bash
#!/bin/bash
systemctl reload nginx
```

```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

---

## 11. Verification Checklist

Run all verification checks after deployment:

```bash
echo "=== OpsCenter Deployment Verification ==="

echo ""
echo "1. Docker Container Status:"
docker compose ps

echo ""
echo "2. Application Health:"
curl -s https://node-app.tryagentikai.com/health | python3 -m json.tool

echo ""
echo "3. SSL Certificate:"
sudo certbot certificates

echo ""
echo "4. HTTPS Response:"
curl -I https://node-app.tryagentikai.com 2>&1 | head -5

echo ""
echo "5. HTTP → HTTPS Redirect:"
curl -I http://node-app.tryagentikai.com 2>&1 | head -5

echo ""
echo "6. DNS Resolution:"
nslookup node-app.tryagentikai.com

echo ""
echo "7. Nginx Status:"
sudo systemctl status nginx --no-pager | head -10

echo ""
echo "8. Certificate Renewal Dry Run:"
sudo certbot renew --dry-run 2>&1 | tail -3

echo ""
echo "=== Verification Complete ==="
```

### Expected Results

| Check | Expected |
|-------|----------|
| `docker compose ps` | Container status = `Up (healthy)` |
| `/health` response | `{"status": "healthy"}` |
| HTTPS curl | `HTTP/2 200` |
| HTTP curl | `301 Moved Permanently` |
| `nslookup` | Returns EC2 public IP |
| `nginx status` | `active (running)` |
| Certbot dry-run | `All simulated renewals succeeded` |

---

## 12. Troubleshooting Guide

### Issue: 502 Bad Gateway

```bash
# Check if Node.js container is running
docker compose ps
docker compose logs app --tail=50

# Restart the application
docker compose restart app

# Check Nginx upstream configuration
sudo cat /etc/nginx/sites-enabled/node-app | grep proxy_pass

# Verify port 3000 is listening
ss -tlnp | grep :3000
curl http://localhost:3000/health
```

### Issue: 404 Not Found on Domain

```bash
# Check Nginx config server_name matches domain
sudo nginx -T | grep server_name

# Check DNS resolves correctly
nslookup node-app.tryagentikai.com

# Check Nginx is using the correct config
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: Certificate Already Exists Error

```bash
# View existing certificates
sudo certbot certificates

# Delete stale certificate and re-issue
sudo certbot delete --cert-name node-app.tryagentikai.com
sudo certbot --nginx -d node-app.tryagentikai.com
```

### Issue: Docker Compose Up Fails

```bash
# Check for port conflicts
sudo lsof -i :3000
sudo lsof -i :80

# View Docker build errors
docker compose build --no-cache
docker compose up 2>&1 | head -50

# Check .env file exists and has SESSION_SECRET
cat .env | grep SESSION_SECRET
```

### Issue: Nginx Permission Denied

```bash
# Check Nginx error log
sudo tail -50 /var/log/nginx/error.log

# Check SELinux/AppArmor (usually not an issue on Ubuntu)
sudo aa-status

# Reset Nginx config
sudo nginx -t
sudo systemctl restart nginx
```

### Issue: Container Keeps Restarting

```bash
# Check container logs for crash reason
docker logs devops-command-center --tail=100

# Common causes:
# - Missing SESSION_SECRET in .env
# - Port already in use
# - Out of memory

# Check memory
free -h
docker stats --no-stream
```

---

*Last Updated: June 2025 | OpsCenter Dashboard v1.0.0*
