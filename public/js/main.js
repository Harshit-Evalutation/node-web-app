/**
 * OpsCenter — Main Client JavaScript
 * Implementing functional integrations with centralized mock state endpoints.
 */

/* ─── Real-time Clock ────────────────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('current-time');
  const dateEl = document.getElementById('current-date');

  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

setInterval(updateClock, 1000);
updateClock();

/* ─── Notification / Toast System ────────────────────────────────────── */
function showNotification(message, type = 'info') {
  const colors = {
    info: 'border-color: rgba(59, 130, 246, 0.4); background-color: rgba(59, 130, 246, 0.1); color: #60A5FA;',
    success: 'border-color: rgba(34, 197, 94, 0.4); background-color: rgba(34, 197, 94, 0.1); color: #34D399;',
    warning: 'border-color: rgba(245, 158, 11, 0.4); background-color: rgba(245, 158, 11, 0.1); color: #FBBF24;',
    error: 'border-color: rgba(239, 68, 68, 0.4); background-color: rgba(239, 68, 68, 0.1); color: #F87171;',
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 10000;
    padding: 12px 18px;
    border: 1px solid;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    max-width: 320px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    transition: opacity 0.2s ease, transform 0.2s ease;
    opacity: 0;
    transform: translateY(-8px);
    ${colors[type] || colors.info}
  `;
  
  toast.textContent = `[SYSTEM] ${message.toUpperCase()}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

/* ─── Modal Utility ──────────────────────────────────────────────────── */
function createModal(title, bodyHtml) {
  const oldModal = document.getElementById('opscenter-modal');
  if (oldModal) oldModal.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'opscenter-modal';
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="closeActiveModal()">&times;</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer">
        <button class="btn btn-primary btn-sm" onclick="closeActiveModal()">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeActiveModal();
  });
}

function closeActiveModal() {
  const modal = document.getElementById('opscenter-modal');
  if (modal) modal.remove();
}

/* ─── Environment Selector ───────────────────────────────────────────── */
function switchEnvironment(env) {
  fetch('/api/environments/switch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ environment: env })
  })
  .then(res => res.json())
  .then(data => {
    showNotification(`Switched targeting environment context to: ${data.environment.toUpperCase()}`, 'success');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  })
  .catch(err => showNotification(`Switch failed: ${err.message}`, 'error'));
}

/* ─── Refresh Metrics ────────────────────────────────────────────────── */
function triggerSyncStats() {
  showNotification('Recalculating cluster stats and polling nodes...', 'info');
  fetch('/api/stats/refresh', {
    method: 'POST'
  })
  .then(res => res.json())
  .then(data => {
    showNotification('System stats synchronized successfully.', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  })
  .catch(err => showNotification(`Sync failed: ${err.message}`, 'error'));
}

/* ─── Services Actions ───────────────────────────────────────────────── */
function restartService(serviceId, name) {
  showNotification(`Restart service command received: ${name}`, 'info');
  
  // Optimistically set Status to restarting
  const badge = document.querySelector(`.badge[data-service-status="${serviceId}"]`);
  if (badge) {
    badge.className = 'badge badge-warning';
    badge.textContent = 'restarting';
  }

  fetch('/api/services/restart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: serviceId })
  })
  .then(res => res.json())
  .then(data => {
    showNotification(`Reboot signal acknowledged for ${name}`, 'success');
    // Poll/refresh after 5 seconds
    setTimeout(() => {
      window.location.reload();
    }, 5200);
  })
  .catch(err => showNotification(`Restart failed: ${err.message}`, 'error'));
}

