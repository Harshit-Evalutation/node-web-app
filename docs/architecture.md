# 🏗️ System Architecture — OpsCenter Dashboard

> Architecture documentation for the Node.js OpsCenter Dashboard deployed on AWS EC2 with Docker, Nginx, Certbot SSL, and GitHub Actions CI/CD.

---

## Overview

The OpsCenter Dashboard follows a modern cloud-native architecture with the following key layers:

1. **Client Layer** — End user accesses via HTTPS through a web browser
2. **DNS Resolution** — Domain `node-app.tryagentikai.com` resolves to EC2 Public IP
3. **AWS EC2 Host** — Ubuntu 22.04 LTS instance running all services
4. **Nginx** — Reverse proxy handling SSL termination and traffic routing
5. **Docker Compose** — Container orchestration for the Node.js application
6. **Node.js Container** — Express.js application serving the dashboard
7. **GitHub Actions** — CI/CD pipeline for automated build and validation

---

## High-Level Architecture Diagram

```mermaid
graph TB
    User["👤 User / Browser<br/>HTTPS Request"]
    DNS["🌐 DNS Cloud<br/>node-app.tryagentikai.com<br/>Domain Resolution"]
    GHA["⚙️ GitHub Actions<br/>CI/CD Pipeline<br/>Build · Audit · Test"]

    subgraph EC2["☁️ AWS EC2 Host — Ubuntu 22.04 LTS (t3.medium)"]
        direction TB
        Nginx["🔒 Nginx 1.25<br/>Reverse Proxy<br/>SSL/TLS Termination<br/>Ports: 80 → 443"]
        Certbot["🔐 Certbot<br/>Let's Encrypt SSL<br/>Auto-Renewal"]

        subgraph DC["🐙 Docker Compose"]
            direction TB
            NodeApp["📦 Node.js Container<br/>OpsCenter Dashboard<br/>Express.js v4<br/>Port 3000<br/>devops-command-center:latest"]
        end
    end

    User -->|"HTTPS :443"| DNS
    DNS -->|"HTTPS :443"| EC2
    GHA -->|"CI Build & Validation"| EC2
    Nginx -->|"proxy_pass :3000"| NodeApp
    Certbot -->|"SSL Certificates"| Nginx
```

---

## Detailed Request Flow

```mermaid
sequenceDiagram
    actor User as 👤 User Browser
    participant DNS as 🌐 DNS Resolver
    participant EC2 as ☁️ EC2 Public IP
    participant Nginx as 🔒 Nginx
    participant Node as 📦 Node.js :3000

    User->>DNS: Resolve node-app.tryagentikai.com
    DNS-->>User: Returns EC2 Public IP

    User->>EC2: HTTPS GET / (port 443)
    EC2->>Nginx: TLS Handshake (Let's Encrypt cert)
    Nginx-->>User: TLS established (TLS 1.3)

    User->>Nginx: GET / HTTP/2
    Nginx->>Node: proxy_pass http://localhost:3000/
    Node-->>Nginx: 200 OK + HTML Response
    Nginx-->>User: 200 OK + Compressed HTML

    Note over User,Node: HTTP on port 80 → 301 Redirect to HTTPS
```

---

## CI/CD Pipeline Flow

```mermaid
flowchart LR
    Dev["👨‍💻 Developer<br/>git push main"] --> GHA

    subgraph GHA["⚙️ GitHub Actions Workflow"]
        direction TB
        S1["1. Checkout Repository<br/>actions/checkout@v4"]
        S2["2. Setup Node.js 20<br/>actions/setup-node@v4"]
        S3["3. Install Dependencies<br/>npm ci"]
        S4["4. Security Audit<br/>npm audit --audit-level=high"]
        S5["5. Validate Compose<br/>docker compose config"]
        S6["6. Build Docker Image<br/>docker build"]
        S7["7. Start Services<br/>docker compose up -d"]
        S8["8. Wait for Startup<br/>sleep 10"]
        S9["9. Smoke Test<br/>curl localhost"]
        S10["10. Cleanup<br/>docker compose down"]
        S11["11. Deployment Summary<br/>Print results"]

        S1-->S2-->S3-->S4-->S5-->S6-->S7-->S8-->S9-->S10-->S11
    end

    GHA -->|"✅ CI Validated"| EC2["☁️ AWS EC2<br/>Production"]
```

