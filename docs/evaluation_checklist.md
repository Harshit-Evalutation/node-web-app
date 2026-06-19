# Evaluation Checklist

OpsCenter Dashboard — Internship Submission

This checklist maps each internship evaluation requirement to the corresponding deliverable or deployment evidence. Items marked as complete have been verified against the repository and the live deployment.

---

## Scoring Summary

| Category | Max Score | Status |
|----------|-----------|--------|
| Application Deployment | 25 pts | Complete |
| HTTPS and SSL Configuration | 20 pts | Complete |
| Docker and Docker Compose | 15 pts | Complete |
| CI/CD Pipeline | 15 pts | Complete |
| Documentation | 15 pts | Complete |
| Architecture Diagram | 10 pts | Complete |
| **Total** | **100 pts** | **Complete** |

---

## 1. Application Deployment (25 pts)

| # | Requirement | Status | Evidence |
|---|-------------|--------|---------|
| 1.1 | Node.js application running on AWS EC2 | Done | EC2 instance `t3.medium` Ubuntu 22.04 |
| 1.2 | Application accessible via public domain | Done | `https://node-app.tryagentikai.com` |
| 1.3 | Application returns 200 OK on health check | Done | `curl https://node-app.tryagentikai.com/health` |
| 1.4 | Application runs as Docker container | Done | `docker ps` shows `devops-command-center` |
| 1.5 | Docker Compose used for orchestration | Done | `docker compose ps` shows running services |
| 1.6 | Environment variables configured, not hardcoded | Done | `.env` file used, not committed to git |
| 1.7 | Application restarts automatically on failure | Done | `restart: unless-stopped` in docker-compose.yml |

---

## 2. HTTPS and SSL Configuration (20 pts)

| # | Requirement | Status | Evidence |
|---|-------------|--------|---------|
| 2.1 | HTTPS enabled via Let's Encrypt | Done | Certbot SSL certificate obtained |
| 2.2 | HTTP redirects to HTTPS with 301 | Done | `curl -I http://node-app.tryagentikai.com` returns 301 |
| 2.3 | Valid SSL certificate, not self-signed | Done | Certificate issued by Let's Encrypt R3 |
| 2.4 | Certificate auto-renewal configured | Done | `certbot renew --dry-run` passes; systemd timer active |
| 2.5 | Nginx configured for SSL termination | Done | `ssl_certificate` and `ssl_certificate_key` in nginx config |
| 2.6 | Nginx proxies traffic to Node.js container | Done | `proxy_pass http://localhost:3000` |
| 2.7 | SSL certificate is valid and not expired | Done | Expiry date is more than 30 days from submission |

---

## 3. Docker and Docker Compose (15 pts)

| # | Requirement | Status | Evidence |
|---|-------------|--------|---------|
| 3.1 | Dockerfile uses multi-stage build | Done | `FROM node:18-alpine AS dependencies` plus production stage |
| 3.2 | Container runs as non-root user | Done | Runs as `devops` (UID 1001) |
| 3.3 | Docker health check configured | Done | `HEALTHCHECK CMD curl -f http://localhost:3000/health` |
| 3.4 | docker-compose.yml defines all services | Done | `app` and `nginx` services with network and volumes |
| 3.5 | Named Docker network configured | Done | `devops-network` bridge network |
| 3.6 | Persistent log volume mounted | Done | `devops-app-logs` volume at `/app/logs` |
| 3.7 | `docker compose ps` shows healthy status | Done | Status shows `Up (healthy)` |

---

## 4. CI/CD Pipeline (15 pts)

| # | Requirement | Status | Evidence |
|---|-------------|--------|---------|
| 4.1 | `.github/workflows/deploy.yml` exists | Done | File present in repository |
| 4.2 | Pipeline triggers on push to `main` | Done | `on: push: branches: [main]` |
| 4.3 | `npm ci` runs in pipeline | Done | Dependency installation step |
| 4.4 | `npm audit` security check runs | Done | `npm audit --audit-level=high` step |
| 4.5 | Docker image is built in CI | Done | `docker build` step |
| 4.6 | `docker compose up -d` runs in CI | Done | Container deployment step |
| 4.7 | Smoke test runs after startup | Done | `curl localhost:3000/health` step |
| 4.8 | Pipeline cleanup runs | Done | `docker compose down` step |
| 4.9 | GitHub Actions screenshot captured | Done | `screenshots/06_github_actions.png` |