function viewServiceDetails(serviceId, name, type, uptime, latency, rpm, cpu, ram) {
  const detailsHtml = `
    <div style="font-family: var(--font-mono); font-size: 11px; display: flex; flex-direction: column; gap: 10px;">
      <div><span style="color: var(--text-muted);">SERVICE ID:</span> <span style="color: var(--text-primary);">${serviceId}</span></div>
      <div><span style="color: var(--text-muted);">NAME:</span> <span style="color: var(--text-primary);">${name}</span></div>
      <div><span style="color: var(--text-muted);">TYPE:</span> <span style="color: var(--info);">${type}</span></div>
      <div><span style="color: var(--text-muted);">UPTIME RATIO:</span> <span style="color: var(--success);">${uptime}</span></div>
      <div><span style="color: var(--text-muted);">CURRENT LATENCY:</span> <span style="color: var(--text-primary);">${latency}</span></div>
      <div><span style="color: var(--text-muted);">REQUESTS THROUGHPUT:</span> <span style="color: var(--text-primary);">${rpm}</span></div>
      <div style="border-top: 1px solid var(--border); padding-top: 10px;">
        <span style="color: var(--text-muted); display: block; margin-bottom: 4px;">RESOURCE METRICS:</span>
        <div>CPU: <strong>${cpu}%</strong></div>
        <div>RAM: <strong>${ram}%</strong></div>
      </div>
    </div>
  `;
  createModal(`SERVICE METADATA SPEC: ${name.toUpperCase()}`, detailsHtml);
}

/* ─── Container Operations ───────────────────────────────────────────── */
function restartContainer(containerName, containerId) {
  showNotification(`Issuing reboot command for container: ${containerName}`, 'info');

  const row = document.querySelector(`tr[data-container="${containerName}"]`);
  if (row) {
    const badge = row.querySelector('.status-badge') || row.querySelector('.badge');
    const dot = row.querySelector('.status-dot');
    if (badge) {
      badge.className = 'badge badge-warning';
      badge.textContent = 'restarting';
    }
    if (dot) {
      dot.className = 'status-dot warning';
    }
  }

  fetch('/api/containers/restart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: containerId })
  })
  .then(res => res.json())
  .then(data => {
    showNotification(`Restart completed successfully for ${containerName}`, 'success');
    setTimeout(() => {
      window.location.reload();
    }, 5200);
  })
  .catch(err => showNotification(`Restart failed: ${err.message}`, 'error'));
}

function stopContainer(containerName, containerId) {
  showNotification(`Issuing SIGTERM daemon command for container: ${containerName}`, 'warning');

  const row = document.querySelector(`tr[data-container="${containerName}"]`);
  if (row) {
    const badge = row.querySelector('.status-badge') || row.querySelector('.badge');
    const dot = row.querySelector('.status-dot');
    if (badge) {
      badge.className = 'badge badge-error';
      badge.textContent = 'stopped';
    }
    if (dot) {
      dot.className = 'status-dot down';
    }
  }

  fetch('/api/containers/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: containerId })
  })
  .then(res => res.json())
  .then(data => {
    showNotification(`Stopped container: ${containerName}`, 'error');
  })
  .catch(err => showNotification(`Stop failed: ${err.message}`, 'error'));
}

function inspectContainer(containerName, image, created, ports) {
  const inspectHtml = `
    <div style="font-family: var(--font-mono); font-size: 11px; display: flex; flex-direction: column; gap: 8px;">
      <div><span style="color: var(--text-muted);">NAME:</span> <span style="color: var(--text-primary);">${containerName}</span></div>
      <div><span style="color: var(--text-muted);">DOCKER IMAGE:</span> <span style="color: var(--info);">${image}</span></div>
      <div><span style="color: var(--text-muted);">PORTS MAPPING:</span> <span style="color: var(--text-primary);">${ports}</span></div>
      <div><span style="color: var(--text-muted);">CREATED AT:</span> <span style="color: var(--text-primary);">${created}</span></div>
      <div style="border-top: 1px solid var(--border); padding-top: 10px; margin-top: 6px;">
        <span style="color: var(--text-muted); display: block; margin-bottom: 4px;">DOCKER DAEMON SPECS:</span>
        <div>Mounts: <i>/var/run/docker.sock</i></div>
        <div>Network Mode: <i>bridge</i></div>
        <div>Restart Policy: <i>unless-stopped</i></div>
      </div>
    </div>
  `;
  createModal(`INSPECT CONTAINER: ${containerName.toUpperCase()}`, inspectHtml);
}

