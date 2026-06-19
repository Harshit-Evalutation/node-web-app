# ⚠️ Deployment Challenges — OpsCenter Dashboard

> Real issues encountered during the deployment of the OpsCenter Dashboard on AWS EC2 with Docker, Nginx, and Certbot. Each challenge includes the problem, root cause, solution applied, and prevention strategy.

---

## Table of Contents

1. [DNS Propagation Delay](#challenge-1-dns-propagation-delay)
2. [Certbot Validation Failure](#challenge-2-certbot-validation-failure)
3. [Docker Container Startup Issue](#challenge-3-docker-container-startup-issue)
4. [Nginx Reverse Proxy 502 Error](#challenge-4-nginx-reverse-proxy-502-error)
5. [Summary Table](#summary-table)

---

## Challenge 1: DNS Propagation Delay

### 🔴 Problem

After adding the DNS `A` record for `node-app.tryagentikai.com` pointing to the EC2 Elastic IP, the domain did not resolve immediately. Running `nslookup node-app.tryagentikai.com` returned `NXDOMAIN` (no record found) for approximately 45 minutes. Attempting to run Certbot during this period failed because Let's Encrypt could not resolve the domain to complete the HTTP-01 challenge.

```bash
$ nslookup node-app.tryagentikai.com
Server:  8.8.8.8
Address:  8.8.8.8#53

** server can't find node-app.tryagentikai.com: NXDOMAIN
```

### 🔍 Root Cause

DNS propagation is not instantaneous. When a new A record is created, the change must propagate from the authoritative nameservers through the global DNS resolver network (ISP resolvers, public resolvers like 8.8.8.8 and 1.1.1.1). The TTL (Time-To-Live) configured for the record (initially set to 3600 seconds) meant resolvers cached the "no record" response before the A record existed, further delaying propagation.

### ✅ Solution

1. **Waited** for DNS propagation to complete (~45 minutes in this case).
2. Monitored propagation progress using multiple tools:
   ```bash
   # Check from multiple DNS resolvers
   nslookup node-app.tryagentikai.com 8.8.8.8   # Google
   nslookup node-app.tryagentikai.com 1.1.1.1   # Cloudflare
   dig node-app.tryagentikai.com +short

   # Check global propagation
   # Used: https://www.whatsmydns.net/#A/node-app.tryagentikai.com
   ```
3. Only ran Certbot after confirming the domain resolved to the correct EC2 IP.

### 🛡️ Prevention

- Set DNS TTL to **300 seconds (5 minutes)** before making DNS changes so future updates propagate faster.
- Pre-configure DNS records **before** deploying the application.
- Use a low initial TTL during setup phase; increase to 3600 after stable deployment.
- Use AWS Route 53 for faster, more reliable DNS management with global anycast.
- Add DNS propagation check to deployment runbook as a prerequisite gate.

---

## Challenge 2: Certbot Validation Failure

### 🔴 Problem

After DNS resolved correctly, running Certbot to obtain a Let's Encrypt SSL certificate failed with an ACME HTTP-01 challenge error. The certificate was not issued.

```bash
$ sudo certbot --nginx -d node-app.tryagentikai.com

Obtaining a new certificate
Performing the following challenges:
http-01 challenge for node-app.tryagentikai.com
Waiting for verification...
Challenge failed for domain node-app.tryagentikai.com
http-01 challenge for node-app.tryagentikai.com
Cleaning up challenges
IMPORTANT NOTES:
 - The following errors were reported by the server:
   Domain: node-app.tryagentikai.com
   Type: connection
   Detail: Fetching http://node-app.tryagentikai.com/.well-known/acme-challenge/...
   Connection refused
```

### 🔍 Root Cause

The AWS EC2 Security Group did not have port **80 (HTTP)** open to the internet (`0.0.0.0/0`). Let's Encrypt's HTTP-01 challenge requires it to make an HTTP request on port 80 to `http://yourdomain.com/.well-known/acme-challenge/<token>` to verify domain ownership. Without port 80 open, the ACME server could not reach the challenge endpoint.

Additionally, Nginx was not running when Certbot first attempted validation, as it had been temporarily stopped during configuration editing.

### ✅ Solution

1. **Updated the EC2 Security Group** to add an inbound rule:
   - Type: `HTTP`
   - Port: `80`
   - Source: `0.0.0.0/0, ::/0`

2. **Started Nginx** before running Certbot:
   ```bash
   sudo systemctl start nginx
   sudo systemctl status nginx
   ```

3. **Verified port 80 was reachable** from outside:
   ```bash
   curl -v http://node-app.tryagentikai.com
   ```

4. **Re-ran Certbot** successfully:
   ```bash
   sudo certbot --nginx -d node-app.tryagentikai.com
   ```

### 🛡️ Prevention

- Always open **ports 80 and 443** in the Security Group before attempting SSL setup.
- Use a pre-deployment checklist that includes Security Group verification.
- Verify HTTP access with `curl http://<domain>` before running Certbot.
- Document required Security Group rules in [Deployment.md](Deployment.md) and [docs/assumptions.md](docs/assumptions.md).
- Consider using Certbot's DNS-01 challenge as an alternative that doesn't require port 80.

---

## Challenge 3: Docker Container Startup Issue

### 🔴 Problem

After cloning the repository on EC2 and running `docker compose up -d`, the container repeatedly exited with a non-zero exit code. `docker compose ps` showed the container in a restart loop:

```bash
$ docker compose ps
NAME                      IMAGE                         STATUS
devops-command-center     devops-command-center:latest  Restarting (1) 3 seconds ago
```

Checking the logs revealed:

```bash
$ docker compose logs app
Error: SESSION_SECRET environment variable is required in production mode
    at Object.<anonymous> (/app/config/app.js:15:9)
    at Module._compile (node:internal/modules/cjs/loader:1364:14)
    ...
node exited with code 1
```

### 🔍 Root Cause

The `.env` file was **not created** on the EC2 instance. The `.gitignore` correctly excludes `.env` from version control (to avoid committing secrets), but this meant it was also not present after cloning the repository. The `docker-compose.yml` passes environment variables from `.env` to the container. Without `SESSION_SECRET` defined, the application's startup validation in `config/app.js` threw an error and crashed.

The `restart: unless-stopped` policy in `docker-compose.yml` caused the container to restart indefinitely, creating a crash loop.

### ✅ Solution

1. **Created the `.env` file** from the example template:
   ```bash
   cp .env.example .env
   nano .env
   ```

2. **Generated a secure `SESSION_SECRET`**:
   ```bash
   openssl rand -base64 64
   # Copied the output into .env
   ```

3. **Set all required environment variables** in `.env`:
   ```env
   NODE_ENV=production
   SESSION_SECRET=<64-char-random-string>
   API_KEY=<secure-random-key>
   ```

4. **Restarted the application**:
   ```bash
   docker compose down
   docker compose up -d
   docker compose ps   # Now shows: Up (healthy)
   ```

### 🛡️ Prevention

- Add a **deployment step** in `Deployment.md` that explicitly instructs users to create `.env` from `.env.example` **before** running `docker compose up`.
- Add a startup validation script that checks for required env vars and exits with a descriptive error.
- In the GitHub Actions workflow, use GitHub Secrets to inject required variables during CI runs.
- Document all required environment variables in the README with their purpose and example values.
- Add a `.env.example` validation step to CI: verify `.env.example` contains all required keys.

---

## Challenge 4: Nginx Reverse Proxy 502 Error

### 🔴 Problem

After setting up Nginx as a reverse proxy and starting the Docker container, visiting `http://node-app.tryagentikai.com` returned a **502 Bad Gateway** error in the browser. Checking the Nginx error log showed:

```bash
$ sudo tail /var/log/nginx/error.log
2025/06/10 14:23:11 [error] 1234#1234: *1 connect() failed (111: Connection refused) 
while connecting to upstream, client: 1.2.3.4, 
server: node-app.tryagentikai.com, 
request: "GET / HTTP/1.1", 
upstream: "http://127.0.0.1:3000/", 
host: "node-app.tryagentikai.com"
```

### 🔍 Root Cause

**Two root causes combined** to produce this error:

1. **Race condition on startup**: When `docker compose up -d` was run, the container was still initializing (installing dependencies, starting the Express server). The `docker-compose.yml` health check (`curl http://localhost:3000/health`) had a 15-second `start_period`, but Nginx was already receiving traffic before the container was ready. Nginx's `proxy_pass http://localhost:3000` received `Connection refused` because port 3000 was not yet bound.

2. **Nginx misconfiguration**: The initial Nginx config used `proxy_pass http://127.0.0.1:3000` but the Docker container was mapping port 3000 to the host's `0.0.0.0:3000`. In some network configurations, `127.0.0.1` and the container's published port interact differently.

### ✅ Solution

1. **Waited for the container to become healthy** before sending traffic:
   ```bash
   # Check health status before proceeding
   docker compose ps
   # Wait until STATUS shows: Up (healthy)

   # Or use a wait loop
   while [ "$(docker inspect --format='{{.State.Health.Status}}' devops-command-center)" != "healthy" ]; do
     echo "Waiting for container to be healthy..."
     sleep 5
   done
   echo "Container is healthy!"
   ```

2. **Tested the upstream directly** on the EC2 host:
   ```bash
   curl http://localhost:3000/health
   # Verified port 3000 responds before Nginx proxies
   ```

3. **Corrected the Nginx `proxy_pass`** to use `localhost` explicitly:
   ```nginx
   location / {
       proxy_pass http://localhost:3000;
       proxy_read_timeout 86400;
       proxy_connect_timeout 10s;
   }
   ```

4. **Reloaded Nginx** after the container was confirmed healthy:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. Confirmed the fix by accessing the site:
   ```bash
   curl -I http://node-app.tryagentikai.com
   # HTTP/1.1 200 OK
   ```

### 🛡️ Prevention

- Always verify `curl http://localhost:3000/health` returns 200 **before** configuring or reloading Nginx.
- Add a `proxy_connect_timeout` and `proxy_read_timeout` to Nginx to provide better error context.
- Use Docker's health check dependency: in `docker-compose.yml`, the `nginx` service uses `condition: service_healthy` on the `app` service, ensuring Nginx only starts after the app is healthy.
- Add a readiness probe to the deployment script that polls `/health` before declaring success.
- In GitHub Actions workflow, include a `sleep 10 && curl localhost:3000/health` step to catch startup issues early.

---

## Summary Table

| # | Challenge | Severity | Resolution Time | Key Fix |
|---|-----------|----------|-----------------|---------|
| 1 | DNS Propagation Delay | Medium | ~45 minutes | Waited for propagation; set low TTL |
| 2 | Certbot Validation Failure | High | ~15 minutes | Opened port 80 in Security Group |
| 3 | Docker Container Startup Issue | High | ~10 minutes | Created `.env` with `SESSION_SECRET` |
| 4 | Nginx 502 Bad Gateway | High | ~20 minutes | Waited for container health; fixed proxy config |

---

*Documented by: DevOps Engineer | OpsCenter Dashboard Deployment | June 2025*