---

## 5. Documentation (15 pts)

| # | Requirement | Status | Evidence |
|---|-------------|--------|---------|
| 5.1 | `README.md` with all required sections | Done | Badges, Overview, Setup, Docker, CI/CD, URLs |
| 5.2 | `Deployment.md` with step-by-step guide | Done | EC2, Docker, Nginx, Certbot, DNS steps |
| 5.3 | `Challenges.md` with 4 or more issues | Done | DNS, Certbot, Docker startup, 502 error |
| 5.4 | Each challenge has Problem, Root Cause, Solution, Prevention | Done | All four sections present per challenge |
| 5.5 | `docs/assumptions.md` created | Done | 7 assumption categories |
| 5.6 | `docs/evaluation_checklist.md` created | Done | This document |
| 5.7 | `screenshots/README.md` created | Done | Screenshot catalog with 8 entries |

---

## 6. Architecture Diagram (10 pts)

| # | Requirement | Status | Evidence |
|---|-------------|--------|---------|
| 6.1 | `docs/architecture.md` with Mermaid diagrams | Done | 5 diagrams: system, request flow, CI/CD, SSL, Docker |
| 6.2 | All components shown | Done | User, DNS, EC2, Nginx, Certbot, Docker, Node.js, GitHub Actions |
| 6.3 | `docs/architecture.png` created | Done | Dark-theme DevOps architecture diagram |
| 6.4 | `screenshots/08_architecture.png` exists | Done | Copied from docs/architecture.png |
| 6.5 | Architecture shows connection labels | Done | HTTPS:443, proxy_pass:3000, SSL Certs, CI Build & Validation |

---

## 7. Git Hygiene

| # | Requirement | Status | Check |
|---|-------------|--------|-------|
| 7.1 | No `.env` file committed | Pass | `.gitignore` excludes `.env` |
| 7.2 | No `node_modules` committed | Pass | `.gitignore` excludes `node_modules/` |
| 7.3 | No log files committed | Pass | `.gitignore` excludes `logs/` |
| 7.4 | Clean commit history | Pass | Conventional commit messages used |
| 7.5 | Source code not modified | Pass | Only documentation files added |

---

## Screenshot Evidence

| File | Description | Status |
|------|-------------|--------|
| `screenshots/01_node_https.png` | Browser showing HTTPS on `node-app.tryagentikai.com` | Captured |
| `screenshots/02_docker_ps.png` | `docker ps` output showing running container | Captured |
| `screenshots/03_docker_compose_ps.png` | `docker compose ps` showing healthy status | Captured |
| `screenshots/04_certbot_ssl.png` | `certbot certificates` output with expiry date | Captured |
| `screenshots/05_nslookup.png` | `nslookup node-app.tryagentikai.com` showing EC2 IP | Captured |
| `screenshots/06_github_actions.png` | GitHub Actions workflow showing passing CI run | Captured |
| `screenshots/07_ec2_terminal.png` | EC2 SSH terminal showing deployment commands | Captured |
| `screenshots/08_architecture.png` | System architecture diagram | Generated |

---

## Final Verification Commands

```bash
# Verify HTTPS
curl -I https://node-app.tryagentikai.com

# Verify containers
docker compose ps

# Verify SSL certificate
sudo certbot certificates

# Verify DNS
nslookup node-app.tryagentikai.com

# Verify git hygiene
git status

# Verify workflow file
cat .github/workflows/deploy.yml

# Verify screenshots
ls -la screenshots/
```

---

*Checklist Version 1.0 | OpsCenter Dashboard | Internship Evaluation June 2025*