function viewContainerLogs(containerName) {
  fetch(`/api/logs?limit=20&search=${containerName}`)
  .then(res => res.json())
  .then(resp => {
    const logs = resp.data.length ? resp.data : [{ timestamp: new Date().toISOString(), message: 'No logs found for this container target.' }];
    const logsHtml = `
      <div style="background-color: #060606; border: 1px solid var(--border); border-radius: 4px; padding: 12px; font-family: var(--font-mono); font-size: 11px; max-height: 250px; overflow-y: auto; color: #E4E4E7; display: flex; flex-direction: column; gap: 4px;">
        ${logs.map(log => `<div><span style="color: var(--text-muted);">${log.timestamp}</span> ${log.message}</div>`).join('')}
      </div>
    `;
    createModal(`STDOUT/STDERR CONTAINER LOGS: ${containerName.toUpperCase()}`, logsHtml);
  })
  .catch(err => showNotification(`Failed to fetch logs: ${err.message}`, 'error'));
}

/* ─── Incident Center Actions ────────────────────────────────────────── */
function updateIncidentStatus(incidentId, status) {
  showNotification(`Updating incident status for ${incidentId}...`, 'info');

  fetch('/api/incidents/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: incidentId, status: status })
  })
  .then(res => res.json())
  .then(data => {
    showNotification(`Incident status verified: ${status.toUpperCase()}`, 'success');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  })
  .catch(err => showNotification(`Update failed: ${err.message}`, 'error'));
}

function acknowledgeIncident(id) {
  updateIncidentStatus(id, 'acknowledged');
}

function resolveIncident(id) {
  updateIncidentStatus(id, 'resolved');
}

/* ─── Pipeline Trigger Simulation ────────────────────────────────────── */
function openTriggerPipelineModal() {
  const modalHtml = `
    <form id="trigger-pipeline-form" onsubmit="submitPipelineTrigger(event)" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label for="pipeline-branch" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Git Branch Target</label>
        <input type="text" id="pipeline-branch" class="form-control form-control-mono" placeholder="main, release, hotfix..." required value="main">
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label for="pipeline-commit" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Commit Message / Release Note</label>
        <input type="text" id="pipeline-commit" class="form-control" placeholder="e.g. feat: add payment API gateway" required>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeActiveModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Launch Run</button>
      </div>
    </form>
  `;
  createModal("TRIGGER NEW RUNTIME WORKFLOW", modalHtml);
  
  // Focus the commit message input automatically
  setTimeout(() => {
    const commitInput = document.getElementById('pipeline-commit');
    if (commitInput) commitInput.focus();
  }, 100);
}

function submitPipelineTrigger(event) {
  event.preventDefault();
  const branch = document.getElementById('pipeline-branch').value;
  const commitMsg = document.getElementById('pipeline-commit').value;
  closeActiveModal();
  triggerDeployment(branch, commitMsg);
}

function triggerDeployment(branch, commitMsg) {
  showNotification('Triggering CI/CD build run...', 'info');

  fetch('/api/deployments/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ branch, commitMsg })
  })
  .then(res => res.json())
  .then(data => {
    showNotification('CI/CD pipeline execution active.', 'success');
    // Reload page immediately to show the running pipeline node
    setTimeout(() => {
      window.location.reload();
    }, 600);
  })
  .catch(err => showNotification(`Trigger failed: ${err.message}`, 'error'));
}

