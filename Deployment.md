# Deployment Guide

OpsCenter Dashboard on AWS EC2

This document describes the deployment process for the OpsCenter Dashboard on AWS EC2 using Docker Compose, Nginx as a reverse proxy, Let's Encrypt SSL certificates via Certbot, and GitHub Actions for CI validation.

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

1. Log into the AWS Management Console
2. Navigate to EC2 > Instances > Launch Instance
3. Configure the instance:

| Setting | Value |
|---------|-------|
| Name | `opscenter-node-prod` |
| AMI | Ubuntu Server 22.04 LTS (HVM) |
| Instance Type | `t3.medium` (2 vCPU, 4 GB RAM) |
| Key Pair | Create or use an existing `.pem` key |
| Storage | 20 GB gp3 SSD |

### 1.2 Configure Security Group

Create a security group named `opscenter-sg` with the following inbound rules:

| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| SSH | TCP | 22 | Your IP | Admin access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP and Certbot validation |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure traffic |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Direct app access (optional) |

### 1.3 Allocate Elastic IP

In the AWS Console, navigate to EC2 > Elastic IPs, allocate a new IP, and associate it with the instance. This ensures the public IP remains stable across instance restarts.

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

Node.js runs inside the Docker container via the Dockerfile. Installing it on the host is useful for running `npm` commands directly during setup or troubleshooting.

```bash
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

---

## 3. Docker Installation

```bash
# Remove any old Docker versions
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install Docker using the official install script
curl -fsSL https://get.docker.com | sudo sh

# Add the ubuntu user to the docker group
sudo usermod -aG docker ubuntu

# Apply group membership without logging out
newgrp docker

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Verify Docker installation
docker --version
docker run hello-world
```

---

## 4. Docker Compose Installation

Docker Compose v2 ships as a plugin with Docker Engine. Verify it is available:

```bash
docker compose version
```

If the command is not found, install the plugin manually:

```bash
sudo apt install -y docker-compose-plugin
```

As an alternative, install the standalone binary:

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

---

## 5. Application Deployment

### 5.1 Clone the Repository

```bash
git clone https://github.com/Harshit-Evalutation/node-web-app.git
cd node-web-app
```

### 5.2 Configure Environment Variables

The `.env` file is excluded from version control. It must be created manually on the server before starting the application.

```bash
cp .env.example .env
nano .env
```

Minimum required values:

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
# Build and start the application
docker compose up -d

# Verify the container is running
docker compose ps

# Check application logs
docker compose logs -f app

# Confirm the application responds
curl http://localhost:3000/health
```

Expected response:

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
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6.2 Configure Nginx Virtual Host

Create a server block for the application:

```bash
sudo nano /etc/nginx/sites-available/node-app
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name node-app.tryagentikai.com;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

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

# Remove the default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test the configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 7. DNS Configuration

### 7.1 Get the EC2 Public IP

```bash
curl -s http://169.254.169.254/latest/meta-data/public-ipv4
```

Alternatively, find the IP in the AWS Console under EC2 > Instances > Public IPv4 address.

### 7.2 Add DNS A Record

In your DNS provider's control panel (Namecheap, Route 53, Cloudflare, or similar):

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `node-app` | `<EC2-PUBLIC-IP>` | 300 |

### 7.3 Verify DNS Propagation

DNS changes may take anywhere from a few minutes to several hours to propagate globally.

```bash
nslookup node-app.tryagentikai.com
dig node-app.tryagentikai.com +short
curl -v http://node-app.tryagentikai.com
```

Do not proceed to Certbot until `nslookup` returns the correct EC2 IP.

---

## 8. Certbot SSL Setup

### 8.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
certbot --version
```

### 8.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d node-app.tryagentikai.com
```

Follow the interactive prompts:

- Enter an email address for renewal notifications
- Agree to the Terms of Service
- Select option 2 to redirect HTTP traffic to HTTPS

Certbot will:
1. Verify domain ownership via the HTTP-01 challenge on port 80
2. Download the certificate from Let's Encrypt
3. Update the Nginx configuration with SSL settings
4. Configure HTTP to HTTPS redirection

### 8.3 Verify Certificate

```bash
sudo certbot certificates
```

Expected output:

```
Certificate Name: node-app.tryagentikai.com
Domains: node-app.tryagentikai.com
Expiry Date: YYYY-MM-DD (VALID: XX days)
Certificate Path: /etc/letsencrypt/live/node-app.tryagentikai.com/fullchain.pem
Private Key Path: /etc/letsencrypt/live/node-app.tryagentikai.com/privkey.pem
```

---

## 9. HTTPS Verification

```bash
# Test HTTPS connection
curl -I https://node-app.tryagentikai.com

