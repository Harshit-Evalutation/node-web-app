# 📸 Screenshots — OpsCenter Dashboard Deployment Evidence

> This directory contains deployment evidence screenshots for the OpsCenter Dashboard internship evaluation. Each screenshot captures a specific aspect of the production deployment.

---

## Screenshot Catalog

| # | Filename | Description | Status |
|---|----------|-------------|--------|
| 01 | `01_node_https.png` | OpsCenter Dashboard running on HTTPS in browser | ✅ Captured |
| 02 | `02_docker_ps.png` | `docker ps` output — container running with health status | ✅ Captured |
| 03 | `03_docker_compose_ps.png` | `docker compose ps` — services healthy | ✅ Captured |
| 04 | `04_certbot_ssl.png` | `sudo certbot certificates` — SSL cert details and expiry | ✅ Captured |
| 05 | `05_nslookup.png` | `nslookup node-app.tryagentikai.com` — DNS resolved to EC2 IP | ✅ Captured |
| 06 | `06_github_actions.png` | GitHub Actions workflow — CI/CD pipeline passing (green) | ⏳ Pending |
| 07 | `07_ec2_terminal.png` | EC2 SSH terminal — deployment commands and output | ⏳ Pending |
| 08 | `08_architecture.png` | System architecture diagram (dark-theme DevOps diagram) | ✅ Generated |

---

## Screenshot Details

### 01 — Node HTTPS (`01_node_https.png`)

**What it shows**: The OpsCenter Dashboard application accessible at `https://node-app.tryagentikai.com` in a browser, showing:
- 🔒 Padlock icon (SSL/HTTPS active)
- Full dashboard UI with DevOps monitoring panels
- URL bar displaying the HTTPS domain

**How to capture**:
```bash
# Ensure app is running, then open in browser:
# https://node-app.tryagentikai.com
```

---

### 02 — Docker PS (`02_docker_ps.png`)

**What it shows**: Output of `docker ps` on the EC2 instance showing:
- Container name: `devops-command-center`
- Image: `devops-command-center:latest`
- Status: `Up X hours (healthy)`
- Port mapping: `0.0.0.0:3000->3000/tcp`

**Command to run**:
```bash
docker ps
```

---

### 03 — Docker Compose PS (`03_docker_compose_ps.png`)

**What it shows**: Output of `docker compose ps` from the project directory showing:
- Service name: `app`
- Status: `running`
- Health: `(healthy)`

**Command to run**:
```bash
cd ~/node-web-app
docker compose ps
```

---

### 04 — Certbot SSL (`04_certbot_ssl.png`)

**What it shows**: SSL certificate details from Certbot including:
- Certificate name: `node-app.tryagentikai.com`
- Domains covered
- Expiry date (90 days from issuance)
- Certificate and private key paths

**Command to run**:
```bash
sudo certbot certificates
```

---

### 05 — NSLookup (`05_nslookup.png`)

**What it shows**: DNS resolution of `node-app.tryagentikai.com` returning the EC2 instance's public IP address, confirming:
- Domain is correctly configured
- A record points to EC2 Elastic IP

**Command to run**:
```bash
nslookup node-app.tryagentikai.com
# or
dig node-app.tryagentikai.com +short
```

---

### 06 — GitHub Actions (`06_github_actions.png`) ⏳ PENDING

**What it shows**: GitHub Actions CI/CD pipeline run showing:
- All workflow steps passing (green checkmarks)
- `npm ci`, `npm audit`, `docker build`, `docker compose up`, `curl localhost` steps successful
- Final "Deployment Summary" step output

**How to capture**:
1. Push code to the `main` branch on GitHub
2. Navigate to: `GitHub → Repository → Actions → deploy.yml`
3. Click on the most recent successful run
4. Take a screenshot showing all green steps

---

### 07 — EC2 Terminal (`07_ec2_terminal.png`) ⏳ PENDING

**What it shows**: EC2 SSH terminal session showing deployment commands and their output, ideally including:
- `docker compose up -d` output
- `docker compose ps` healthy status
- `curl https://node-app.tryagentikai.com/health` response

**How to capture**:
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@<EC2-IP>

# Run deployment commands and capture terminal
cd node-web-app
docker compose ps
curl -I https://node-app.tryagentikai.com
# Take screenshot of terminal
```

---

### 08 — Architecture (`08_architecture.png`)

**What it shows**: Professional dark-themed DevOps architecture diagram showing:
- User → DNS → AWS EC2 flow
- Nginx (SSL termination + reverse proxy)
- Certbot (Let's Encrypt SSL)
- Docker Compose + Node.js container
- GitHub Actions CI/CD pipeline
- All connection labels (HTTPS:443, proxy_pass:3000, SSL Certs, CI Build)

**Source**: Generated programmatically. Also stored at `docs/architecture.png`.

---

## How to Take a Good Screenshot

1. **Use a clean browser/terminal** — no personal tabs, notifications, or clutter
2. **Show the full window** — include URL bar for browser screenshots
3. **Capture command output completely** — scroll up if needed to show all output
4. **Use 1920×1080 or higher resolution** — for clarity in evaluation
5. **Name files exactly as specified** — e.g., `06_github_actions.png`

---

## Pending Actions

> ⚠️ **Two screenshots still need to be captured manually:**

1. **`06_github_actions.png`** — Push to main branch → GitHub Actions → capture passing pipeline
2. **`07_ec2_terminal.png`** — SSH into EC2 → run deployment commands → capture terminal

Place captured screenshots directly in this `screenshots/` directory.

---

*OpsCenter Dashboard v1.0.0 | Deployment Evidence | June 2025*
