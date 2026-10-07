#!/usr/bin/env bash
# ================================================================
# Farmer Helper — Kubernetes Demo Script (Minikube)
# Run each section one at a time; take screenshots where indicated.
# ================================================================
set -e

NAMESPACE="farmer-helper"
K8S_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo "  Farmer Helper — Kubernetes Demo"
echo "============================================"

# ────────────────────────────────────────────────
# STEP 0: Prerequisites Check
# ────────────────────────────────────────────────
echo ""
echo "▶ Step 0: Checking prerequisites..."
command -v minikube >/dev/null 2>&1 || { echo "❌ minikube not found. Install: https://minikube.sigs.k8s.io/docs/start/"; exit 1; }
command -v kubectl  >/dev/null 2>&1 || { echo "❌ kubectl not found. Install: https://kubernetes.io/docs/tasks/tools/"; exit 1; }
echo "✅ minikube and kubectl are installed."

# ────────────────────────────────────────────────
# STEP 1: Start Minikube (if not already running)
# ────────────────────────────────────────────────
echo ""
echo "▶ Step 1: Starting Minikube..."
if minikube status | grep -q "Running"; then
    echo "✅ Minikube is already running."
else
    minikube start --driver=docker --memory=4096 --cpus=2
    echo "✅ Minikube started."
fi

# ────────────────────────────────────────────────
# STEP 2: Apply all manifests
# ────────────────────────────────────────────────
echo ""
echo "▶ Step 2: Applying Kubernetes manifests..."

# Namespace first
kubectl apply -f "$K8S_DIR/namespace.yaml"

# ConfigMap and Secret
kubectl apply -f "$K8S_DIR/configmap.yaml"
kubectl apply -f "$K8S_DIR/secret.yaml"

# Deployments and Services
kubectl apply -f "$K8S_DIR/backend/"
kubectl apply -f "$K8S_DIR/frontend/"
kubectl apply -f "$K8S_DIR/ml-service/"

echo "✅ All manifests applied."

# ────────────────────────────────────────────────
# STEP 3: Wait for pods to be ready
# ────────────────────────────────────────────────
echo ""
echo "▶ Step 3: Waiting for pods to become Ready..."
kubectl wait --for=condition=Ready pod -l app=farmer-helper \
  -n "$NAMESPACE" --timeout=120s || echo "⚠️  Some pods may still be starting (ML model download)."

# ────────────────────────────────────────────────
# STEP 4: Show cluster state
# ────────────────────────────────────────────────
echo ""
echo "▶ Step 4: Cluster state"
echo ""
echo "--- Pods ---"
kubectl get pods -n "$NAMESPACE" -o wide
echo ""
echo "--- Services ---"
kubectl get svc -n "$NAMESPACE"
echo ""
echo "--- Deployments ---"
kubectl get deployments -n "$NAMESPACE"

echo ""
echo "📸 SCREENSHOT 1: Take a screenshot of the above output (all pods Running, services, deployments)."
echo ""
read -rp "Press Enter to continue to scaling demo..."

# ────────────────────────────────────────────────
# STEP 5: Scale backend to 2 replicas
# ────────────────────────────────────────────────
echo ""
echo "▶ Step 5: Scaling backend to 2 replicas..."
kubectl scale deployment backend -n "$NAMESPACE" --replicas=2
sleep 5
kubectl get pods -n "$NAMESPACE" -l component=backend
kubectl get deployment backend -n "$NAMESPACE"

echo ""
echo "📸 SCREENSHOT 2: Take a screenshot showing 2 backend pods Running."
echo ""
read -rp "Press Enter to continue to self-healing demo..."

# ────────────────────────────────────────────────
# STEP 6: Self-healing — delete a pod
# ────────────────────────────────────────────────
echo ""
echo "▶ Step 6: Self-healing demo — deleting a backend pod..."
POD_TO_DELETE=$(kubectl get pods -n "$NAMESPACE" -l component=backend -o jsonpath='{.items[0].metadata.name}')
echo "Deleting pod: $POD_TO_DELETE"
kubectl delete pod "$POD_TO_DELETE" -n "$NAMESPACE"
echo "Waiting for replacement pod..."
sleep 10
kubectl get pods -n "$NAMESPACE" -l component=backend

echo ""
echo "📸 SCREENSHOT 3: Take a screenshot showing the replacement pod (new name, Running or ContainerCreating)."
echo ""
read -rp "Press Enter to continue to port-forward..."

# ────────────────────────────────────────────────
# STEP 7: Port-forward (run in foreground)
# ────────────────────────────────────────────────
echo ""
echo "▶ Step 7: Setting up port-forward..."
echo "Open TWO additional terminals and run:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    kubectl port-forward svc/backend 5000:5000 -n farmer-helper"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    kubectl port-forward svc/frontend 5173:5173 -n farmer-helper"
echo ""
echo "Then open http://localhost:5173 in your browser."
echo ""
echo "📸 SCREENSHOT 4: Take a screenshot of the app running in the browser via port-forward."
echo ""
echo "📸 SCREENSHOT 5: Take a screenshot of the port-forward terminal output."
echo ""

# ────────────────────────────────────────────────
# STEP 8: Verify health endpoints
# ────────────────────────────────────────────────
echo "▶ Step 8: Health checks (run after port-forward is active):"
echo ""
echo "  curl http://localhost:5000/health"
echo "  curl http://localhost:5001  # (if ml-service is also forwarded)"
echo ""
echo "📸 SCREENSHOT 6: Take a screenshot of the health check responses."
echo ""

# ────────────────────────────────────────────────
# STEP 9: Scale back down
# ────────────────────────────────────────────────
echo "▶ Step 9: Scaling backend back to 1 replica..."
kubectl scale deployment backend -n "$NAMESPACE" --replicas=1
sleep 5
kubectl get pods -n "$NAMESPACE"

echo ""
echo "✅ Demo complete!"
echo ""
echo "To clean up: kubectl delete namespace farmer-helper"
echo "To stop Minikube: minikube stop"
