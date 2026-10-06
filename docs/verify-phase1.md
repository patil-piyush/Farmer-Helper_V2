# Phase 1 Verification Guide

This document provides step-by-step instructions to verify all deliverables from Phase 1.

## 1. Verify Backend Tests (Local)
The backend tests cover the `authController`, `authMiddleware`, and `cropController`. AWS dependencies are mocked.

```bash
cd backend
npm ci
npx jest --ci --forceExit --verbose
```
**Expected Outcome:** 14 tests should pass successfully.

## 2. Verify ML Service Tests (Local)
The ML service tests cover the `/health`, `/predict/crop`, and `/predict/disease` routes. Heavy dependencies like PyTorch are stubbed out.

```bash
cd ml_services
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-test.txt
python -m pytest tests/ -v
deactivate
```
**Expected Outcome:** 6 tests should pass successfully.

## 3. Verify Frontend Build & Lint (Local)
The frontend should successfully run a production build, and the linter should report any issues without failing the build.

```bash
cd frontend
npm ci
npx eslint . || true        # Report only, should not fail
npm run build                # Must succeed and create a dist/ folder
```
**Expected Outcome:** The build should finish without errors.

## 4. Verify Jenkins Pipeline Execution
Once Jenkins is set up and the `Jenkinsfile` is committed to the `devops` branch:

1. Push your changes to the `devops` branch.
2. The pipeline is configured to poll every 2 minutes. Wait for it to trigger, or manually click **Build Now** in the Jenkins UI.
3. Watch the pipeline stages:
   - **Checkout**: Pulls code.
   - **Build**: Installs dependencies for backend, frontend, and ML.
   - **Unit Tests**: Runs Jest and pytest.
   - **Security Scan**: Runs npm audit, pip-audit, gitleaks, and trivy.
   - **Docker Build**: Builds the 3 Docker images.
   - **Push to Docker Hub**: Pushes the images with `latest` and build number tags.
   - **Deploy**: Runs `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d` on the EC2 host.
   - **Health Check**: Pings all 3 services.

**Expected Outcome:** The pipeline should complete with a "SUCCESS" status.

## 5. Verify Deployed Services (EC2)
After a successful pipeline deployment, SSH into your EC2 instance (or use its public IP) to check the health of the live containers.

```bash
# Check Backend
curl http://localhost:5000/health
# Expected Output: {"status":"ok","uptime":<number>}

# Check ML Service
curl http://localhost:5001/health
# Expected Output: {"status":"ML service running fine"}

# Check Frontend
curl -I http://localhost:5173
# Expected Output: HTTP/1.1 200 OK (or similar success headers)
```

You can also verify that the containers are running the latest images from Docker Hub:
```bash
docker ps
```
**Expected Outcome:** You should see `farmer_backend`, `farmer_ml_service`, and `farmer_frontend` containers running, using your Docker Hub image tags.
