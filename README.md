# OpsCenter Dashboard

Node.js DevOps Monitoring Platform

<div align="center">

![OpsCenter](https://img.shields.io/badge/OpsCenter-Dashboard-5b73f5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white)
![HTTPS](https://img.shields.io/badge/HTTPS-SSL%2FTLS-00C853?style=for-the-badge&logo=letsencrypt&logoColor=white)
![CI/CD](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

[Live App](https://node-app.tryagentikai.com) · [Architecture](docs/architecture.md) · [Deployment Guide](Deployment.md) · [Challenges](Challenges.md)

</div>

---

## Project Overview

OpsCenter Dashboard is a full-stack Node.js web application built to give DevOps engineers a single interface for monitoring applications, containers, deployments, services, incidents, logs, and CI/CD pipelines.

The application is deployed on AWS EC2 with the following configuration:

- HTTPS via Certbot and Let's Encrypt
- Nginx as a reverse proxy handling ports 80 and 443
- Docker and Docker Compose for containerization
- GitHub Actions for CI validation on every push to `main`

---

## Features

| Feature | Description |
|---------|-------------|
| Dashboard Overview | Metric cards with real-time stats |
| Application Health | Service monitoring with CPU and memory metrics |
| Container Monitoring | Docker container status, uptime, and restart counts |
| Deployment History | Timeline view with version tracking |
| Service Metrics | Chart.js charts for CPU, RAM, Network, and Disk |
| Log Viewer | Terminal-style log viewer with search and filter |
| Incident Center | Severity-based incident tracking and management |
| Environment Management | Production, Staging, and Development tracking |
| CI/CD Pipeline | Stage-by-stage pipeline visualization |
| REST API | JSON API for all data endpoints |

---

## Tech Stack

### Backend

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4.x
- **Architecture**: MVC (Model-View-Controller)
- **Logging**: Winston
- **Security**: Helmet, express-rate-limit, CORS

### Frontend

- **Templates**: EJS (Embedded JavaScript)
- **CSS**: Tailwind CSS (CDN) + Custom CSS
- **Charts**: Chart.js 4.x
- **Fonts**: Inter + JetBrains Mono (Google Fonts)

### Infrastructure

| Component | Technology |
|-----------|-----------|
| Containerization | Docker (multi-stage build) |
| Orchestration | Docker Compose |
| Reverse Proxy | Nginx 1.25 |
| SSL/TLS | Certbot + Let's Encrypt |
| Cloud | AWS EC2 (Ubuntu 22.04 LTS) |
| CI/CD | GitHub Actions |
| Domain | node-app.tryagentikai.com |

---

## Project Structure

```
node-web-app/
├── app.js                    # Express entry point
├── package.json              # Dependencies and scripts
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Service orchestration
├── nginx.conf                # Nginx reverse proxy config
├── .env.example              # Environment variable template
│
├── config/
│   ├── app.js                # App configuration
│   └── logger.js             # Winston logger setup
│
├── controllers/
│   ├── apiController.js      # REST API handlers
│   ├── dashboardController.js# Page controllers
│   └── healthController.js   # Health check endpoints
│
├── middleware/
│   ├── errorHandler.js       # 404 and global error handler
│   ├── rateLimiter.js        # Rate limiting middleware
│   └── requestLogger.js      # HTTP request logging
│
├── routes/
│   ├── api.js                # /api/* routes
│   ├── dashboard.js          # Page routes
│   └── health.js             # /health routes
│
├── services/
│   └── dataService.js        # Mock data service layer
│
├── views/
│   ├── layouts/main.ejs      # Base layout template
│   ├── pages/                # 8 dashboard page views
│   ├── partials/             # Reusable EJS partials
│   └── error.ejs             # Error page
│
├── public/
│   ├── css/main.css          # Custom styles
│   └── js/main.js            # Client-side JavaScript
│
├── docs/                     # Architecture and documentation
│   ├── architecture.md       # Mermaid architecture diagrams
│   ├── architecture.png      # Visual architecture diagram
│   ├── assumptions.md        # Deployment assumptions
│   └── evaluation_checklist.md
│
├── screenshots/              # Deployment evidence
│   └── README.md             # Screenshot catalog
│
└── .github/workflows/
    └── deploy.yml            # GitHub Actions CI/CD pipeline
```

---

## Local Setup

### Prerequisites

- Node.js 20+
- npm 9+
- Docker and Docker Compose
- Git

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/Harshit-Evalutation/node-web-app.git
cd node-web-app

# Install dependencies
npm ci

# Configure environment
cp .env.example .env
# Edit .env — SESSION_SECRET is required

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment |
| `PORT` | `3000` | Server listening port |
| `APP_NAME` | `DevOps Command Center` | App display name |
| `SESSION_SECRET` | required | Session encryption key |
| `LOG_LEVEL` | `info` | Winston log verbosity |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | API rate limit ceiling |

---

## Docker Compose Usage

```bash
# Start the application container
docker compose up -d

# Start with Nginx reverse proxy
docker compose --profile with-nginx up -d

# View live logs
docker compose logs -f app

# Check container status
docker compose ps

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Rebuild the image
docker compose up -d --build
```

### Health Check

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/detailed
```

---

## Deployment Process

The full deployment procedure is documented in [Deployment.md](Deployment.md).

### Summary

1. Launch AWS EC2 t3.medium instance running Ubuntu 22.04 LTS
2. Open Security Group ports 22, 80, and 443
3. Install Docker and Docker Compose
4. Clone the repository and create `.env` from `.env.example`
5. Start the container with `docker compose up -d`
6. Install Nginx and configure it as a reverse proxy to port 3000
7. Point the DNS A record for `node-app.tryagentikai.com` to the EC2 public IP
8. Run Certbot to obtain a Let's Encrypt certificate
9. Verify HTTPS at `https://node-app.tryagentikai.com`

---

## HTTPS Configuration

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d node-app.tryagentikai.com

# Test certificate auto-renewal
sudo certbot renew --dry-run

# Verify HTTPS
curl -I https://node-app.tryagentikai.com
```

Certbot configures Nginx with SSL automatically and registers a systemd timer for certificate renewal.

---

## CI/CD Workflow

The GitHub Actions pipeline defined in `.github/workflows/deploy.yml` runs on every push to `main`:

```
Push to main
    |
    v
+------------------------------------------+
|         CI Validation Pipeline           |
|                                          |
|  1. Checkout repository                  |
|  2. Setup Node.js 20                     |
|  3. npm ci                               |
|  4. npm audit --audit-level=high         |
|  5. docker compose config                |
|  6. docker build                         |
|  7. docker compose up -d                 |
|  8. sleep 10                             |
|  9. curl localhost (smoke test)          |
| 10. docker compose down                  |
| 11. Print deployment summary             |
+------------------------------------------+
```

---

## Verification Commands

```bash
# Check HTTPS is working
curl -I https://node-app.tryagentikai.com

# Verify SSL certificate dates
echo | openssl s_client -connect node-app.tryagentikai.com:443 2>/dev/null | openssl x509 -noout -dates

# DNS resolution
nslookup node-app.tryagentikai.com
dig node-app.tryagentikai.com

# Docker status
docker ps
docker compose ps

# Application health
curl https://node-app.tryagentikai.com/health

# Nginx status
sudo systemctl status nginx

# Certificate info
sudo certbot certificates

# Container logs
docker compose logs -f app --tail=50
```

---

## Public URLs

| Endpoint | URL |
|----------|-----|
| Production | https://node-app.tryagentikai.com |
| API | https://node-app.tryagentikai.com/api/stats |
| EC2 Direct | http://\<public-ip\>:3000 |

---

## Screenshots

| # | Screenshot | Description |
|---|-----------|-------------|
| 01 | [Node HTTPS](screenshots/01_node_https.png) | App running on HTTPS |
| 02 | [Docker PS](screenshots/02_docker_ps.png) | Docker containers running |
| 03 | [Compose PS](screenshots/03_docker_compose_ps.png) | Docker Compose status |
| 04 | [Certbot SSL](screenshots/04_certbot_ssl.png) | SSL certificate obtained |
| 05 | [NSLookup](screenshots/05_nslookup.png) | DNS resolution verified |
| 06 | [GitHub Actions](screenshots/06_github_actions.png) | CI/CD pipeline passing |
| 07 | [EC2 Terminal](screenshots/07_ec2_terminal.png) | EC2 deployment terminal |
| 08 | [Architecture](screenshots/08_architecture.png) | System architecture diagram |

---

## Challenges

Deployment issues are documented in [Challenges.md](Challenges.md):

1. **DNS Propagation Delay** — Domain took approximately 45 minutes to resolve globally
2. **Certbot Validation Failure** — Port 80 was blocked by the EC2 Security Group
3. **Docker Container Startup Issue** — Missing SESSION_SECRET caused a restart loop
4. **Nginx 502 Bad Gateway** — Nginx received traffic before the container was healthy

---

## Future Improvements

- Add Prometheus and Grafana for metrics collection
- Integrate PostgreSQL for persistent data storage
- Configure AWS CloudWatch for log aggregation
- Set up an AWS ALB with auto-scaling
- Add Slack or PagerDuty notifications for incidents
- Implement JWT-based authentication
- Add WebSocket support for real-time dashboard updates
- Use Terraform for infrastructure provisioning
- Configure blue-green deployments for zero-downtime releases

---

## Documentation Links

| Document | Description |
|----------|-------------|
| [Deployment.md](Deployment.md) | AWS EC2 deployment guide |
| [Challenges.md](Challenges.md) | Deployment issues and solutions |
| [docs/architecture.md](docs/architecture.md) | System architecture diagrams |
| [docs/assumptions.md](docs/assumptions.md) | Deployment assumptions |
| [docs/evaluation_checklist.md](docs/evaluation_checklist.md) | Internship evaluation checklist |
| [screenshots/README.md](screenshots/README.md) | Screenshot catalog |
| [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | CI/CD pipeline definition |

---

*OpsCenter Dashboard v1.0.0*
