pipeline {
    agent any

    environment {
        CI = 'true'
        BROWSER_PROJECT = 'bdd-chrome'
        BASE_URL = 'https://opensource-demo.orangehrmlive.com'
        ADMIN_USERNAME = 'Admin'
        ADMIN_PASSWORD = 'admin123'
    }

    options {
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat '''
                    echo Node version:
                    node -v
                    echo NPM version:
                    call npm -v
                    if exist package-lock.json (
                        call npm ci || call npm install
                    ) else (
                        call npm install
                    )
                '''
            }
        }

        stage('Prepare Browsers') {
            steps {
                bat '''
                    if "%BROWSER_PROJECT%"=="bdd-firefox" (
                        call npx playwright install firefox
                    ) else (
                        echo Using system browser channel for %BROWSER_PROJECT%
                    )
                '''
            }
        }

        stage('Generate BDD Specs') {
            steps {
                bat 'call npx bddgen'
            }
        }

        stage('Run Playwright BDD Suite') {
            steps {
                bat 'call npx playwright test --project=%BROWSER_PROJECT%'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'test-results/**, playwright-report/**', allowEmptyArchive: true
            script {
                try {
                    junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
                } catch (Exception e) {
                    echo "JUnit plugin not available or skipped: ${e.message}"
                }
            }
        }
    }
}
