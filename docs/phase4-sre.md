# Phase 4 — SRE: SLIs, SLOs & SLA

## SLI vs SLO vs SLA — Definitions

| Concept | What it is | Who defines it | Example |
|---------|-----------|----------------|---------|
| **SLI** (Service Level Indicator) | A quantitative metric measuring one aspect of service quality | Engineering / SRE team | "Percentage of backend requests that return non-5xx responses" |
| **SLO** (Service Level Objective) | An internal target value for an SLI | Engineering / Product team | "The availability SLI must be ≥ 99% over any 30-minute window" |
| **SLA** (Service Level Agreement) | A contractual promise to customers, with consequences for breach | Business / Legal team | "We guarantee 95% uptime; if breached, customers receive service credits" |

**Relationship**: SLI feeds into SLO, SLO underpins SLA.
```
SLI (measurement) → SLO (target) → SLA (contract)
```

---

## Farmer Helper SLIs

### 1. Availability SLI

- **Definition**: Fraction of backend HTTP requests that do NOT return a 5xx status code.
- **Formula**:
  ```
  Availability SLI = 1 − (rate of 5xx requests / rate of all requests)
  ```
- **PromQL (5-minute window)**:
  ```promql
  1 - (
    sum(rate(http_requests_total{job="backend", status_code=~"5.."}[5m]))
    /
    sum(rate(http_requests_total{job="backend"}[5m]))
  )
  ```
- **Prometheus recording rule**: `sli:availability:rate5m` / `sli:availability:rate30m`
- **Why this metric**: It directly measures what the user cares about — "did my request succeed?" Any 5xx is a server-side failure visible to the end user.

### 2. Latency SLI

- **Definition**: Fraction of backend HTTP requests completed in less than 500 milliseconds.
- **Formula**:
  ```
  Latency SLI = (requests with duration < 500ms) / (total requests)
  ```
- **PromQL (5-minute window)**:
  ```promql
  sum(rate(http_request_duration_seconds_bucket{job="backend", le="0.5"}[5m]))
  /
  sum(rate(http_request_duration_seconds_count{job="backend"}[5m]))
  ```
- **Prometheus recording rule**: `sli:latency:rate5m` / `sli:latency:rate30m`
- **Why 500ms**: Most Farmer Helper API calls (auth, weather, market) are simple proxy/DB lookups and should respond well under 500ms. The ML inference routes are heavier, but the SLI is measured across all backend routes.

---

## Farmer Helper SLOs

| SLO | SLI Used | Target | Window |
|-----|----------|--------|--------|
| **Availability SLO** | Availability SLI | ≥ 99% | 30 minutes |
| **Latency SLO** | Latency SLI | ≥ 95% of requests < 500ms | 30 minutes |

### Error Budget

The error budget is the "allowed unreliability" before the SLO is breached.

- **Availability error budget** = `1 − SLO` = `1 − 0.99` = **1%** of requests can be errors
- **Latency error budget** = `1 − SLO` = `1 − 0.95` = **5%** of requests can exceed 500ms

**Error budget remaining formula**:
```
Budget Remaining = 1 − ((1 − SLI) / (1 − SLO))
```
- When `Budget = 1.0` → no budget consumed (perfect)
- When `Budget = 0.0` → SLO exactly met, budget fully spent
- When `Budget < 0.0` → SLO breached

---

## Farmer Helper SLA (Hypothetical)

Since Farmer Helper is not a commercial SaaS product, there is no formal SLA.
However, if one were defined, it would look like:

> *"Farmer Helper guarantees 95% monthly uptime for crop recommendation
> and disease detection features. If uptime falls below 95% in a calendar
> month, affected users will receive an extended free trial period."*

**Key differences from SLO**:
- SLA target (95%) is deliberately lower than the internal SLO (99%) to provide a safety margin.
- SLA breach has business consequences (credits / penalties).
- SLO breach triggers internal engineering response (freeze feature work, fix reliability).

---

## Alert Rules

| Alert | Condition | Duration | Severity |
|-------|-----------|----------|----------|
| `HighErrorRate_SLO_Breach` | `sli:availability:rate5m < 0.99` | 2 minutes | Critical |
| `ErrorBudgetExhausted` | `sli:error_budget:availability < 0` | 1 minute | Warning |

---

## Grafana Dashboards

| Dashboard | Panels |
|-----------|--------|
| **Farmer Helper SLO** (`slo.json`) | Availability SLI gauge, Latency SLI gauge, Error Budget gauge, SLI time-series with SLO target lines, Error Budget burn-down, Active Alerts |

---

## Files Created in This Phase

| File | Purpose |
|------|---------|
| `monitoring/rules.yml` | Prometheus recording rules for SLI computation |
| `monitoring/alert_rules.yml` | Prometheus alert rules for SLO breach |
| `monitoring/grafana/dashboards/slo.json` | Grafana SLO dashboard |
| `docs/phase4-sre.md` | This document |
| `docs/incident-runbook.md` | Step-by-step incident simulation with screenshot guide |
| `docs/post-mortem.md` | Pre-filled post-mortem template |

## Files Modified (additive only)

| File | Change |
|------|--------|
| `monitoring/prometheus.yml` | Added `rule_files:` section referencing `rules.yml` and `alert_rules.yml` |
| `monitoring/docker-compose.yml` | Added 2 volume mounts for rule files into the Prometheus container |

---

## Verification Steps

### 1. Check recording rules are loaded
```bash
curl http://<EC2_IP>:9090/api/v1/rules | python3 -m json.tool | head -50
```
You should see `sli:availability:rate5m`, `sli:latency:rate5m`, etc.

### 2. Check alert rules are loaded
Open `http://<EC2_IP>:9090/alerts` — you should see `HighErrorRate_SLO_Breach` and `ErrorBudgetExhausted` in inactive state.

### 3. Check the SLO dashboard
Open `http://<EC2_IP>:3000` → **Dashboards → Farmer Helper SLO**. All gauges should show green with full error budget.

### 4. Run the incident simulation
Follow `docs/incident-runbook.md` end-to-end and capture screenshots.

### 5. Fill out the post-mortem
After the simulation, fill in timestamps and metric values in `docs/post-mortem.md`.
