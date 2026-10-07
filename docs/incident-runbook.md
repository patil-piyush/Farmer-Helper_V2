# Incident Simulation Runbook — ML Service Outage

> **Purpose**: Walk through a controlled incident to demonstrate the full
> observability loop: failure → detection → investigation → resolution.

---

## Prerequisites

- All stacks running on EC2: app (`docker compose -p farmer`), monitoring, logging.
- Grafana open at `http://<EC2_IP>:3000`.
- SSH session to the EC2 instance.

---

## Step 1 — Baseline (Before the Incident)

1. Open **Dashboards → Farmer Helper Monitoring**.
2. Confirm all services show **Up (1)** in the "Service Uptime" panel.
3. Open **Dashboards → Farmer Helper SLO**.
4. Confirm **Availability SLI** gauge is green (~100%) and **Error Budget** is at ~100%.

📸 **Screenshot 1**: The SLO dashboard showing healthy SLI gauges and full error budget.

---

## Step 2 — Trigger the Incident (Stop ml_service)

```bash
# SSH into EC2
docker stop farmer_ml_service
```

- This simulates an ML service crash.
- The backend's `/api/crop` route calls `ML_SERVICE_URL` and will now get connection refused → 503.

📸 **Screenshot 2**: Terminal output showing the `docker stop` command.

---

## Step 3 — Generate Failing Traffic

```bash
# Hit the crop endpoint a few times to generate 5xx errors
# (use a valid JWT or hit the ML proxy endpoint directly)
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:5001/predict/crop \
    -H "Content-Type: application/json" \
    -d '{"N":10,"P":20,"K":30,"temperature":25,"humidity":80,"ph":6.5,"rainfall":200}'
done
```

*(All requests should return `000` / connection refused since the container is stopped.)*

Alternatively, use the traffic script:
```bash
cd /home/ubuntu/app/monitoring
python3 traffic.py
# Let it run for 1-2 minutes, then Ctrl+C
```

📸 **Screenshot 3**: Terminal showing the failing curl responses (connection refused or 503s).

---

## Step 4 — Observe the Error Rate Rise in Grafana

1. Open **Dashboards → Farmer Helper Monitoring**.
2. Look at the **Error Rate (Backend & ML)** panel — you should see a spike.
3. Look at **Service Uptime** — the `ml_service` job should show **Down (0)**.
4. Open **Dashboards → Farmer Helper SLO**.
5. The **Availability SLI** gauge should have dropped below 99% (yellow/red).
6. The **Error Budget Remaining** gauge should be draining or negative.

📸 **Screenshot 4**: The Monitoring dashboard showing ml_service **Down** and error rate spike.

📸 **Screenshot 5**: The SLO dashboard showing degraded Availability SLI and consumed error budget.

---

## Step 5 — Observe the Alert Firing

1. Open `http://<EC2_IP>:9090/alerts` (Prometheus Alerts page).
2. The **HighErrorRate_SLO_Breach** alert should be in `FIRING` state (after the 2-minute `for` duration).
3. On the SLO dashboard, the **Active Alerts** panel at the bottom should show the firing alert.

📸 **Screenshot 6**: Prometheus `/alerts` page showing `HighErrorRate_SLO_Breach` in FIRING state.

📸 **Screenshot 7**: SLO dashboard "Active Alerts" panel showing the alert.

---

## Step 6 — Investigate Logs in Loki

1. Open **Grafana → Explore** (compass icon).
2. Select datasource: **Loki**.
3. Run the query:
   ```
   {service="ml_service"}
   ```
   *(You should see no new logs since the container is stopped — confirming it's dead.)*
4. Switch to backend logs:
   ```
   {service="backend"} |= "ECONNREFUSED"
   ```
   or
   ```
   {service="backend"} |= "503"
   ```
   *(You should see the backend's error logs about failing to reach the ML service.)*

📸 **Screenshot 8**: Loki Explore showing backend error logs with ECONNREFUSED / 503 messages.

---

## Step 7 — Resolve the Incident (Restart ml_service)

```bash
docker start farmer_ml_service
```

Wait 30–60 seconds for the container to fully start (model download from S3).

Verify it's back:
```bash
curl http://localhost:5001/health
# Expected: {"status":"ML service running fine"}
```

📸 **Screenshot 9**: Terminal output of `docker start` and successful `/health` response.

---

## Step 8 — Confirm Recovery in Grafana

1. Open **Dashboards → Farmer Helper Monitoring**.
2. **Service Uptime** should show ml_service **Up (1)** again.
3. **Error Rate** should drop back to near zero.
4. Open **Dashboards → Farmer Helper SLO**.
5. **Availability SLI** should start recovering toward 99%+ (may take a few minutes for the 30m window to flush).
6. The **Error Budget** should stop draining.
7. Check `http://<EC2_IP>:9090/alerts` — the alert should transition back to **inactive**.

📸 **Screenshot 10**: Monitoring dashboard showing ml_service **Up** again and error rate returning to zero.

📸 **Screenshot 11**: SLO dashboard showing Availability SLI recovering and alert resolved.

📸 **Screenshot 12**: Prometheus `/alerts` page showing the alert back in **inactive** state.

---

## Screenshot Checklist Summary

| # | What to Screenshot | Where |
|---|-------------------|-------|
| 1 | Healthy SLO dashboard (baseline) | Grafana → Farmer Helper SLO |
| 2 | `docker stop farmer_ml_service` command | Terminal |
| 3 | Failing curl responses (503 / connection refused) | Terminal |
| 4 | Error rate spike + ml_service Down | Grafana → Farmer Helper Monitoring |
| 5 | Degraded Availability SLI + error budget consumed | Grafana → Farmer Helper SLO |
| 6 | HighErrorRate_SLO_Breach FIRING | Prometheus → /alerts |
| 7 | Active Alerts panel showing alert | Grafana → Farmer Helper SLO |
| 8 | Backend error logs (ECONNREFUSED/503) in Loki | Grafana → Explore (Loki) |
| 9 | `docker start` + successful /health response | Terminal |
| 10 | ml_service Up + error rate recovering | Grafana → Farmer Helper Monitoring |
| 11 | SLI recovering + alert resolved | Grafana → Farmer Helper SLO |
| 12 | Alert back to inactive | Prometheus → /alerts |
