# 🚀 OpsCenter Dashboard — Node.js DevOps Monitoring Platform

<div align="center">

![OpsCenter](https://img.shields.io/badge/OpsCenter-Dashboard-5b73f5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white)
![HTTPS](https://img.shields.io/badge/HTTPS-SSL%2FTLS-00C853?style=for-the-badge&logo=letsencrypt&logoColor=white)
![CI/CD](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A production-ready DevOps monitoring dashboard deployed on AWS EC2 with HTTPS, Docker, Nginx, and GitHub Actions CI/CD.**

[Live App](https://node-app.tryagentikai.com) · [Architecture](docs/architecture.md) · [Deployment Guide](Deployment.md) · [Challenges](Challenges.md)

</div>

---

## 📋 Project Overview

**OpsCenter Dashboard** is a full-stack Node.js web application that gives DevOps engineers a single unified interface to monitor applications, containers, deployments, services, incidents, logs, and CI/CD pipelines.

Built with enterprise aesthetics inspired by Vercel, Datadog, and Grafana — and deployed on **AWS EC2** with:
- ✅ HTTPS via Certbot + Let's Encrypt
- ✅ Nginx reverse proxy (ports 80/443 → 3000)
- ✅ Docker + Docker Compose containerization
- ✅ GitHub Actions CI/CD pipeline

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 📊 Dashboard Overview | Animated metric cards with real-time stats |
| 🟢 Application Health | Service monitoring with CPU/memory metrics |
| 🐳 Container Monitoring | Docker container status, uptime, restart counts |
| 🚀 Deployment History | Timeline view with version tracking |
| 📈 Service Metrics | Chart.js charts for CPU, RAM, Network, Disk |
| 📝 Log Viewer | Terminal-style log viewer with search/filter |
| 🚨 Incident Center | Severity-based incident tracking and management |
| 🌍 Environment Management | Production, Staging, Development tracking |
| 🔄 CI/CD Pipeline | Stage-by-stage pipeline visualization |
| 🔌 REST API | Complete JSON API for all data endpoints |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20 (LTS)
- **Framework**: Express.js 4.x
- **Architecture**: MVC (Model-View-Controller)
- **Logging**: Winston
- **Security**: Helmet, express-rate-limit, CORS

### Frontend
- **Templates**: EJS (Embedded JavaScript)
- **CSS**: Tailwind CSS (CDN) + Custom CSS
- **Charts**: Chart.js 4.x
- **Fonts**: Inter + JetBrains Mono (Google Fonts)

### DevOps & Infrastructure
| Component | Technology |
|-----------|-----------|
| Containerization | Docker (multi-stage build) |
| Orchestration | Docker Compose |
| Reverse Proxy | Nginx 1.25 |
| SSL/TLS | Certbot + Let's Encrypt |
| Cloud | AWS EC2 (Ubuntu 22.04 LTS) |
| CI/CD | GitHub Actions |
| DNS | node-app.tryagentikai.com |

---

## 📁 Project Structure

```
node-web-app/
├── app.js                    # Express entry point
├── package.json              # Dependencies & scripts
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
│   ├── errorHandler.js       # 404 + global error handler
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
├── docs/                     # Architecture & documentation
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

## ⚙️ Local Setup

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org))
- npm 9+
- Docker & Docker Compose (for container deployment)
- Git

### Clone & Install

```bash
# 1. Clone the repository
git clone https://github.com/your-username/node-web-app.git
cd node-web-app

# 2. Install dependencies
npm ci

# 3. Configure environment
cp .env.example .env
# Edit .env with your values (SESSION_SECRET is required)

# 4. Start development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment |
| `PORT` | `3000` | Server listening port |
| `APP_NAME` | `DevOps Command Center` | App display name |
| `SESSION_SECRET` | *(required)* | Session encryption key |
| `LOG_LEVEL` | `info` | Winston log verbosity |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | API rate limit ceiling |

---

## 🐳 Docker Compose Usage

```bash
# Start the application container
docker compose up -d

# Start with Nginx reverse proxy
docker compose --profile with-nginx up -d

# View live logs
docker compose logs -f app

# Check container health status
docker compose ps

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Rebuild after code changes
docker compose up -d --build
```

### Health Check

```bash
# Application health endpoint
curl http://localhost:3000/health

# Detailed health info
curl http://localhost:3000/health/detailed
```

---

## ☁️ Deployment Process

Full step-by-step AWS deployment is documented in **[Deployment.md](Deployment.md)**.

### Quick Summary

1. Launch **AWS EC2** t3.medium (Ubuntu 22.04 LTS)
2. Open Security Groups: ports **22, 80, 443**
3. Install **Docker** and **Docker Compose**
4. Clone repo and configure `.env`
5. Deploy with `docker compose up -d`
6. Install **Nginx** as reverse proxy
7. Point DNS `node-app.tryagentikai.com` → EC2 Public IP
8. Run **Certbot** for Let's Encrypt SSL certificate
9. Verify HTTPS at `https://node-app.tryagentikai.com`

---

## 🔒 HTTPS Configuration

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d node-app.tryagentikai.com

# Test auto-renewal
sudo certbot renew --dry-run

# Verify HTTPS
curl -I https://node-app.tryagentikai.com
```

Certbot automatically configures Nginx with SSL and sets up a systemd timer for certificate auto-renewal every 60 days.

---

## 🔄 CI/CD Workflow

The GitHub Actions pipeline (`.github/workflows/deploy.yml`) triggers on every push to `main`:

```
Push to main
    │
    ▼
┌─────────────────────────────────────────┐
│           CI Validation Pipeline        │
│                                         │
│  1. Checkout repository                 │
│  2. Setup Node.js 20                    │
│  3. npm ci (install dependencies)       │
│  4. npm audit --audit-level=high        │
│  5. docker compose config (validate)    │
│  6. docker build (build image)          │
│  7. docker compose up -d               │
│  8. sleep 10 (wait for startup)         │
│  9. curl localhost (smoke test)         │
│  10. docker compose down (cleanup)      │
│  11. Print deployment summary           │
└─────────────────────────────────────────┘
```

---

## ✅ Verification Commands

```bash
# 1. Check HTTPS is working
curl -I https://node-app.tryagentikai.com

# 2. Verify SSL certificate
echo | openssl s_client -connect node-app.tryagentikai.com:443 2>/dev/null | openssl x509 -noout -dates

# 3. DNS resolution
nslookup node-app.tryagentikai.com
dig node-app.tryagentikai.com

# 4. Docker containers running
docker ps
docker compose ps

# 5. Application health
curl https://node-app.tryagentikai.com/health

# 6. Nginx status
sudo systemctl status nginx

# 7. Certificate expiry
sudo certbot certificates

# 8. Container logs
docker compose logs -f app --tail=50
```

---

## 🌐 Public URLs

| URL | Description |
|-----|-------------|
| `https://node-app.tryagentikai.com` | Main application (HTTPS) |
| `https://node-app.tryagentikai.com/health` | Health check endpoint |
| `https://node-app.tryagentikai.com/health/detailed` | Detailed system info |
| `https://node-app.tryagentikai.com/api/stats` | API stats endpoint |
| `http://node-app.tryagentikai.com` | HTTP (auto-redirects to HTTPS) |

---

## 📸 Screenshots

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

## ⚡ Challenges

Detailed challenges documented in **[Challenges.md](Challenges.md)**:

1. **DNS Propagation Delay** — Domain took 45+ minutes to resolve globally
2. **Certbot Validation Failure** — Port 80 blocked by security group rules
3. **Docker Container Startup Issue** — Missing SESSION_SECRET caused crash loop
4. **Nginx 502 Bad Gateway** — upstream container not yet healthy

---

## 🚀 Future Improvements

- [ ] Implement Prometheus + Grafana metrics stack
- [ ] Add PostgreSQL for persistent data storage
- [ ] Set up AWS CloudWatch log aggregation
- [ ] Configure AWS ALB with auto-scaling
- [ ] Add Slack/PagerDuty incident notifications
- [ ] Implement JWT-based authentication
- [ ] Add WebSocket support for real-time updates
- [ ] Blue-green deployment strategy with zero downtime
- [ ] Terraform infrastructure-as-code for EC2 provisioning
- [ ] Multi-region deployment with Route 53 failover

---

## 📚 Documentation Links

| Document | Description |
|----------|-------------|
| [Deployment.md](Deployment.md) | Full AWS EC2 deployment guide |
| [Challenges.md](Challenges.md) | Deployment issues & solutions |
| [docs/architecture.md](docs/architecture.md) | System architecture diagrams |
| [docs/assumptions.md](docs/assumptions.md) | Deployment assumptions |
| [docs/evaluation_checklist.md](docs/evaluation_checklist.md) | Internship evaluation checklist |
| [screenshots/README.md](screenshots/README.md) | Screenshot catalog |
| [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | CI/CD pipeline definition |

---

<div align="center">
Built with ❤️ for modern DevOps teams | OpsCenter Dashboard v1.0.0
</div>
