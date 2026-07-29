pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        PROJECT_DIR = "/srv/projects/Leetcode_Tracker/Sscet_Tracker"

        FRONTEND_DIR = "${PROJECT_DIR}/frontend"
        BACKEND_DIR  = "${PROJECT_DIR}/backend"

        NGINX_ROOT = "/var/www/html"

        PM2_APP = "sscet-backend"

        BRANCH = "main"
    }

    stages {

        stage('Checkout Latest Code') {
            steps {
                dir("${PROJECT_DIR}") {
                    sh """
                        echo "Fetching latest code..."
                        git fetch origin
                        git checkout ${BRANCH}
                        git reset --hard origin/${BRANCH}
                        git clean -fd
                    """
                }
            }
        }

        stage('Frontend - Install Dependencies') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm ci'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh """
                    echo "Deploying frontend..."

                    sudo rm -rf ${NGINX_ROOT}/*
                    sudo cp -r ${FRONTEND_DIR}/dist/* ${NGINX_ROOT}/
                """
            }
        }

        stage('Backend - Install Dependencies') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'npm ci'
                }
            }
        }

        stage('Restart Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh """
                        pm2 restart ${PM2_APP} --update-env || \
                        pm2 start npm --name ${PM2_APP} -- start
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                sh """
                    echo "Checking backend..."
                    curl http://localhost:3000 || true

                    echo "Checking frontend..."
                    curl http://localhost || true

                    pm2 list
                """
            }
        }
    }

    post {

        success {
            echo "================================="
            echo "Deployment Successful"
            echo "================================="
        }

        failure {
            echo "================================="
            echo "Deployment Failed"
            echo "================================="
        }
    }
}