# Verify SSL certificate details
echo | openssl s_client -connect node-app.tryagentikai.com:443 -servername node-app.tryagentikai.com 2>/dev/null \
  | openssl x509 -noout -issuer -subject -dates

# Check HTTP to HTTPS redirect
curl -I http://node-app.tryagentikai.com

# Test application health over HTTPS
curl https://node-app.tryagentikai.com/health

# Check Nginx configuration
sudo nginx -t && sudo systemctl status nginx
```

Expected results:

| Check | Expected |
|-------|----------|
| `curl -I https://...` | `HTTP/2 200` |
| `curl -I http://...` | `301 Moved Permanently` |
| `/health` response | `{"status": "healthy"}` |

---

## 10. Certificate Renewal

Let's Encrypt certificates are valid for 90 days. Certbot registers a systemd timer that checks renewal status twice daily.

### 10.1 Verify Auto-Renewal Timer

```bash
sudo systemctl status certbot.timer
sudo systemctl list-timers | grep certbot
```

### 10.2 Test Renewal

```bash
sudo certbot renew --dry-run
```

If the dry run succeeds, automatic renewal is configured correctly.

### 10.3 Manual Renewal

```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### 10.4 Post-Renewal Hook

Create a deploy hook to reload Nginx after each renewal:

```bash
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

Run all checks after completing deployment:

```bash
echo "=== OpsCenter Deployment Verification ==="

echo "1. Docker Container Status:"
docker compose ps

echo "2. Application Health:"
curl -s https://node-app.tryagentikai.com/health | python3 -m json.tool

echo "3. SSL Certificate:"
sudo certbot certificates

echo "4. HTTPS Response:"
curl -I https://node-app.tryagentikai.com 2>&1 | head -5

echo "5. HTTP Redirect:"
curl -I http://node-app.tryagentikai.com 2>&1 | head -5

echo "6. DNS Resolution:"
nslookup node-app.tryagentikai.com

echo "7. Nginx Status:"
sudo systemctl status nginx --no-pager | head -10

echo "8. Renewal Dry Run:"
sudo certbot renew --dry-run 2>&1 | tail -3

echo "=== Verification Complete ==="
```

### Expected Results

| Check | Expected |
|-------|----------|
| `docker compose ps` | `Up (healthy)` |
| `/health` response | `{"status": "healthy"}` |
| HTTPS response | `HTTP/2 200` |
| HTTP response | `301 Moved Permanently` |
| `nslookup` | Returns EC2 public IP |
| Nginx status | `active (running)` |
| Certbot dry-run | `All simulated renewals succeeded` |

---

## 12. Troubleshooting Guide

### 502 Bad Gateway

The upstream Node.js container is not responding on port 3000.

```bash
# Check container status
docker compose ps
docker compose logs app --tail=50

# Restart the container
docker compose restart app

# Confirm port 3000 is bound
ss -tlnp | grep :3000
curl http://localhost:3000/health
```

### 404 Not Found on Domain

Nginx is not routing the request to the correct server block.

```bash
# Verify server_name matches the domain
sudo nginx -T | grep server_name

# Check DNS resolves to this server
nslookup node-app.tryagentikai.com

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Certificate Already Exists Error

```bash
sudo certbot certificates
sudo certbot delete --cert-name node-app.tryagentikai.com
sudo certbot --nginx -d node-app.tryagentikai.com
```

### Docker Compose Up Fails

```bash
# Check for port conflicts
sudo lsof -i :3000
sudo lsof -i :80

# Rebuild from scratch
docker compose build --no-cache
docker compose up 2>&1 | head -50

# Verify .env has SESSION_SECRET
grep SESSION_SECRET .env
```

### Nginx Permission Denied

```bash
sudo tail -50 /var/log/nginx/error.log
sudo nginx -t
sudo systemctl restart nginx
```

### Container Keeps Restarting

```bash
docker logs devops-command-center --tail=100

# Common causes:
# - Missing SESSION_SECRET in .env
# - Port already in use
# - Insufficient memory

free -h
docker stats --no-stream
```

---

*Last Updated: June 2025 | OpsCenter Dashboard v1.0.0*
