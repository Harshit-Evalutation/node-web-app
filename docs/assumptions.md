# Deployment Assumptions

OpsCenter Dashboard on AWS EC2

This document lists the assumptions made before and during deployment. Each assumption should be verified against the actual environment before following the deployment guide.

---

## 1. AWS Account and Infrastructure

| Assumption | Details | Verification |
|-----------|---------|--------------|
| AWS account exists | An active AWS account with IAM permissions for EC2, Security Groups, and Elastic IPs | AWS Console login works |
| IAM permissions granted | The deploying user has EC2 create and manage permissions | `aws ec2 describe-instances` succeeds |
| EC2 instance launched | `t3.medium` or larger, Ubuntu 22.04 LTS, in a supported region | Instance shows `running` state |
| Elastic IP allocated | Static public IP associated with the EC2 instance | IP does not change on stop/start |
| SSH key pair available | `.pem` key file for SSH access to the instance | `ssh -i key.pem ubuntu@IP` connects |
| Ports 80 and 443 open | EC2 Security Group inbound rules allow HTTP (80) and HTTPS (443) from `0.0.0.0/0` | `curl http://<EC2-IP>` responds |
| Port 22 open | SSH access from admin IP is allowed | SSH connection succeeds |

---

## 2. Domain Ownership and DNS

| Assumption | Details | Verification |
|-----------|---------|--------------|
| Domain ownership exists | The deployer owns or controls `tryagentikai.com` | DNS records can be added |
| DNS provider access | Access to the DNS management panel (Namecheap, Route 53, Cloudflare, or similar) | Can add and edit A records |
| A record can be created | `node-app.tryagentikai.com` can be pointed to the EC2 Elastic IP | DNS record created successfully |
| DNS propagation completed | Domain resolves to the EC2 IP before running Certbot | `nslookup node-app.tryagentikai.com` returns EC2 IP |
| No conflicting DNS records | No existing A or CNAME records for `node-app.tryagentikai.com` | DNS lookup shows no conflicts |

---

## 3. Docker and Docker Compose

| Assumption | Details | Verification |
|-----------|---------|--------------|
| Docker installed | Docker Engine 24.x or later installed on the EC2 instance | `docker --version` succeeds |
| Docker Compose available | Docker Compose v2 (plugin) installed | `docker compose version` succeeds |
| Docker daemon running | Docker service is active and enabled at boot | `sudo systemctl status docker` shows active |
| User in docker group | `ubuntu` user can run docker commands without `sudo` | `docker ps` works without sudo |
| Internet access from EC2 | Docker can pull images from Docker Hub | `docker pull nginx:alpine` succeeds |

---

## 4. Node.js and Application

| Assumption | Details | Verification |
|-----------|---------|--------------|
| Node.js 18 or later available | Required for building the Docker image (defined in Dockerfile) | `node --version` returns v18 or higher |
| npm available | Package manager for installing dependencies | `npm --version` succeeds |
| Git installed | Required for cloning the repository on EC2 | `git --version` succeeds |
| .env file will be created | `.env` is excluded from the repository and must be created manually | `cp .env.example .env` completed |
| SESSION_SECRET is set | Required environment variable for production startup | Non-empty value present in `.env` |
| Port 3000 is available | No other service binds port 3000 on the EC2 host | `ss -tlnp | grep 3000` returns empty |

---

## 5. Nginx and SSL

| Assumption | Details | Verification |
|-----------|---------|--------------|
| Nginx can be installed | Ubuntu 22.04 apt repository includes Nginx 1.18 or later | `sudo apt install nginx` succeeds |
| Port 80 accessible | Required for the Certbot HTTP-01 ACME challenge | `curl http://node-app.tryagentikai.com` responds |
| Certbot can be installed | `python3-certbot-nginx` is available in apt repos | `certbot --version` succeeds |
| Email address available | Required for Let's Encrypt registration and renewal notifications | Valid email provided to Certbot |
| Domain passes ACME challenge | Let's Encrypt can reach `http://node-app.tryagentikai.com/.well-known/acme-challenge/` | Certbot validation succeeds |
| Certificate auto-renewal works | Systemd timer or cron runs `certbot renew` automatically | `certbot renew --dry-run` succeeds |

---

## 6. GitHub Actions CI/CD

| Assumption | Details | Verification |
|-----------|---------|--------------|
| Repository on GitHub | Code is hosted in a GitHub repository | Repo accessible at github.com |
| GitHub Actions enabled | Actions are enabled for the repository | `.github/workflows/` is processed |
| `main` branch exists | Default branch named `main` triggers the workflow | Push to `main` starts CI |
| Runner has Docker | `ubuntu-latest` GitHub Actions runner has Docker pre-installed | `docker --version` in workflow passes |
| No secrets required for CI | Workflow builds locally and does not push to DockerHub | Workflow runs without `DOCKER_USERNAME` secret |

---

## 7. Security

| Assumption | Details |
|-----------|---------|
| `.env` file is not committed | `.gitignore` correctly excludes `.env` from version control |
| `node_modules` not committed | `node_modules/` is excluded from git |
| Logs not committed | `logs/` is excluded from git |
| SESSION_SECRET is strong | A cryptographically random 64-character string is used |
| API_KEY is confidential | Not exposed in logs or source code |
| Non-root Docker user | Container runs as `devops` user (UID 1001), not root |

---

## Out of Scope

The following are not covered by this deployment:

- Load balancing or multi-instance setup — a single EC2 instance is assumed
- Database persistence — the application uses mock data and requires no database
- AWS RDS, S3, or other managed services
- CloudFront CDN configuration
- Auto-scaling groups
- VPC private subnet configuration
- AWS Certificate Manager — Certbot with Let's Encrypt is used instead

---

*June 2025 | OpsCenter Dashboard v1.0.0*
