pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {

        // ============================================================
        // STAGE 1 — Checkout
        // ============================================================
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ============================================================
        // STAGE 2 — Build / Install
        // ============================================================
        stage('Build') {
            steps {
                stage('Backend Install') {
                    dir('backend') {
                        sh 'npm ci --no-audit --no-fund'
                    }
                }

                stage('Frontend Install + Lint + Build') {
                    dir('frontend') {
                        sh 'npm ci --no-audit --no-fund'
                        sh 'npx eslint . --format stylish > eslint-report.txt 2>&1 || true'
                        archiveArtifacts artifacts: 'eslint-report.txt', allowEmptyArchive: true
                        sh 'npm run build'
                    }
                }

                stage('ML Install') {
                    dir('ml_services') {
                        sh 'python3 -m pip install --user --quiet -r requirements-test.txt'
                    }
                }
            }
        }

        // ============================================================
        // STAGE 3 — Unit Tests
        // ============================================================
        stage('Unit Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npx jest --ci --forceExit --verbose 2>&1 | tee test-results.txt'
                            archiveArtifacts artifacts: 'test-results.txt', allowEmptyArchive: true
                        }
                    }
                }
                stage('ML Tests') {
                    steps {
                        dir('ml_services') {
                            sh 'python3 -m pytest tests/ -v 2>&1 | tee pytest-results.txt'
                            archiveArtifacts artifacts: 'pytest-results.txt', allowEmptyArchive: true
                        }
                    }
                }
            }
        }

        // ============================================================
        // STAGE 4 — Security Scans
        // ============================================================
        stage('Security Scan') {
            steps {

                // --------------------------------------------------------
                // npm audit — Backend
                // --------------------------------------------------------
                dir('backend') {
                    sh '''
                        npm audit --omit=dev --json > npm-audit-backend.json 2>&1 || true
                    '''

                    archiveArtifacts(
                        artifacts: 'npm-audit-backend.json',
                        allowEmptyArchive: true
                    )
                }

                // --------------------------------------------------------
                // npm audit — Frontend
                // --------------------------------------------------------
                dir('frontend') {
                    sh '''
                        npm audit --omit=dev --json > npm-audit-frontend.json 2>&1 || true
                    '''

                    archiveArtifacts(
                        artifacts: 'npm-audit-frontend.json',
                        allowEmptyArchive: true
                    )
                }

                // --------------------------------------------------------
                // pip-audit — ML
                // --------------------------------------------------------
                dir('ml_services') {

                    sh '''
                        python3 -m pip install --user --quiet pip-audit
                    '''

                    sh '''
                        python3 -m pip_audit \
                            -r requirements-test.txt \
                            --format json \
                            --output pip-audit-report.json || true
                    '''

                    archiveArtifacts(
                        artifacts: 'pip-audit-report.json',
                        allowEmptyArchive: true
                    )
                }

                // --------------------------------------------------------
                // Gitleaks
                // --------------------------------------------------------
                sh '''#!/bin/bash
                    set -e

                    if ! command -v gitleaks >/dev/null 2>&1 && [ ! -x /tmp/gitleaks ]; then
                        curl -sSL \
                            https://github.com/gitleaks/gitleaks/releases/download/v8.18.4/gitleaks_8.18.4_linux_x64.tar.gz \
                            | tar xz -C /tmp

                        chmod +x /tmp/gitleaks
                    fi

                    /tmp/gitleaks detect \
                        --source=. \
                        --report-path=gitleaks-report.json \
                        --report-format=json \
                        --no-banner || true
                '''

                archiveArtifacts(
                    artifacts: 'gitleaks-report.json',
                    allowEmptyArchive: true
                )

                echo 'Security scans completed in report-only mode.'
            }
        }

        stage('Prepare Environment') {
            steps {
                sh '''
                    set -e

                    cp /home/ubuntu/app/backend/.env ./backend/.env
                    cp /home/ubuntu/app/frontend/.env ./frontend/.env

                    chmod 600 ./backend/.env
                    chmod 600 ./frontend/.env

                    echo "Environment files prepared successfully."
                '''
            }
        }
        // ============================================================
        // STAGE 5 — Docker Build 
        // ============================================================
        stage('Docker Build') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    // ----------------------------------------------------
                    // Build images
                    // ----------------------------------------------------
                    sh """
                        docker build \
                            -t ${DOCKER_USER}/farmer-backend:${IMAGE_TAG} \
                            -t ${DOCKER_USER}/farmer-backend:latest \
                            ./backend

                        docker build \
                            -t ${DOCKER_USER}/farmer-frontend:${IMAGE_TAG} \
                            -t ${DOCKER_USER}/farmer-frontend:latest \
                            ./frontend

                        docker build \
                            -t ${DOCKER_USER}/farmer-ml:${IMAGE_TAG} \
                            -t ${DOCKER_USER}/farmer-ml:latest \
                            ./ml_services
                    """
                }
            }
        }

        // ============================================================
        // STAGE 6 — Push to Docker Hub
        // ============================================================
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                  usernameVariable: 'DOCKER_USER',
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh "docker push ${DOCKER_USER}/farmer-backend:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_USER}/farmer-backend:latest"
                    sh "docker push ${DOCKER_USER}/farmer-frontend:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_USER}/farmer-frontend:latest"
                    sh "docker push ${DOCKER_USER}/farmer-ml:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_USER}/farmer-ml:latest"
                }
            }
        }

        // ============================================================
        // STAGE 7 — Deploy (same host, docker-compose.prod.yml)
        // ============================================================
        stage('Deploy') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                  usernameVariable: 'DOCKER_USER',
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        export DOCKERHUB_USER=${DOCKER_USER}
                        export IMAGE_TAG=${IMAGE_TAG}
                        docker compose -p farmer -f docker-compose.prod.yml pull
                        docker compose -p farmer -f docker-compose.prod.yml up -d
                    """
                }
            }
        }

        // ============================================================
        // STAGE 8 — Start Monitoring Stack
        // ============================================================
        stage('Start Monitoring & Logging') {
            steps {
                dir('monitoring') {
                    sh 'docker compose pull || true'
                    sh 'docker compose up -d'
                }
                dir('logging') {
                    sh 'docker compose pull || true'
                    sh 'docker compose up -d'
                }
            }
        }

        // ============================================================
        // STAGE 9 — Health Checks (with retries)
        // ============================================================
        stage('Health Check') {
            steps {
                // Retry up to 5 times with 10s between attempts
                retry(5) {
                    sleep(time: 10, unit: 'SECONDS')
                    sh 'curl -sf http://localhost:5000/health'
                }
                retry(5) {
                    sleep(time: 10, unit: 'SECONDS')
                    sh 'curl -sf http://localhost:5001/health'
                }
                retry(5) {
                    sleep(time: 10, unit: 'SECONDS')
                    sh 'curl -sf http://localhost:5173'
                }
                echo '✅ All health checks passed!'
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
        success {
            echo '🎉 Pipeline completed successfully — app is live!'
        }
        failure {
            echo '❌ Pipeline failed — check the logs above.'
        }
    }
}