/* ─── Log Viewer Live Tail & Client Filters ────────────────────────── */
let liveTailInterval = null;
function toggleLiveTail() {
  const btn = document.getElementById('live-tail-btn');
  const termBody = document.getElementById('terminal-body');
  
  if (!btn || !termBody) return;

  if (liveTailInterval) {
    clearInterval(liveTailInterval);
    liveTailInterval = null;
    btn.textContent = 'Start Live Tail';
    btn.classList.remove('btn-danger');
    btn.classList.add('btn-primary');
    showNotification('Live tail stream closed.', 'info');
  } else {
    btn.textContent = 'Stop Live Tail';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-danger');
    showNotification('Listening to stdout live stream...', 'success');

    liveTailInterval = setInterval(() => {
      const searchVal = document.getElementById('client-search')?.value || '';
      const levelVal = document.getElementById('client-level')?.value || 'ALL';

      fetch(`/api/logs?limit=50&level=${levelVal}&search=${searchVal}`)
      .then(res => res.json())
      .then(resp => {
        if (!resp.data) return;
        termBody.innerHTML = '';
        resp.data.forEach(log => {
          const row = document.createElement('div');
          row.className = 'log-row';
          row.innerHTML = `
            <span class="log-timestamp">${log.timestamp}</span>
            <span class="log-level ${log.level.toLowerCase()}">${log.level}</span>
            <span class="log-service">${log.service}</span>
            <span class="log-message">${log.message}</span>
          `;
          termBody.appendChild(row);
        });
        termBody.scrollTop = termBody.scrollHeight;
      });
    }, 2500);
  }
}

function applyClientFilters() {
  const searchVal = document.getElementById('client-search')?.value.toLowerCase() || '';
  const levelVal = document.getElementById('client-level')?.value || 'ALL';
  const rows = document.querySelectorAll('.log-row');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const lvlBadge = row.querySelector('.log-level');
    const lvl = lvlBadge ? lvlBadge.textContent.toUpperCase() : '';
    
    const matchesSearch = text.includes(searchVal);
    const matchesLevel = (levelVal === 'ALL' || lvl === levelVal);

    if (matchesSearch && matchesLevel) {
      row.style.display = 'flex';
    } else {
      row.style.display = 'none';
    }
  });
}

function pollSidebarStats() {
  fetch('/api/dashboard')
    .then(res => res.json())
    .then(resp => {
      if (resp.status === 'success' && resp.data) {
        const d = resp.data;
        const svcBadge = document.querySelector('a[href="/services"] .sidebar-badge');
        if (svcBadge) {
          svcBadge.textContent = `${d.healthyServices}/${d.totalServices}`;
        }
        const cntBadge = document.querySelector('a[href="/containers"] .sidebar-badge');
        if (cntBadge) {
          cntBadge.textContent = d.runningContainers;
        }
        const incBadge = document.querySelector('a[href="/incidents"] .sidebar-badge');
        if (incBadge) {
          if (d.incidentCount > 0) {
            if (!incBadge.classList.contains('danger')) incBadge.classList.add('danger');
            incBadge.textContent = d.incidentCount;
            incBadge.style.display = 'inline-block';
          } else {
            incBadge.style.display = 'none';
          }
        }
      }
    })
    .catch(err => console.error('Failed to poll stats:', err));
}

// Bind search listener
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('client-search');
  const levelSelect = document.getElementById('client-level');
  
  if (searchInput) {
    searchInput.addEventListener('input', applyClientFilters);
  }
  if (levelSelect) {
    levelSelect.addEventListener('change', applyClientFilters);
  }

  // Periodic pipeline reloader (reloads every 5 seconds if there's an active pipeline running)
  const isCicdPage = document.querySelector('.pipeline-node.running');
  if (isCicdPage) {
    setInterval(() => {
      window.location.reload();
    }, 5000);
  }

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeActiveModal();
    }
  });

  // Start periodic sidebar stats refresh
  pollSidebarStats();
  setInterval(pollSidebarStats, 30000);
});
