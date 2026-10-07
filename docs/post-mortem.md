# Post-Mortem Report — ML Service Outage

> **Incident ID**: INC-001
> **Date**: `<FILL: YYYY-MM-DD>`
> **Severity**: Critical
> **Author**: `<FILL: Your Name>`

---

## 1. Incident Summary

The ML service (`farmer_ml_service`) became unavailable, causing all `/api/crop`
and `/api/disease` requests routed through the backend to return **503 Service
Unavailable** errors. The frontend crop recommendation and disease detection
features were completely non-functional for the duration of the outage.

---

## 2. Impact

- **User-facing impact**: Crop recommendation and disease detection features returned errors to all users.
- **Duration**: `<FILL: e.g., ~5 minutes>`
- **Requests affected**: `<FILL: e.g., ~XX requests returned 5xx>`
- **Availability SLI during incident**: `<FILL: e.g., dropped to ~85%>`
- **Error budget consumed**: `<FILL: e.g., 60% of the 30-minute budget>`
- **Other services**: Auth, Weather, and Market routes on the backend remained fully functional. The frontend was up but displayed errors for ML-dependent features.

---

## 3. Detection

- **Method**: Prometheus recording rule `sli:availability:rate5m` dropped below the 99% SLO threshold.
- **Alert fired**: `HighErrorRate_SLO_Breach` transitioned to FIRING state after 2 minutes of sustained SLO breach.
- **Time to detection**: `<FILL: e.g., ~2 minutes after the incident started>`
- **Observed in**: Grafana "Farmer Helper SLO" dashboard — Availability SLI gauge turned red, Error Budget gauge depleted.

---

## 4. Root Cause

The `farmer_ml_service` Docker container was stopped (simulating a crash). Since
the backend connects to the ML service via `ML_SERVICE_URL` (http://ml_service:5001),
all HTTP requests to the ML service received `ECONNREFUSED`. The backend's crop
and disease controllers caught these errors and returned 503 to the client.

**Contributing factors**:
- No automatic restart policy active during the simulation (container was manually stopped).
- No circuit breaker or fallback in the backend when the ML service is unreachable.
- The `docker-compose.prod.yml` includes `restart: unless-stopped`, which would auto-recover from a real crash — but not from a manual `docker stop`.

---

## 5. Timeline

| Time (UTC) | Event |
|------------|-------|
| `<FILL>` | ML service container stopped (`docker stop farmer_ml_service`) |
| `<FILL>` | First 503 errors observed in backend logs |
| `<FILL>` | Availability SLI drops below 99% on Grafana SLO dashboard |
| `<FILL>` | `HighErrorRate_SLO_Breach` alert transitions to PENDING |
| `<FILL>` | Alert transitions to FIRING (after 2-minute `for` duration) |
| `<FILL>` | Investigation begins — Loki logs queried for `ECONNREFUSED` |
| `<FILL>` | Root cause identified — ml_service container is stopped |
| `<FILL>` | ML service container restarted (`docker start farmer_ml_service`) |
| `<FILL>` | `/health` endpoint returns 200 — service confirmed up |
| `<FILL>` | Error rate returns to zero, SLI begins recovering |
| `<FILL>` | Alert transitions back to INACTIVE |
| `<FILL>` | Availability SLI recovers above 99% |

---

## 6. Resolution

- Restarted the `farmer_ml_service` container using `docker start farmer_ml_service`.
- Verified recovery via `/health` endpoint returning `{"status":"ML service running fine"}`.
- Confirmed Prometheus scrape target returned to **UP** state.
- Confirmed Availability SLI recovered above the 99% SLO threshold within `<FILL: e.g., ~5 minutes>` (30-minute evaluation window).

---

## 7. Preventive Actions

| Action | Owner | Priority | Status |
|--------|-------|----------|--------|
| Ensure `restart: unless-stopped` is active in production compose | `<FILL>` | P1 | ✅ Already in `docker-compose.prod.yml` |
| Add Docker healthcheck to `ml_service` in compose | `<FILL>` | P2 | ⬜ TODO |
| Implement circuit breaker / graceful fallback in backend crop controller | `<FILL>` | P2 | ⬜ TODO |
| Add `depends_on` healthcheck condition in compose | `<FILL>` | P3 | ⬜ TODO |
| Configure Grafana alerting (email/Slack notification channel) | `<FILL>` | P2 | ⬜ TODO |

---

## 8. Lessons Learned

- **What went well**:
  - Prometheus recording rules correctly computed the SLI drop in real-time.
  - The `HighErrorRate_SLO_Breach` alert fired within 2 minutes, providing fast detection.
  - Loki logs clearly showed `ECONNREFUSED` errors, making root cause identification straightforward.
  - The SLO dashboard made the business impact (error budget consumption) immediately visible.

- **What could be improved**:
  - No notification channel configured — the alert fired in Prometheus but nobody was paged.
  - Backend returns a generic 503; a more descriptive error message (e.g., "ML service unavailable, please retry") would improve UX.
  - No automated remediation (e.g., a container-level healthcheck that auto-restarts on failure).

- **Where we got lucky**:
  - Auth, Weather, and Market features were unaffected since they don't depend on the ML service.
  - In production, `restart: unless-stopped` would have auto-recovered the container from a real crash (OOM, segfault) — only a manual `docker stop` bypasses this.