---

## SSL/TLS Certificate Lifecycle

```mermaid
flowchart TD
    Certbot["🔐 Certbot Client<br/>on EC2"] -->|"HTTP-01 Challenge<br/>Port 80"| LE["🏛️ Let's Encrypt<br/>ACME Server"]
    LE -->|"Domain Verified"| Certbot
    Certbot -->|"Issues Certificate<br/>/etc/letsencrypt/live/"| Cert["📜 SSL Certificate<br/>fullchain.pem + privkey.pem<br/>Valid 90 days"]
    Cert -->|"Configure SSL"| Nginx["🔒 Nginx<br/>ssl_certificate<br/>ssl_certificate_key"]
    Timer["⏰ Systemd Timer<br/>Twice daily check"] -->|"Renews if < 30 days"| Certbot
    Certbot -->|"Post-renewal hook"| Reload["🔄 nginx reload<br/>Zero-downtime renewal"]
```

---

## Docker Compose Service Architecture

```mermaid
graph TB
    subgraph Compose["🐙 Docker Compose — devops-network (bridge)"]
        direction LR

        subgraph AppSvc["app service"]
            App["📦 devops-command-center:latest<br/>Built from Dockerfile (multi-stage)<br/>Node.js 18 Alpine<br/>Non-root user: devops (UID 1001)<br/>Healthcheck: curl /health every 30s"]
        end

        subgraph NginxSvc["nginx service (profile: with-nginx)"]
            NginxC["🔒 nginx:1.25-alpine<br/>Depends on: app (healthy)"]
        end

        Logs["📁 Volume: devops-app-logs<br/>/app/logs"]
        NginxLogs["📁 Volume: devops-nginx-logs<br/>/var/log/nginx"]
    end

    Host["☁️ EC2 Host"] -->|"Port 3000:3000"| App
    Host -->|"Port 80:80<br/>Port 443:443"| NginxC
    App --- Logs
    NginxC --- NginxLogs
    NginxC -->|"proxy_pass localhost:3000"| App
```

---

## Infrastructure Component Summary

| Component | Technology | Version | Role |
|-----------|-----------|---------|------|
| Cloud Host | AWS EC2 | Ubuntu 22.04 LTS | Server infrastructure |
| Runtime | Node.js | 20 LTS | Application runtime |
| Framework | Express.js | 4.x | Web framework |
| Container | Docker | 24.x | Application containerization |
| Orchestration | Docker Compose | v2.x | Multi-container management |
| Reverse Proxy | Nginx | 1.25 Alpine | SSL termination + routing |
| SSL/TLS | Let's Encrypt | Certbot 2.x | Free SSL certificate authority |
| CI/CD | GitHub Actions | - | Automated build & validation |
| Domain | DNS A Record | - | node-app.tryagentikai.com |

---

## Network Port Map

| Port | Protocol | From | To | Purpose |
|------|----------|------|----|---------|
| 22 | TCP | Admin IP | EC2 | SSH management |
| 80 | TCP | Internet | Nginx | HTTP + Certbot ACME challenge |
| 443 | TCP | Internet | Nginx | HTTPS (TLS 1.2/1.3) |
| 3000 | TCP | Nginx (localhost) | Node.js container | App traffic (internal) |

---

## Architecture Diagram (Image)

![OpsCenter Dashboard Architecture](architecture.png)

---

*Generated: June 2025 | OpsCenter Dashboard v1.0.0*
