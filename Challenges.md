# Deployment Challenges

OpsCenter Dashboard on AWS EC2

This document records issues encountered during the deployment of the OpsCenter Dashboard on AWS EC2 with Docker, Nginx, and Certbot. Each entry covers the problem, its root cause, the resolution applied, and steps to prevent recurrence.

---

## Table of Contents

1. [DNS Propagation Delay](#challenge-1-dns-propagation-delay)
2. [Certbot Validation Failure](#challenge-2-certbot-validation-failure)
3. [Docker Container Startup Issue](#challenge-3-docker-container-startup-issue)
4. [Nginx Reverse Proxy 502 Error](#challenge-4-nginx-reverse-proxy-502-error)
5. [Summary](#summary)

---

## Challenge 1: DNS Propagation Delay

### Problem

After adding the DNS A record for `node-app.tryagentikai.com` pointing to the EC2 Elastic IP, the domain did not resolve for approximately 45 minutes. Running `nslookup` returned `NXDOMAIN` during this window:

```bash
$ nslookup node-app.tryagentikai.com
Server:  8.8.8.8
Address:  8.8.8.8#53

** server can't find node-app.tryagentikai.com: NXDOMAIN
```

Attempting to run Certbot during this window failed because Let's Encrypt could not resolve the domain to complete the HTTP-01 ACME challenge.

### Root Cause

DNS changes propagate from authoritative nameservers through the global resolver network, which is not instantaneous. The initial TTL on the record was set to 3600 seconds. Because no A record had previously existed, resolvers cached the negative response before the record was added, which extended the effective propagation time.

### Solution

1. Waited for DNS propagation to complete before proceeding.
2. Monitored propagation from multiple resolvers:

```bash
nslookup node-app.tryagentikai.com 8.8.8.8
nslookup node-app.tryagentikai.com 1.1.1.1
dig node-app.tryagentikai.com +short
```

3. Ran Certbot only after confirming the domain resolved to the correct EC2 IP from multiple resolvers.

### Prevention

- Set the DNS TTL to 300 seconds before making changes so future updates propagate in under five minutes.
- Create DNS records before deploying the application, not after.
- Add a DNS propagation check as a required gate in the deployment runbook.
- Consider using AWS Route 53, which provides faster propagation through its global anycast network.

---

## Challenge 2: Certbot Validation Failure

### Problem

After DNS resolved correctly, running Certbot failed with an ACME HTTP-01 challenge error:

```bash
$ sudo certbot --nginx -d node-app.tryagentikai.com

Performing the following challenges:
http-01 challenge for node-app.tryagentikai.com
Waiting for verification...
Challenge failed for domain node-app.tryagentikai.com

IMPORTANT NOTES:
 - The following errors were reported by the server:
   Domain: node-app.tryagentikai.com
   Type: connection
   Detail: Fetching http://node-app.tryagentikai.com/.well-known/acme-challenge/...
   Connection refused
```

### Root Cause

The AWS EC2 Security Group did not include an inbound rule for port 80. The Let's Encrypt HTTP-01 challenge requires the ACME server to reach `http://<domain>/.well-known/acme-challenge/<token>` over port 80 to verify domain ownership. With port 80 blocked at the Security Group level, the request never reached the server.

Additionally, Nginx had been stopped during configuration editing and had not been restarted before Certbot ran.

### Solution

1. Added an inbound rule to the EC2 Security Group:
   - Protocol: TCP
   - Port: 80
   - Source: `0.0.0.0/0`

2. Started Nginx before running Certbot:

```bash
sudo systemctl start nginx
sudo systemctl status nginx
```

3. Confirmed port 80 was reachable externally:

```bash
curl -v http://node-app.tryagentikai.com
```

4. Re-ran Certbot, which succeeded.

### Prevention

- Always verify ports 80 and 443 are open in the Security Group before attempting certificate issuance.
- Include a Security Group verification step in the deployment checklist.
- Test `curl http://<domain>` from an external host before running Certbot.
- Consider the DNS-01 challenge as an alternative that does not require port 80 to be accessible.

---

## Challenge 3: Docker Container Startup Issue

### Problem

After cloning the repository on the EC2 instance and running `docker compose up -d`, the container entered a restart loop:

```bash
$ docker compose ps
NAME                      IMAGE                         STATUS
devops-command-center     devops-command-center:latest  Restarting (1) 3 seconds ago
```

Examining the logs revealed:

```bash
$ docker compose logs app
Error: SESSION_SECRET environment variable is required in production mode
    at Object.<anonymous> (/app/config/app.js:15:9)
node exited with code 1
```

### Root Cause

The `.env` file does not exist in the repository — it is excluded by `.gitignore` to prevent secrets from being committed. After cloning, no `.env` file was present on the server. The application's startup validation in `config/app.js` throws an error and exits when `SESSION_SECRET` is not defined in a production environment. The `restart: unless-stopped` policy in `docker-compose.yml` caused the container to restart continuously.

### Solution

1. Created `.env` from the example template:

```bash
cp .env.example .env
nano .env
```

2. Generated a secure `SESSION_SECRET`:

```bash
openssl rand -base64 64
```

3. Set the required variables in `.env`:

```env
NODE_ENV=production
SESSION_SECRET=<64-char-random-string>
API_KEY=<secure-random-key>
```

4. Restarted the application:

```bash
docker compose down
docker compose up -d
docker compose ps
```

The container started successfully and showed `Up (healthy)`.

### Prevention

- The deployment guide must explicitly instruct users to create `.env` from `.env.example` before running `docker compose up`. This step is documented in [Deployment.md](Deployment.md).
- Document all required environment variables and their purposes in the README.
- In the GitHub Actions workflow, use repository secrets to inject required variables during CI validation runs.
- Add a startup check that produces a clear error message listing each missing required variable.

---

## Challenge 4: Nginx Reverse Proxy 502 Error

### Problem

After configuring Nginx as a reverse proxy and starting the Docker container, requests to `http://node-app.tryagentikai.com` returned a 502 Bad Gateway response. The Nginx error log showed:

```bash
$ sudo tail /var/log/nginx/error.log
2025/06/10 14:23:11 [error] 1234#1234: *1 connect() failed (111: Connection refused)
while connecting to upstream, client: 1.2.3.4,
server: node-app.tryagentikai.com,
request: "GET / HTTP/1.1",
upstream: "http://127.0.0.1:3000/",
host: "node-app.tryagentikai.com"
```

### Root Cause

Two issues combined to produce this error:

1. **Startup race condition.** When `docker compose up -d` was run, the container was still initialising. The health check in `docker-compose.yml` has a 15-second `start_period`, but Nginx had already been reloaded and was forwarding traffic before port 3000 was bound. All requests during this window received a connection refused response from the upstream.

2. **Nginx proxy address mismatch.** The initial Nginx configuration used `proxy_pass http://127.0.0.1:3000`, but the Docker container publishes port 3000 on `0.0.0.0:3000`. In some configurations, connections to `127.0.0.1` and the container's published port behave differently depending on Docker's network bridge configuration.

### Solution

1. Waited for the container to report a healthy status before reloading Nginx:

```bash
docker compose ps
# Wait until STATUS shows: Up (healthy)
```

2. Confirmed port 3000 was responding from the host:

```bash
curl http://localhost:3000/health
```

3. Updated the Nginx `proxy_pass` directive to use `localhost`:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_read_timeout 86400;
    proxy_connect_timeout 10s;
}
```

4. Reloaded Nginx after the container was healthy:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

5. Confirmed the fix:

```bash
curl -I http://node-app.tryagentikai.com
# HTTP/1.1 200 OK
```

### Prevention

- Always verify `curl http://localhost:3000/health` returns 200 before reloading Nginx.
- Set `proxy_connect_timeout` in Nginx to surface upstream errors faster.
- In `docker-compose.yml`, the nginx service uses `condition: service_healthy` on the app service so that the container is only considered ready after the health check passes.
- In the GitHub Actions workflow, include `sleep 10` followed by a health check after `docker compose up -d` to catch startup failures early.

---

## Summary

| # | Challenge | Severity | Resolution Time | Key Fix |
|---|-----------|----------|-----------------|---------|
| 1 | DNS Propagation Delay | Medium | ~45 minutes | Waited for propagation; reduced TTL |
| 2 | Certbot Validation Failure | High | ~15 minutes | Opened port 80 in Security Group |
| 3 | Docker Container Startup Issue | High | ~10 minutes | Created `.env` with `SESSION_SECRET` |
| 4 | Nginx 502 Bad Gateway | High | ~20 minutes | Waited for container health; corrected proxy address |

---

*OpsCenter Dashboard Deployment | June 2025*
