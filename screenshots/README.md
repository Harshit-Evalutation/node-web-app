# Screenshot Catalog

OpsCenter Dashboard — Deployment Evidence

This directory contains screenshots taken during and after the deployment of OpsCenter Dashboard on AWS EC2. Each file corresponds to a specific verification step in the deployment process.

---

## Catalog

| # | Filename | Description | Status |
|---|----------|-------------|--------|
| 01 | `01_node_https.png` | OpsCenter Dashboard running on HTTPS in browser | Captured |
| 02 | `02_docker_ps.png` | `docker ps` output showing running container with health status | Captured |
| 03 | `03_docker_compose_ps.png` | `docker compose ps` showing services as healthy | Captured |
| 04 | `04_certbot_ssl.png` | `sudo certbot certificates` showing certificate details and expiry | Captured |
| 05 | `05_nslookup.png` | `nslookup node-app.tryagentikai.com` resolving to EC2 IP | Captured |
| 06 | `06_github_actions.png` | GitHub Actions workflow run with all steps passing | Captured |
| 07 | `07_ec2_terminal.png` | EC2 SSH terminal showing deployment commands and output | Captured |
| 08 | `08_architecture.png` | System architecture diagram | Generated |

---

## Screenshot Details

### 01 — Node HTTPS (`01_node_https.png`)

Browser view of the OpsCenter Dashboard at `https://node-app.tryagentikai.com`, confirming:
- Padlock icon visible (SSL active)
- Dashboard UI rendered
- URL bar shows the HTTPS domain

```bash
# Open in browser
https://node-app.tryagentikai.com
```

---

### 02 — Docker PS (`02_docker_ps.png`)

Output of `docker ps` on the EC2 instance showing:
- Container name: `devops-command-center`
- Image: `devops-command-center:latest`
- Status: `Up X hours (healthy)`
- Port mapping: `0.0.0.0:3000->3000/tcp`

```bash
docker ps
```

---

### 03 — Docker Compose PS (`03_docker_compose_ps.png`)

Output of `docker compose ps` from the project directory showing:
- Service: `app`
- Status: `running`
- Health: `(healthy)`

```bash
cd ~/node-web-app
docker compose ps
```

---

### 04 — Certbot SSL (`04_certbot_ssl.png`)

Output of `sudo certbot certificates` showing:
- Certificate name: `node-app.tryagentikai.com`
- Domains covered
- Expiry date (90 days from issuance)
- Certificate and private key file paths

```bash
sudo certbot certificates
```

---

### 05 — NSLookup (`05_nslookup.png`)

DNS resolution of `node-app.tryagentikai.com` returning the EC2 public IP, confirming the A record is correctly configured.

```bash
nslookup node-app.tryagentikai.com
dig node-app.tryagentikai.com +short
```

---

### 06 — GitHub Actions (`06_github_actions.png`)

GitHub Actions CI run showing all steps passing:
- Checkout, Node.js 20 setup, npm ci, npm audit
- docker compose config, docker build, docker compose up -d
- curl localhost smoke test, docker compose down
- Deployment summary output

---

### 07 — EC2 Terminal (`07_ec2_terminal.png`)

EC2 SSH terminal session showing:
- `docker ps` output
- `docker compose ps` healthy status
- `curl https://node-app.tryagentikai.com/health` response
- System uptime

---

### 08 — Architecture (`08_architecture.png`)

Dark-themed DevOps architecture diagram showing all system components and connection flows. The source file is also stored at `docs/architecture.png`.

---

## Screenshot Guidelines

1. Use a clean terminal or browser window with no personal tabs or notifications
2. Include the URL bar in browser screenshots to confirm the domain and HTTPS status
3. Capture the full command output without truncation
4. Use 1920x1080 resolution or higher
5. Name files exactly as specified above

---

*OpsCenter Dashboard v1.0.0 | Deployment Evidence | June 2025*
