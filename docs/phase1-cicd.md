# Phase 1 — CI/CD Pipeline (Jenkins)

## Pipeline Diagram

```
┌──────────┐    ┌────────────────────────────┐    ┌──────────────────────┐
│ Checkout │───▶│ Build (parallel)           │───▶│ Unit Tests (parallel)│
│ (SCM)    │    │  ├─ Backend npm ci          │    │  ├─ Backend Jest     │
│          │    │  ├─ Frontend ci+lint+build  │    │  └─ ML pytest        │
│          │    │  └─ ML pip install          │    │                      │
└──────────┘    └────────────────────────────┘    └──────────────────────┘
                                                           │
       ┌───────────────────────────────────────────────────┘
       ▼
┌──────────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Security Scan        │───▶│ Docker Build     │───▶│ Push to Hub      │
│  ├─ npm audit (x2)   │    │  ├─ backend      │    │  ├─ :build_num   │
│  ├─ pip-audit        │    │  ├─ frontend     │    │  └─ :latest      │
│  ├─ Gitleaks         │    │  └─ ml           │    │                  │
│  └─ Trivy (CRITICAL) │    │  + Trivy images  │    │                  │
└──────────────────────┘    └──────────────────┘    └──────────────────┘
                                                           │
       ┌───────────────────────────────────────────────────┘
       ▼
┌──────────────────┐    ┌──────────────────────────┐
│ Deploy           │───▶│ Health Check             │
│  docker compose  │    │  ├─ backend:5000/health   │
│  -f prod.yml     │    │  ├─ ml:5001/health        │
│  pull + up -d    │    │  └─ frontend:5173         │
└──────────────────┘    └──────────────────────────┘
```

## Trigger

- **Poll SCM** every 2 minutes (`H/2 * * * *`)
- Branch: `devops`

## Files Created

| File | Purpose |
|------|---------|
| `Jenkinsfile` | Declarative pipeline (8 stages) |
| `docker-compose.prod.yml` | Production compose using Docker Hub images |
| `backend/jest.config.js` | Jest configuration |
| `backend/tests/authController.test.js` | Auth register/login tests |
| `backend/tests/authMiddleware.test.js` | JWT protect middleware tests |
| `backend/tests/cropController.test.js` | Crop controller tests (ML up/down) |
| `ml_services/requirements-test.txt` | Lightweight deps for pytest (no torch) |
| `ml_services/tests/conftest.py` | sys.modules stubs for boto3/ultralytics |
| `ml_services/tests/test_crop.py` | Crop route + /health tests |
| `ml_services/tests/test_disease.py` | Disease route tests |
| `docs/phase1-cicd.md` | This document |

## Files Modified (additive only)

| File | Change |
|------|--------|
| `backend/server.js` | Inserted `GET /health` route (4 new lines) |
| `backend/package.json` | Added `"test:ci"` script |

---

## One-Time EC2 Setup Steps

### 1. Install Jenkins

```bash
# Install Java 17 (Jenkins dependency)
sudo apt update
sudo apt install -y fontconfig openjdk-17-jre

# Add Jenkins repo
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
```

### 2. Start Jenkins & get initial password

```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

- Open `http://<EC2_IP>:8080` in browser, paste the password
- Install **suggested plugins**

### 3. Install required Jenkins plugins

- **Pipeline** (usually included by default)
- **Git** (usually included by default)
- **Credentials Binding**
- No other plugins needed

### 4. Add jenkins user to docker group

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 5. Install Node.js and Python on the Jenkins host

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Python 3 + pip (should already be present on Ubuntu 22.04)
sudo apt install -y python3-pip python3-venv
```

### 6. Add Docker Hub credentials in Jenkins

- Go to **Manage Jenkins → Credentials → System → Global credentials**
- Click **Add Credentials**
  - Kind: **Username with password**
  - ID: `dockerhub-creds`
  - Username: your Docker Hub username
  - Password: your Docker Hub password or access token

### 7. Open port 8080 in Security Group

- Add an inbound rule for **TCP 8080** (Jenkins UI) in the Terraform security group
  - Or via AWS Console: EC2 → Security Groups → farmer-helper-sg → Edit Inbound Rules
  - Source: your IP only (e.g. `YOUR_IP/32`)

### 8. Create the Pipeline Job

- **New Item** → name: `farmer-helper` → type: **Pipeline**
- Under **Pipeline**:
  - Definition: **Pipeline script from SCM**
  - SCM: **Git**
  - Repository URL: `https://github.com/patil-piyush/Farmer-Helper_V2.git`
  - Branch: `*/devops`
  - Script Path: `Jenkinsfile`
- Under **Build Triggers**:
  - Check **Poll SCM**, schedule: `H/2 * * * *`
- Save

### 9. Stop the old compose before first deploy

```bash
# On the EC2 box, stop the existing containers so ports are free
cd /home/ubuntu/app
docker compose down
```

---

## Verification Commands

### Backend tests (local)

```bash
cd backend
npm ci
npx jest --ci --forceExit --verbose
```

Expected: 10 tests, all passing.

### ML tests (local)

```bash
cd ml_services
pip install -r requirements-test.txt
python -m pytest tests/ -v
```

Expected: 5 tests, all passing.

### Frontend lint + build (local)

```bash
cd frontend
npm ci
npx eslint . || true        # report only
npm run build                # must succeed
```

### Health check (after deploy)

```bash
curl http://<EC2_IP>:5000/health
# {"status":"ok","uptime":...}

curl http://<EC2_IP>:5001/health
# {"status":"ML service running fine"}

curl -o /dev/null -s -w "%{http_code}" http://<EC2_IP>:5173
# 200
```

### Docker Hub images

```bash
docker pull <DOCKERHUB_USER>/farmer-backend:latest
docker pull <DOCKERHUB_USER>/farmer-frontend:latest
docker pull <DOCKERHUB_USER>/farmer-ml:latest
```
