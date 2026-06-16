'use strict';

const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// ─── Centralized Mock Data Layer ─────────────────────────────────────────────
// Architecture note: This module acts as the in-memory data store.
// In production, each getX() call would hit a real data source (Postgres, Redis,
// Prometheus API, Docker daemon socket, etc.). The interface stays identical —
// only this file needs to change.

let activeEnvironment = 'production';

// ─── Services ─────────────────────────────────────────────────────────────────
let services = [
  {
    id: 'svc-api',
    name: 'API Gateway',
    type: 'API',
    status: 'healthy',
    uptime: '99.98%',
    responseTime: '42ms',
    requests: '12.4K/min',
    requestsPerMin: 12400,
    errorRate: '0.02%',
    network: '245 MB/s',
    lastChecked: 'Just now',
    metrics: { cpu: 12.5, memory: 35.2 },
    icon: '🔌',
  },
  {
    id: 'svc-db',
    name: 'PostgreSQL Primary',
    type: 'Database',
    status: 'healthy',
    uptime: '99.95%',
    responseTime: '8ms',
    requests: '3.2K/min',
    requestsPerMin: 3200,
    errorRate: '0.00%',
    network: '89 MB/s',
    lastChecked: 'Just now',
    metrics: { cpu: 8.5, memory: 48.0 },
    icon: '🗄️',
  },
  {
    id: 'svc-cache',
    name: 'Redis Cache',
    type: 'Cache',
    status: 'warning',
    uptime: '98.12%',
    responseTime: '2ms',
    requests: '45.7K/min',
    requestsPerMin: 45700,
    errorRate: '1.24%',
    network: '512 MB/s',
    lastChecked: 'Just now',
    metrics: { cpu: 72.2, memory: 68.4 },
    icon: '⚡',
  },
  {
    id: 'svc-worker',
    name: 'Background Worker',
    type: 'Worker',
    status: 'healthy',
    uptime: '99.87%',
    responseTime: '156ms',
    requests: '892/min',
    requestsPerMin: 892,
    errorRate: '0.18%',
    network: '34 MB/s',
    lastChecked: 'Just now',
    metrics: { cpu: 24.5, memory: 33.1 },
    icon: '⚙️',
  },
  {
    id: 'svc-cdn',
    name: 'CDN Service',
    type: 'CDN',
    status: 'healthy',
    uptime: '99.99%',
    responseTime: '12ms',
    requests: '98.3K/min',
    requestsPerMin: 98300,
    errorRate: '0.01%',
    network: '1.8 GB/s',
    lastChecked: 'Just now',
    metrics: { cpu: 5.2, memory: 18.5 },
    icon: '🌐',
  },
  {
    id: 'svc-auth',
    name: 'Auth Service',
    type: 'Security',
    status: 'down',
    uptime: '94.20%',
    responseTime: 'N/A',
    requests: '0/min',
    requestsPerMin: 0,
    errorRate: '100%',
    network: '0 MB/s',
    lastChecked: '12 mins ago',
    metrics: { cpu: 0, memory: 0 },
    icon: '🔑',
  },
];

// ─── Containers ────────────────────────────────────────────────────────────────
let containers = [
  { id: 'cnt-001', name: 'python-app',    image: 'python:3.11-slim',        status: 'running',  port: '8000:8000',          uptime: '14d 6h 32m',  restarts: 0, cpu: 15.4, memory: 28.5, memoryMB: 142,  created: '2026-06-01 10:00' },
  { id: 'cnt-002', name: 'node-app',      image: 'node:18-alpine',           status: 'running',  port: '3000:3000',          uptime: '7d 2h 15m',   restarts: 1, cpu: 18.2, memory: 32.1, memoryMB: 118,  created: '2026-06-07 15:30' },
  { id: 'cnt-003', name: 'redis',         image: 'redis:7-alpine',           status: 'running',  port: '6379:6379',          uptime: '30d 0h 45m',  restarts: 0, cpu:  3.4, memory: 12.5, memoryMB:  48,  created: '2026-05-15 08:00' },
  { id: 'cnt-004', name: 'mongodb',       image: 'mongo:7.0',                status: 'running',  port: '27017:27017',        uptime: '21d 10h 08m', restarts: 2, cpu: 22.8, memory: 45.3, memoryMB: 285,  created: '2026-05-24 12:15' },
  { id: 'cnt-005', name: 'nginx-proxy',   image: 'nginx:1.25-alpine',        status: 'running',  port: '80:80, 443:443',     uptime: '30d 0h 45m',  restarts: 0, cpu:  2.1, memory:  5.2, memoryMB:  22,  created: '2026-05-15 08:10' },
  { id: 'cnt-006', name: 'prometheus',    image: 'prom/prometheus:latest',   status: 'warning',  port: '9090:9090',          uptime: '2d 4h 11m',   restarts: 3, cpu: 14.5, memory: 24.1, memoryMB:  96,  created: '2026-06-12 11:45' },
  { id: 'cnt-007', name: 'grafana',       image: 'grafana/grafana:10.2.0',   status: 'running',  port: '3001:3000',          uptime: '2d 4h 10m',   restarts: 0, cpu:  6.8, memory: 19.2, memoryMB:  76,  created: '2026-06-12 11:50' },
  { id: 'cnt-008', name: 'postgres',      image: 'postgres:16-alpine',       status: 'running',  port: '5432:5432',          uptime: '28d 3h 22m',  restarts: 0, cpu: 11.2, memory: 52.7, memoryMB: 332,  created: '2026-05-17 09:00' },
];

