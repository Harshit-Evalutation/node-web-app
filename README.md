# 🚀 DevOps Command Center

<div align="center">

![DevOps Command Center](https://img.shields.io/badge/DevOps-Command%20Center-5b73f5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)

**A production-ready DevOps monitoring dashboard for enterprise infrastructure management.**

</div>

---

## 📋 Project Overview

DevOps Command Center is a full-stack Node.js web application designed to give DevOps engineers a single unified interface to monitor applications, containers, deployments, services, incidents, logs, and CI/CD pipelines. Built with enterprise aesthetics inspired by Vercel, Datadog, and Grafana.

### ✨ What makes it special?

- **Premium Dark UI** — Glassmorphism design with gradient accents and smooth animations
- **10 Monitoring Views** — Dashboard, Services, Containers, Deployments, Logs, Incidents, Environments, CI/CD
- **RESTful API** — 9 API endpoints for data integration
- **Production Docker Setup** — Multi-stage build, health checks, non-root user
- **MVC Architecture** — Clean separation of concerns with Express.js

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
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Architecture**: MVC (Model-View-Controller)
- **Logging**: Winston
- **Security**: Helmet, express-rate-limit, CORS

### Frontend
- **Templates**: EJS (Embedded JavaScript)
- **CSS**: Tailwind CSS (CDN) + Custom CSS
- **Charts**: Chart.js 4.x
- **Fonts**: Inter + JetBrains Mono (Google Fonts)

### DevOps
- **Containerization**: Docker (multi-stage build)
- **Orchestration**: Docker Compose
- **Target**: AWS EC2

---

## 📁 Folder Structure

```
node-web-app/
├── app.js                    # Entry point
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
│
├── config/
│   ├── app.js                # App configuration
│   └── logger.js             # Winston logger
│
├── controllers/
│   ├── apiController.js      # REST API handlers
│   ├── dashboardController.js# Page controllers
│   └── healthController.js   # Health endpoints
│
├── middleware/
│   ├── errorHandler.js       # 404 + global error handler
│   ├── rateLimiter.js        # Rate limiting
│   └── requestLogger.js      # Request logging
│
├── routes/
│   ├── api.js                # /api/* routes
│   ├── dashboard.js          # Page routes
│   └── health.js             # /health routes
│
├── services/
│   └── dataService.js        # Mock data layer
│
├── views/
│   ├── layouts/
│   │   └── main.ejs          # Base layout
│   ├── pages/
│   │   ├── dashboard.ejs
│   │   ├── services.ejs
│   │   ├── containers.ejs
│   │   ├── deployments.ejs
│   │   ├── logs.ejs
│   │   ├── incidents.ejs
│   │   ├── environments.ejs
│   │   └── cicd.ejs
│   ├── partials/
│   │   ├── sidebar.ejs
│   │   ├── topbar.ejs
│   │   └── footer.ejs
│   └── error.ejs
│
├── public/
│   ├── css/main.css
│   └── js/main.js
│
└── logs/                     # Auto-created at runtime
```

---

## ⚙️ Installation

### Prerequisites

- Node.js 18+
- npm 8+
- Docker & Docker Compose (for container deployment)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-org/devops-command-center.git
cd devops-command-center

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Start development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

---

## 🐳 Docker Usage

### Build and run with Docker

```bash
# Build the image
docker build -t devops-command-center:latest .

# Run the container
docker run -d \
  --name devops-command-center \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e SESSION_SECRET=your-secure-secret \
  devops-command-center:latest

# Check health
curl http://localhost:3000/health

# View logs
docker logs devops-command-center -f
```

---

## 🐙 Docker Compose Usage

```bash
# Start all services
docker compose up -d

# Start with nginx proxy
docker compose --profile with-nginx up -d

# View logs
docker compose logs -f app

# Check status
docker compose ps

# Stop services
docker compose down

# Remove volumes (careful!)
docker compose down -v
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Application health check |
| GET | `/health/detailed` | Detailed health + system info |
| GET | `/api/health` | API health check |
| GET | `/api/stats` | Dashboard summary statistics |
| GET | `/api/services` | All service health data |
| GET | `/api/deployments` | Deployment history |
| GET | `/api/logs` | Application logs |
| GET | `/api/incidents` | Incident center data |
| GET | `/api/containers` | Container monitoring data |
| GET | `/api/metrics` | System metric time series |
| GET | `/api/environments` | Environment status |
| GET | `/api/cicd` | CI/CD pipeline activity |

### Query Parameters for `/api/logs`

| Parameter | Type | Description |
|-----------|------|-------------|
| `level` | string | Filter by level: INFO, WARN, ERROR, DEBUG |
| `search` | string | Search in log messages |
| `limit` | number | Max entries to return (default: 50) |

### Example Response

```json
GET /health

{
  "status": "healthy",
  "application": "DevOps Command Center",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## ☁️ AWS EC2 Deployment

### Step 1: Launch EC2 Instance

```bash
# Recommended instance type: t3.small or t3.medium
# AMI: Ubuntu 22.04 LTS
# Security Groups: Allow port 22 (SSH), 80 (HTTP), 3000 (App)
```

### Step 2: Install Docker on EC2

```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker
```

### Step 3: Deploy the Application

```bash
# Clone the repo
git clone https://github.com/your-org/devops-command-center.git
cd devops-command-center

# Configure production environment
cp .env.example .env
nano .env  # Edit with production values

# Deploy with Docker Compose
docker compose up -d

# Verify deployment
docker compose ps
curl http://localhost:3000/health
```

### Step 4: Configure Security Group

| Type | Protocol | Port Range | Source |
|------|----------|------------|--------|
| SSH  | TCP      | 22         | Your IP |
| HTTP | TCP      | 80         | 0.0.0.0/0 |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 |

---

## 🔒 Security Features

- **Helmet.js** — Secure HTTP headers
- **Rate Limiting** — 100 requests per 15 minutes on API routes
- **Non-root Docker user** — Runs as `devops` user (UID 1001)
- **Content Security Policy** — Configured in helmet
- **Request validation** — Input sanitization on query params

---

## 📊 Dashboard Pages

| Route | Page |
|-------|------|
| `/` | Dashboard Overview |
| `/services` | Application Health Monitoring |
| `/containers` | Docker Container Status |
| `/deployments` | Deployment History Timeline |
| `/logs` | Log Viewer Terminal |
| `/incidents` | Incident Center |
| `/environments` | Environment Management |
| `/cicd` | CI/CD Pipeline Activity |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + 1` | Go to Dashboard |
| `Ctrl + 2` | Go to Services |
| `Ctrl + 3` | Go to Containers |
| `Ctrl + 4` | Go to Deployments |
| `Ctrl + 5` | Go to Logs |
| `Ctrl + 6` | Go to Incidents |
| `Ctrl + 7` | Go to Environments |
| `Ctrl + 8` | Go to CI/CD |

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment |
| `PORT` | `3000` | Server port |
| `APP_NAME` | `DevOps Command Center` | Application name |
| `APP_VERSION` | `1.0.0` | Application version |
| `SESSION_SECRET` | *(required)* | Session encryption key |
| `LOG_LEVEL` | `info` | Winston log level |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | API rate limit |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15min) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for modern DevOps teams
</div>