// ─── Deployments ──────────────────────────────────────────────────────────────
let deployments = [
  { id: 'DEP-1042', version: 'v2.4.1', status: 'success',  environment: 'production',  duration: '4m 23s', deployedBy: 'ci-bot',      commit: 'a1b2c3d', commitMsg: 'feat: add real-time metrics dashboard',                branch: 'main',    timestamp: moment().subtract(4,  'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '4h ago' },
  { id: 'DEP-1041', version: 'v2.4.0', status: 'success',  environment: 'staging',     duration: '3m 57s', deployedBy: 'jane.smith',  commit: 'e4f5g6h', commitMsg: 'chore: bump dependencies and security patches',         branch: 'release', timestamp: moment().subtract(6,  'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '6h ago' },
  { id: 'DEP-1040', version: 'v2.3.9', status: 'success',  environment: 'production',  duration: '5m 12s', deployedBy: 'ci-bot',      commit: 'i7j8k9l', commitMsg: 'fix: resolve JWT expiry edge case on token refresh',     branch: 'main',    timestamp: moment().subtract(8,  'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '8h ago' },
  { id: 'DEP-1039', version: 'v2.3.8', status: 'failed',   environment: 'production',  duration: '2m 08s', deployedBy: 'jane.smith',  commit: 'm1n2o3p', commitMsg: 'feat: implement webhook retry logic with backoff',       branch: 'main',    timestamp: moment().subtract(10, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '10h ago' },
  { id: 'DEP-1038', version: 'v2.3.7', status: 'success',  environment: 'staging',     duration: '4m 01s', deployedBy: 'john.doe',    commit: 'p4q5r6s', commitMsg: 'refactor: extract payment module into standalone service', branch: 'release', timestamp: moment().subtract(14, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '14h ago' },
  { id: 'DEP-1037', version: 'v2.3.6', status: 'success',  environment: 'production',  duration: '3m 45s', deployedBy: 'ci-bot',      commit: 't7u8v9w', commitMsg: 'perf: enable gzip compression on API responses',         branch: 'main',    timestamp: moment().subtract(18, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '18h ago' },
  { id: 'DEP-1036', version: 'v2.3.5', status: 'success',  environment: 'development', duration: '1m 52s', deployedBy: 'john.doe',    commit: 'x1y2z3a', commitMsg: 'test: add integration tests for auth service endpoints',  branch: 'develop', timestamp: moment().subtract(22, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '22h ago' },
  { id: 'DEP-1035', version: 'v2.3.4', status: 'failed',   environment: 'production',  duration: '1m 11s', deployedBy: 'ci-bot',      commit: 'b4c5d6e', commitMsg: 'fix: database connection pool exhaustion under load',     branch: 'hotfix',  timestamp: moment().subtract(26, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '1d 2h ago' },
  { id: 'DEP-1034', version: 'v2.3.3', status: 'success',  environment: 'production',  duration: '4m 55s', deployedBy: 'ci-bot',      commit: 'f7g8h9i', commitMsg: 'feat: role-based access control for admin panel',         branch: 'main',    timestamp: moment().subtract(30, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '1d 6h ago' },
  { id: 'DEP-1033', version: 'v2.3.2', status: 'success',  environment: 'staging',     duration: '3m 18s', deployedBy: 'jane.smith',  commit: 'j1k2l3m', commitMsg: 'ci: switch to multi-stage Docker build for smaller image', branch: 'release', timestamp: moment().subtract(36, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '1d 12h ago' },
  { id: 'DEP-1032', version: 'v2.3.1', status: 'success',  environment: 'production',  duration: '5m 02s', deployedBy: 'ci-bot',      commit: 'n4o5p6q', commitMsg: 'chore: update nginx config for websocket proxy support',   branch: 'main',    timestamp: moment().subtract(48, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '2d ago' },
  { id: 'DEP-1031', version: 'v2.3.0', status: 'success',  environment: 'production',  duration: '6m 34s', deployedBy: 'john.doe',    commit: 'r7s8t9u', commitMsg: 'feat: multi-region failover and health check routing',     branch: 'main',    timestamp: moment().subtract(72, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '3d ago' },
  { id: 'DEP-1030', version: 'v2.2.9', status: 'success',  environment: 'production',  duration: '4m 12s', deployedBy: 'ci-bot',      commit: 'a9b8c7d', commitMsg: 'perf: optimize elasticsearch index mappings',             branch: 'main',    timestamp: moment().subtract(96, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '4d ago' },
  { id: 'DEP-1029', version: 'v2.2.8', status: 'success',  environment: 'staging',     duration: '3m 44s', deployedBy: 'jane.smith',  commit: 'f6e5d4c', commitMsg: 'fix: sanitize user input in search query parser',         branch: 'release', timestamp: moment().subtract(120, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '5d ago' },
  { id: 'DEP-1028', version: 'v2.2.7', status: 'success',  environment: 'development', duration: '1m 30s', deployedBy: 'john.doe',    commit: 't3r2q1p', commitMsg: 'test: add mock integration suite for stripe webhooks',    branch: 'develop', timestamp: moment().subtract(144, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '6d ago' },
  { id: 'DEP-1027', version: 'v2.2.6', status: 'failed',   environment: 'production',  duration: '2m 15s', deployedBy: 'ci-bot',      commit: 'y9x8w7v', commitMsg: 'feat: add memory caching layer for localized config files', branch: 'main',    timestamp: moment().subtract(168, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '7d ago' },
  { id: 'DEP-1026', version: 'v2.2.5', status: 'success',  environment: 'production',  duration: '5m 09s', deployedBy: 'ci-bot',      commit: 'p5q4r3s', commitMsg: 'chore: upgrade node base image from v18 to v20',          branch: 'main',    timestamp: moment().subtract(192, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '8d ago' },
  { id: 'DEP-1025', version: 'v2.2.4', status: 'success',  environment: 'staging',     duration: '4m 20s', deployedBy: 'jane.smith',  commit: 'k8j7h6g', commitMsg: 'fix: patch memory leak in event emitter listeners',       branch: 'release', timestamp: moment().subtract(216, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '9d ago' },
  { id: 'DEP-1024', version: 'v2.2.3', status: 'success',  environment: 'production',  duration: '3m 55s', deployedBy: 'ci-bot',      commit: 'm3n2b1v', commitMsg: 'feat: compress static assets in production Nginx server',   branch: 'main',    timestamp: moment().subtract(240, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '10d ago' },
  { id: 'DEP-1023', version: 'v2.2.2', status: 'success',  environment: 'staging',     duration: '3m 12s', deployedBy: 'john.doe',    commit: 'z5x4c3v', commitMsg: 'refactor: decouple notification email provider interface', branch: 'release', timestamp: moment().subtract(264, 'hours').format('YYYY-MM-DD HH:mm:ss'), timeAgo: '11d ago' }
];

// ─── Incidents ────────────────────────────────────────────────────────────────
let incidents = [
  {
    id: 'INC-0891',
    title: 'High CPU Usage on Production Cluster',
    description: 'CPU utilization exceeded 85% threshold on 3 of 5 nodes. Auto-scaling triggered but scale-out took 4 minutes due to AMI warm-up delay.',
    severity: 'critical',
    status: 'resolved',
    service: 'API Gateway',
    environment: 'production',
    assignee: 'john.doe@company.com',
    timestamp: moment().subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    duration: '52 minutes',
    timeAgo: '3h ago',
    rootCause: 'Unoptimized DB query in /api/v2/reports endpoint executing full table scan. Query time spiked from 8ms to 4.2s under load.',
    resolutionNotes: 'Added composite index on reports(created_at, user_id). Query time returned to 8ms. Added query timeout of 500ms as circuit breaker.',
  },
  {
    id: 'INC-0890',
    title: 'Container OOMKilled Restart Loop',
    description: 'prometheus container entered OOMKilled restart loop — 3 restarts within 10 minutes. Scrape targets were unreachable causing alerting gap.',
    severity: 'high',
    status: 'resolved',
    service: 'Prometheus',
    environment: 'production',
    assignee: 'jane.smith@company.com',
    timestamp: moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: moment().subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    duration: '1h 04m',
    timeAgo: '8h ago',
    rootCause: 'Memory limit set to 256MB was insufficient for 47 scrape targets. Prometheus TSDB head block reached 280MB during retention compaction.',
    resolutionNotes: 'Increased container memory limit to 1GB. Optimized scrape_interval from 15s to 30s for non-critical targets. Added --storage.tsdb.retention.size=800MB flag.',
  },
  {
    id: 'INC-0889',
    title: 'Database Replication Lag Spike',
    description: 'PostgreSQL replication lag on read replica reached 45 seconds during afternoon peak load. Reads routed to primary causing increased latency.',
    severity: 'high',
    status: 'investigating',
    service: 'PostgreSQL Primary',
    environment: 'production',
    assignee: 'ops-team',
    timestamp: moment().subtract(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: null,
    duration: 'ongoing',
    timeAgo: '30m ago',
    rootCause: 'Heavy analytical queries from BI dashboard executing on primary instance. WAL sender backlog accumulating faster than replica can apply.',
    resolutionNotes: 'Under active mitigation. Moved BI queries to dedicated read replica. Increasing max_wal_senders and wal_keep_size on primary.',
  },
  {
    id: 'INC-0888',
    title: 'CDN Cache Invalidation Failure',
    description: 'Stale assets served to ~12% of users in ap-southeast-1 region. Cache purge API call returned 504 timeout from CDN control plane.',
    severity: 'medium',
    status: 'resolved',
    service: 'CDN Service',
    environment: 'production',
    assignee: 'jane.smith@company.com',
    timestamp: moment().subtract(12, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: moment().subtract(11, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    duration: '18 minutes',
    timeAgo: '12h ago',
    rootCause: 'CDN provider control plane API experienced elevated latency during a maintenance window that was not communicated via status page.',
    resolutionNotes: 'Implemented retry logic with exponential backoff for cache invalidation calls. Added monitoring alert for CDN control plane API response time.',
  },
  {
    id: 'INC-0887',
    title: 'Auth Service Token Validation Errors',
    description: 'JWT validation started failing for tokens issued before 08:30 UTC. 503 errors affecting approximately 800 concurrent users.',
    severity: 'critical',
    status: 'resolved',
    service: 'Auth Service',
    environment: 'production',
    assignee: 'john.doe@company.com',
    timestamp: moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: moment().subtract(23, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    duration: '42 minutes',
    timeAgo: '1d ago',
    rootCause: 'Secret key rotation procedure did not complete gracefully. Old tokens signed with previous key were invalidated before TTL expiry.',
    resolutionNotes: 'Rolled back secret key. Implemented dual-key verification window during rotation. Updated runbook for secret rotation procedure.',
  },
  {
    id: 'INC-0886',
    title: 'Background Worker Queue Backup',
    description: 'Email notification queue backed up to 24,000 pending jobs. Workers stopped processing due to Redis connection timeout configuration.',
    severity: 'medium',
    status: 'resolved',
    service: 'Background Worker',
    environment: 'production',
    assignee: 'ops-team',
    timestamp: moment().subtract(36, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: moment().subtract(35, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    duration: '28 minutes',
    timeAgo: '1d 12h ago',
    rootCause: 'Redis client connection_timeout set to 100ms was too aggressive. Network latency spike to 180ms in eu-west-1 caused all workers to drop connections.',
    resolutionNotes: 'Increased connection_timeout to 2000ms. Added connection pool with health checks. Queue drained within 15 minutes after fix.',
  },
  {
    id: 'INC-0885',
    title: 'Elasticsearch Index Circuit Breaker Exception',
    description: 'Queries targeting logs index returned 429 Too Many Requests due to parent circuit breaker triggering (JVM memory pressure at 95.2%).',
    severity: 'high',
    status: 'resolved',
    service: 'Background Worker',
    environment: 'production',
    assignee: 'ops-team',
    timestamp: moment().subtract(48, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: moment().subtract(47, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    duration: '1h 15m',
    timeAgo: '2d ago',
    rootCause: 'Large wildcard aggregation query executed by automated reporting tool. JVM heap capacity exhausted trying to keep bucket states in memory.',
    resolutionNotes: 'Configured indices.breaker.fielddata.limit to 40%. Added ES node JVM heap telemetry alert thresholds.',
  },
  {
    id: 'INC-0884',
    title: 'SSL Certificate Renewal Handshake Failure',
    description: 'Automated Let\'s Encrypt renewal agent failed authorization due to CAA record configuration mismatch on DNS provider.',
    severity: 'medium',
    status: 'resolved',
    service: 'API Gateway',
    environment: 'staging',
    assignee: 'jane.smith@company.com',
    timestamp: moment().subtract(72, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: moment().subtract(71, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    duration: '45m',
    timeAgo: '3d ago',
    rootCause: 'CAA record was restricting issuance to DigiCert only, blocking Let\'s Encrypt challenge validator.',
    resolutionNotes: 'Added letsencrypt.org to CAA record set. Triggered renewal script manually.',
  },
  {
    id: 'INC-0883',
    title: 'Docker Registry Connection Timeout',
    description: 'Internal runners failed to pull base alpine image. Registry authentication service experienced database deadlocks.',
    severity: 'medium',
    status: 'resolved',
    service: 'CDN Service',
    environment: 'development',
    assignee: 'john.doe@company.com',
    timestamp: moment().subtract(96, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: moment().subtract(95, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    duration: '32m',
    timeAgo: '4d ago',
    rootCause: 'Database connection leakage in docker registry authentication handler under high concurrency.',
    resolutionNotes: 'Patched docker registry token server dependencies. Restarted registry auth pods.'
  },
];

// ─── CI/CD Pipelines ──────────────────────────────────────────────────────────
let pipelines = [
  {
    id: 'pipe-008',
    name: 'Deploy to Production',
    branch: 'main',
    commit: 'a1b2c3d',
    commitMsg: 'feat: add real-time metrics dashboard',
    author: 'ci-bot',
    status: 'success',
    duration: '4m 23s',
    triggeredAt: moment().subtract(4, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '4h ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '2s' },
      { name: 'Build',        status: 'success', duration: '1m 42s' },
      { name: 'Test',         status: 'success', duration: '58s' },
      { name: 'Docker Build', status: 'success', duration: '1m 12s' },
      { name: 'Deploy',       status: 'success', duration: '29s' },
    ],
  },
  {
    id: 'pipe-007',
    name: 'Deploy to Staging',
    branch: 'release',
    commit: 'e4f5g6h',
    commitMsg: 'chore: bump dependencies and security patches',
    author: 'jane.smith',
    status: 'success',
    duration: '3m 57s',
    triggeredAt: moment().subtract(6, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '6h ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '1s' },
      { name: 'Build',        status: 'success', duration: '1m 30s' },
      { name: 'Test',         status: 'success', duration: '1m 04s' },
      { name: 'Docker Build', status: 'success', duration: '52s' },
      { name: 'Deploy',       status: 'success', duration: '30s' },
    ],
  },
  {
    id: 'pipe-006',
    name: 'Deploy to Production',
    branch: 'hotfix',
    commit: 'i7j8k9l',
    commitMsg: 'fix: resolve JWT expiry edge case on token refresh',
    author: 'ci-bot',
    status: 'success',
    duration: '5m 12s',
    triggeredAt: moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '8h ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '2s' },
      { name: 'Build',        status: 'success', duration: '2m 01s' },
      { name: 'Test',         status: 'success', duration: '1m 12s' },
      { name: 'Docker Build', status: 'success', duration: '1m 28s' },
      { name: 'Deploy',       status: 'success', duration: '29s' },
    ],
  },
  {
    id: 'pipe-005',
    name: 'Deploy to Production',
    branch: 'main',
    commit: 'm1n2o3p',
    commitMsg: 'feat: implement webhook retry logic with backoff',
    author: 'jane.smith',
    status: 'failed',
    duration: '2m 08s',
    triggeredAt: moment().subtract(10, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '10h ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '2s' },
      { name: 'Build',        status: 'success', duration: '1m 38s' },
      { name: 'Test',         status: 'failed',  duration: '28s' },
      { name: 'Docker Build', status: 'pending', duration: '-' },
      { name: 'Deploy',       status: 'pending', duration: '-' },
    ],
  },
  {
    id: 'pipe-004',
    name: 'Deploy to Staging',
    branch: 'release',
    commit: 'p4q5r6s',
    commitMsg: 'refactor: extract payment module into standalone service',
    author: 'john.doe',
    status: 'success',
    duration: '4m 01s',
    triggeredAt: moment().subtract(14, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '14h ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '1s' },
      { name: 'Build',        status: 'success', duration: '1m 44s' },
      { name: 'Test',         status: 'success', duration: '52s' },
      { name: 'Docker Build', status: 'success', duration: '55s' },
      { name: 'Deploy',       status: 'success', duration: '29s' },
    ],
  },
  {
    id: 'pipe-003',
    name: 'Deploy to Production',
    branch: 'main',
    commit: 't7u8v9w',
    commitMsg: 'perf: enable gzip compression on API responses',
    author: 'ci-bot',
    status: 'success',
    duration: '3m 45s',
    triggeredAt: moment().subtract(18, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '18h ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '2s' },
      { name: 'Build',        status: 'success', duration: '1m 22s' },
      { name: 'Test',         status: 'success', duration: '1m 01s' },
      { name: 'Docker Build', status: 'success', duration: '50s' },
      { name: 'Deploy',       status: 'success', duration: '30s' },
    ],
  },
  {
    id: 'pipe-002',
    name: 'Deploy to Staging',
    branch: 'release',
    commit: 'r7s8t9u',
    commitMsg: 'feat: multi-region failover and health check routing',
    author: 'john.doe',
    status: 'success',
    duration: '4m 15s',
    triggeredAt: moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '1d ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '1s' },
      { name: 'Build',        status: 'success', duration: '1m 55s' },
      { name: 'Test',         status: 'success', duration: '48s' },
      { name: 'Docker Build', status: 'success', duration: '1m 02s' },
      { name: 'Deploy',       status: 'success', duration: '29s' },
    ],
  },
  {
    id: 'pipe-001',
    name: 'Deploy to Development',
    branch: 'develop',
    commit: 'x1y2z3a',
    commitMsg: 'test: add integration tests for auth service endpoints',
    author: 'john.doe',
    status: 'success',
    duration: '2m 10s',
    triggeredAt: moment().subtract(30, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '1d 6h ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '2s' },
      { name: 'Build',        status: 'success', duration: '1m 05s' },
      { name: 'Test',         status: 'success', duration: '35s' },
      { name: 'Docker Build', status: 'success', duration: '28s' },
      { name: 'Deploy',       status: 'success', duration: '0s' },
    ],
  },
  {
    id: 'pipe-000',
    name: 'Deploy to Production',
    branch: 'main',
    commit: 'b4c5d6e',
    commitMsg: 'fix: database connection pool exhaustion under load',
    author: 'ci-bot',
    status: 'failed',
    duration: '3m 05s',
    triggeredAt: moment().subtract(36, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '1d 12h ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '1s' },
      { name: 'Build',        status: 'success', duration: '1m 40s' },
      { name: 'Test',         status: 'failed',  duration: '44s' },
      { name: 'Docker Build', status: 'pending', duration: '-' },
      { name: 'Deploy',       status: 'pending', duration: '-' },
    ],
  },
  {
    id: 'pipe-previous',
    name: 'Deploy to Production',
    branch: 'main',
    commit: 'f7g8h9i',
    commitMsg: 'feat: role-based access control for admin panel',
    author: 'ci-bot',
    status: 'success',
    duration: '4m 50s',
    triggeredAt: moment().subtract(48, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    timeAgo: '2d ago',
    stages: [
      { name: 'Source',       status: 'success', duration: '2s' },
      { name: 'Build',        status: 'success', duration: '1m 58s' },
      { name: 'Test',         status: 'success', duration: '1m 02s' },
      { name: 'Docker Build', status: 'success', duration: '1m 15s' },
      { name: 'Deploy',       status: 'success', duration: '33s' },
    ],
  }
];

// ─── Log Stream ────────────────────────────────────────────────────────────────
let logsList = [];
const servicesLogNames = ['api-gateway', 'worker', 'database', 'cache', 'auth', 'cdn', 'scheduler', 'nginx', 'postgres'];

const logMsgs = [
  // INFO — normal operations
  'Request processed successfully — GET /api/v2/users (200) 42ms',
  'Request processed successfully — POST /api/v2/auth/login (200) 18ms',
  'Request processed successfully — GET /api/v2/dashboard/stats (200) 12ms',
  'Health check passed — all services operational',
  'Health check: 12/12 load balancer targets healthy in us-east-1',
  'Cache invalidated for user session pool — 4,521 entries cleared',
  'Background job completed: email-notifications delivered to 1,247 users',
  'Database backup completed successfully — 14.2 GB archived to S3 (us-east-1)',
  'CDN cache hit ratio: 94.7% over last 1-hour window',
  'Auto-scaling event: added 2 nodes to api-gateway ASG (capacity: 5 → 7)',
  'Auto-scaling event: removed 1 node from api-gateway ASG (capacity: 7 → 6)',
  'API rate limiting config reloaded — 1,000 req/min per tenant applied',
  'Deployment pipeline pipe-008 finished. Released v2.4.1 to production',
  'Secret rotation scheduled for auth-service in 24h — operator action required',
  'SSL certificate renewed for api.company.com — expires 2027-06-14',
  'Database vacuum completed — 238 MB reclaimed from dead tuples',
  'Redis BGSAVE completed — RDB snapshot persisted to /data/dump.rdb',
  'Nginx upstream reload triggered — 0 connections dropped (graceful)',
  // WARN — degraded or elevated
  'High memory usage on cache — 82% consumed, approaching threshold',
  'Replication lag detected — replica lag: 2.4s (threshold: 5s)',
  'Slow query detected — GET /api/v2/reports/monthly took 1,240ms (threshold: 500ms)',
  'Rate limit approaching — tenant acme-corp at 890/1000 req/min',
  'Disk usage at 78% on volume /dev/xvda1 — consider expanding',
  // ERROR — failures
  'Connection pool exhausted — all 20 PostgreSQL connections in use',
  'Webhook delivery failed — endpoint https://hooks.customer.io/xyz returned 503',
  'Container prometheus restarted due to OOMKilled (restarts: 3)',
  'Auth token validation failed — invalid signature for token issued at 08:12 UTC',
  'Timeout: /api/v2/analytics/export exceeded 30s limit, request aborted',
];

// Seed 80 initial log entries across the past ~40 minutes
for (let i = 0; i < 80; i++) {
  const rand = Math.random();
  const level = rand < 0.65 ? 'INFO' : rand < 0.85 ? 'WARN' : 'ERROR';
  const msgPool = level === 'INFO'
    ? logMsgs.slice(0, 18)
    : level === 'WARN'
    ? logMsgs.slice(18, 23)
    : logMsgs.slice(23);

  logsList.push({
    id: uuidv4(),
    level,
    service: servicesLogNames[Math.floor(Math.random() * servicesLogNames.length)],
    message: msgPool[Math.floor(Math.random() * msgPool.length)],
    timestamp: moment().subtract(i * 30, 'seconds').format('YYYY-MM-DD HH:mm:ss'),
  });
}

// ─── Simulation Timers ─────────────────────────────────────────────────────────

// 1. Metric fluctuation — keeps CPU/RAM values realistic
setInterval(() => {
  services.forEach(svc => {
    if (svc.status === 'healthy') {
      svc.metrics.cpu    = parseFloat(Math.max(3,  Math.min(90, svc.metrics.cpu    + (Math.random() - 0.5) * 6)).toFixed(1));
      svc.metrics.memory = parseFloat(Math.max(8,  Math.min(90, svc.metrics.memory + (Math.random() - 0.5) * 4)).toFixed(1));
      svc.responseTime   = Math.floor(Math.random() * 20 + 30) + 'ms';
    } else if (svc.status === 'warning') {
      svc.metrics.cpu    = parseFloat(Math.max(55, Math.min(98, svc.metrics.cpu    + (Math.random() - 0.5) * 8)).toFixed(1));
      svc.metrics.memory = parseFloat(Math.max(60, Math.min(98, svc.metrics.memory + (Math.random() - 0.5) * 5)).toFixed(1));
    }
  });

  containers.forEach(cnt => {
    if (cnt.status === 'running') {
      cnt.cpu    = parseFloat(Math.max(1,  Math.min(92, cnt.cpu    + (Math.random() - 0.5) * 5)).toFixed(1));
      cnt.memory = parseFloat(Math.max(4,  Math.min(92, cnt.memory + (Math.random() - 0.5) * 3)).toFixed(1));
    }
  });
}, 3000);

// 2. Pipeline stage progression — advances running pipelines
setInterval(() => {
  pipelines.forEach(pipe => {
    if (pipe.status !== 'running') return;

    const currentStage = pipe.stages.find(s => s.status === 'running' || s.status === 'pending');
    if (currentStage) {
      if (currentStage.status === 'pending') {
        currentStage.status = 'running';
        currentStage.duration = 'running...';
      } else {
        currentStage.status = 'success';
        currentStage.duration = `${Math.floor(Math.random() * 40 + 10)}s`;
      }
    } else {
      // All stages done — finalize pipeline
      pipe.status   = 'success';
      pipe.duration = '3m 42s';

      const newDep = {
        id:          `DEP-${1043 + deployments.length}`,
        version:     `v2.4.${deployments.length + 1}`,
        status:      'success',
        environment: activeEnvironment,
        duration:    '3m 42s',
        deployedBy:  pipe.author,
        commit:      pipe.commit,
        commitMsg:   pipe.commitMsg,
        branch:      pipe.branch,
        timestamp:   moment().format('YYYY-MM-DD HH:mm:ss'),
        timeAgo:     'Just now',
      };
      deployments.unshift(newDep);

      logsList.push({
        id:        uuidv4(),
        level:     'INFO',
        service:   'scheduler',
        message:   `Pipeline ${pipe.id} completed. Released ${newDep.version} to ${activeEnvironment}.`,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      });
    }
  });
}, 2500);

// 3. Continuous log stream — mimics a tailed syslog
setInterval(() => {
  const rand  = Math.random();
  const level = rand < 0.65 ? 'INFO' : rand < 0.85 ? 'WARN' : 'ERROR';
  const msgPool = level === 'INFO'
    ? logMsgs.slice(0, 18)
    : level === 'WARN'
    ? logMsgs.slice(18, 23)
    : logMsgs.slice(23);

  logsList.push({
    id:        uuidv4(),
    level,
    service:   servicesLogNames[Math.floor(Math.random() * servicesLogNames.length)],
    message:   msgPool[Math.floor(Math.random() * msgPool.length)],
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  });

  // Rolling window — keep last 300 entries
  if (logsList.length > 300) logsList.shift();
}, 4000);

// ─── Environment Context ───────────────────────────────────────────────────────
const setEnvironment = (env) => { activeEnvironment = env.toLowerCase(); };
const getEnvironment = () => activeEnvironment;

// ─── Queries ───────────────────────────────────────────────────────────────────
const getServices    = () => services;
const getContainers  = () => containers;
const getDeployments = () => deployments;
const getIncidents   = () => incidents;

const getEnvironments = () => {
  return [
    {
      id:                'env-prod',
      name:              'Production',
      slug:              'production',
      status:            incidents.some(i => i.environment === 'production' && i.status !== 'resolved') ? 'degraded' : 'operational',
      region:            'us-east-1 + eu-west-1',
      version:           deployments.find(d => d.environment === 'production' && d.status === 'success')?.version || 'v2.4.1',
      lastDeployment:    moment().subtract(4, 'hours').format('YYYY-MM-DD HH:mm'),
      lastDeploymentAgo: '4h ago',
      deployedBy:        'ci-bot',
      services:          12,
      containers:        24,
      uptime:            '99.98%',
      nodes:             5,
      traffic:           '45.2K req/min',
    },
    {
      id:                'env-staging',
      name:              'Staging',
      slug:              'staging',
      status:            incidents.some(i => i.environment === 'staging' && i.status !== 'resolved') ? 'degraded' : 'operational',
      region:            'us-east-1',
      version:           deployments.find(d => d.environment === 'staging' && d.status === 'success')?.version || 'v2.4.0',
      lastDeployment:    moment().subtract(6, 'hours').format('YYYY-MM-DD HH:mm'),
      lastDeploymentAgo: '6h ago',
      deployedBy:        'jane.smith',
      services:          12,
      containers:        12,
      uptime:            '99.72%',
      nodes:             2,
      traffic:           '2.4K req/min',
    },
    {
      id:                'env-dev',
      name:              'Development',
      slug:              'development',
      status:            incidents.some(i => i.environment === 'development' && i.status !== 'resolved') ? 'degraded' : 'operational',
      region:            'localhost / Docker',
      version:           'v2.4.2-dev',
      lastDeployment:    moment().subtract(15, 'minutes').format('YYYY-MM-DD HH:mm'),
      lastDeploymentAgo: '15m ago',
      deployedBy:        'john.doe',
      services:          8,
      containers:        8,
      uptime:            '94.20%',
      nodes:             1,
      traffic:           '120 req/min',
    },
  ];
};

const getCiCdActivity = () => pipelines;

const getLogs = (limit = 50, level = null, search = null) => {
  let filtered = [...logsList].reverse();
  if (level && level !== 'ALL') {
    filtered = filtered.filter(l => l.level === level.toUpperCase());
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.message.toLowerCase().includes(q) ||
      l.service.toLowerCase().includes(q)
    );
  }
  return filtered.slice(0, limit);
};

const getMetrics = () => {
  const hours  = Array.from({ length: 24 }, (_, i) => moment().subtract(23 - i, 'hours').format('HH:mm'));
  const isProd = activeEnvironment === 'production';
  const isStg  = activeEnvironment === 'staging';

  const baseCpu  = isProd ? 55 : isStg ? 25 : 12;
  const baseRam  = isProd ? 74 : isStg ? 45 : 22;

  return {
    labels:   hours,
    cpu:      generateMetricHistory(baseCpu, 15),
    ram:      generateMetricHistory(baseRam, 8),
    disk:     generateMetricHistory(72, 2),
    network:  generateMetricHistory(isProd ? 45 : isStg ? 10 : 1, 10),
    requests: generateMetricHistory(isProd ? 2200 : isStg ? 450 : 25, 200),
    errors:   generateMetricHistory(2, 2),
    summary: {
      cpu: {
        current: parseFloat((baseCpu + (Math.random() - 0.5) * 8).toFixed(1)),
        avg:     baseCpu,
        peak:    baseCpu + 25,
      },
      ram: {
        current: parseFloat((baseRam + (Math.random() - 0.5) * 4).toFixed(1)),
        total:   isProd ? '64 GB' : isStg ? '16 GB' : '8 GB',
        used:    isProd ? '44.8 GB' : isStg ? '7.2 GB' : '1.8 GB',
      },
      disk: {
        current: 72.4,
        total:   '500 GB',
        used:    '362 GB',
      },
      network: {
        in:    isProd ? '1.24 GB/s' : isStg ? '124 MB/s' : '1.2 MB/s',
        out:   isProd ? '0.87 GB/s' : isStg ? '84 MB/s'  : '0.8 MB/s',
        total: isProd ? '2.11 GB/s' : isStg ? '208 MB/s' : '2.0 MB/s',
      },
    },
  };
};

const getDashboardMetrics = () => {
  const days = Array.from({ length: 14 }, (_, i) => moment().subtract(13 - i, 'days').format('MMM DD'));
  return {
    labels: days,
    uptime: generateMetricHistory(99.9, 0.05),
    deploymentSuccess: [4, 5, 2, 7, 6, 8, 4, 9, 5, 3, 6, 7, 8, 5],
    deploymentFailed:  [0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  };
};

const getContainerMetrics = () => {
  const hours = Array.from({ length: 24 }, (_, i) => moment().subtract(23 - i, 'hours').format('HH:mm'));
  return {
    labels: hours,
    cpuAvg: generateMetricHistory(15, 5),
    memAvg: generateMetricHistory(25, 8),
    restarts: generateMetricHistory(0.5, 0.5).map(v => Math.round(v)),
  };
};

const getDeploymentMetrics = () => {
  const days = Array.from({ length: 14 }, (_, i) => moment().subtract(13 - i, 'days').format('MMM DD'));
  return {
    labels: days,
    success: [4, 5, 2, 7, 6, 8, 4, 9, 5, 3, 6, 7, 8, 5],
    failed:  [0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    frequency: [4, 6, 2, 7, 8, 8, 5, 9, 5, 4, 6, 7, 9, 5],
  };
};

const getCicdMetrics = () => {
  const runs = Array.from({ length: 10 }, (_, i) => `Run #${100 - i}`).reverse();
  return {
    labels: runs,
    durations: [120, 145, 110, 180, 210, 105, 134, 150, 140, 165],
    successRate: generateMetricHistory(94, 3),
  };
};

/**
 * Aggregated dashboard data — single endpoint for the overview page.
 * In production this would aggregate Prometheus metrics, Kubernetes API,
 * and your deployment DB in parallel.
 */
const getDashboard = () => {
  const envData        = getEnvironments().find(e => e.slug === activeEnvironment) || getEnvironments()[0];
  const activeIncidents = incidents.filter(i => i.environment === activeEnvironment && i.status !== 'resolved').length;
  const allDeployments  = deployments.filter(d => d.environment === activeEnvironment);
  const successCount    = allDeployments.filter(d => d.status === 'success').length;
  const successRate     = allDeployments.length > 0
    ? Math.round((successCount / allDeployments.length) * 100)
    : 100;

  return {
    totalServices:           envData.services,
    healthyServices:         envData.services - (activeIncidents > 0 ? 1 : 0),
    runningContainers:       containers.filter(c => c.status === 'running').length,
    totalContainers:         containers.length,
    successfulDeployments:   successCount,
    totalDeployments:        allDeployments.length,
    deploymentSuccessRate:   successRate,
    incidentCount:           activeIncidents,
    activeEnvironments:      3,
    uptimePercentage:        envData.uptime,
    avgResponseTime:         activeIncidents > 0 ? '78ms' : '42ms',
    traffic:                 envData.traffic,
    region:                  envData.region,
  };
};

// Alias kept for backward compat
const getDashboardStats = getDashboard;

const getTeamActivity = () => [
  { action: 'Deploy triggered',    user: 'ci-bot',      target: 'production v2.4.1', time: '4h ago' },
  { action: 'Incident resolved',   user: 'john.doe',    target: 'INC-0891',          time: '3h ago' },
  { action: 'Container restarted', user: 'jane.smith',  target: 'prometheus',        time: '8h ago' },
  { action: 'Rollback executed',   user: 'ops-team',    target: 'staging v2.3.9',   time: '10h ago' },
];

// ─── Mutations ────────────────────────────────────────────────────────────────
const mutateRestartService = (id) => {
  const svc = services.find(s => s.id === id);
  if (!svc) return false;

  svc.status       = 'restarting';
  svc.responseTime = 'N/A';

  logsList.push({
    id:        uuidv4(),
    level:     'WARN',
    service:   svc.id.replace('svc-', ''),
    message:   `Restart triggered for service ${svc.name}. Stopping process...`,
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  });

  setTimeout(() => {
    svc.status       = 'healthy';
    svc.responseTime = '42ms';
    logsList.push({
      id:        uuidv4(),
      level:     'INFO',
      service:   svc.id.replace('svc-', ''),
      message:   `Service ${svc.name} restarted successfully. Listening on assigned port.`,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  }, 5000);

  return true;
};

const mutateRestartContainer = (id) => {
  const cnt = containers.find(c => c.id === id || c.name === id);
  if (!cnt) return false;

  cnt.status   = 'restarting';
  cnt.restarts += 1;
  cnt.cpu      = 0;
  cnt.memory   = 0;

  logsList.push({
    id:        uuidv4(),
    level:     'WARN',
    service:   cnt.name,
    message:   `Docker daemon issued restart for container ${cnt.name}. Stopping child process...`,
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  });

  setTimeout(() => {
    cnt.status = 'running';
    cnt.cpu    = 12.4;
    cnt.memory = 28.1;
    logsList.push({
      id:        uuidv4(),
      level:     'INFO',
      service:   cnt.name,
      message:   `Container ${cnt.name} restarted successfully. Main process initialized.`,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  }, 5000);

  return true;
};

const mutateStopContainer = (id) => {
  const cnt = containers.find(c => c.id === id || c.name === id);
  if (!cnt) return false;

  cnt.status = 'stopped';
  cnt.cpu    = 0;
  cnt.memory = 0;

  logsList.push({
    id:        uuidv4(),
    level:     'ERROR',
    service:   cnt.name,
    message:   `Docker daemon issued SIGTERM for container ${cnt.name}. Process terminated.`,
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  });

  return true;
};

const mutateTriggerDeployment = (branch, commitMsg) => {
  const id = `pipe-${String(pipelines.length + 1).padStart(3, '0')}`;
  const newPipe = {
    id,
    name:        `Deploy to ${activeEnvironment.charAt(0).toUpperCase() + activeEnvironment.slice(1)}`,
    branch:      branch || 'main',
    commit:      Math.random().toString(36).substring(2, 9),
    commitMsg:   commitMsg || 'Manual deployment trigger',
    author:      'operator-session',
    status:      'running',
    duration:    'in progress...',
    triggeredAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    timeAgo:     'Just now',
    stages: [
      { name: 'Source',       status: 'pending', duration: '-' },
      { name: 'Build',        status: 'pending', duration: '-' },
      { name: 'Test',         status: 'pending', duration: '-' },
      { name: 'Docker Build', status: 'pending', duration: '-' },
      { name: 'Deploy',       status: 'pending', duration: '-' },
    ],
  };

  pipelines.unshift(newPipe);

  logsList.push({
    id:        uuidv4(),
    level:     'INFO',
    service:   'scheduler',
    message:   `Pipeline ${id} queued for branch: ${newPipe.branch} (${newPipe.commit})`,
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  });

  return newPipe;
};

const mutateIncidentStatus = (id, status, rootCause = null, notes = null) => {
  const inc = incidents.find(i => i.id === id);
  if (!inc) return false;

  inc.status = status;
  if (status === 'resolved') {
    inc.resolvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    inc.duration   = '24 mins';
  }
  if (rootCause) inc.rootCause       = rootCause;
  if (notes)     inc.resolutionNotes = notes;

  logsList.push({
    id:        uuidv4(),
    level:     'INFO',
    service:   'ops-manager',
    message:   `Incident ${inc.id} updated to ${status.toUpperCase()} by operator.`,
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  });

  return true;
};

const mutateRecalculateStats = () => {
  services.forEach(svc => {
    if (svc.status === 'healthy') {
      svc.metrics.cpu    = parseFloat((Math.random() * 20 + 8).toFixed(1));
      svc.metrics.memory = parseFloat((Math.random() * 30 + 15).toFixed(1));
    }
  });
  containers.forEach(cnt => {
    if (cnt.status === 'running') {
      cnt.cpu    = parseFloat((Math.random() * 15 + 4).toFixed(1));
      cnt.memory = parseFloat((Math.random() * 20 + 10).toFixed(1));
    }
  });
  return true;
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function generateMetricHistory(base, variance) {
  return Array.from({ length: 24 }, () =>
    parseFloat(Math.max(0, base + (Math.random() - 0.5) * variance * 2).toFixed(1))
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  getServices,
  getContainers,
  getDeployments,
  getMetrics,
  getLogs,
  getIncidents,
  getEnvironments,
  getCiCdActivity,
  getDashboard,
  getDashboardStats,
  setEnvironment,
  getEnvironment,
  getTeamActivity,

  // Mutations
  mutateRestartService,
  mutateRestartContainer,
  mutateStopContainer,
  mutateTriggerDeployment,
  mutateIncidentStatus,
  mutateRecalculateStats,
  getDashboardMetrics,
  getContainerMetrics,
  getDeploymentMetrics,
  getCicdMetrics,
};
