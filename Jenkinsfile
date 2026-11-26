pipeline {
    agent any

    parameters {
        choice(name: 'BROWSER_PROJECT', choices: ['bdd-chrome', 'bdd-edge', 'bdd-firefox'], description: 'Playwright browser project to execute')
        string(name: 'GREP_TAGS', defaultValue: '', description: 'Optional tag filter (e.g., @smoke, @regression, @e2e; leave blank to run full suite)')
    }

    environment {
        CI = 'true'
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
                    set TARGET_PROJECT=%BROWSER_PROJECT%
                    if "%TARGET_PROJECT%"=="" set TARGET_PROJECT=bdd-chrome
                    if "%TARGET_PROJECT%"=="bdd-firefox" (
                        call npx playwright install firefox
                    ) else (
                        echo Using system browser channel for %TARGET_PROJECT%
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
                bat '''
                    set TARGET_PROJECT=%BROWSER_PROJECT%
                    if "%TARGET_PROJECT%"=="" set TARGET_PROJECT=bdd-chrome
                    if "%GREP_TAGS%"=="" (
                        call npx playwright test --project=%TARGET_PROJECT%
                    ) else (
                        call npx playwright test --project=%TARGET_PROJECT% --grep "%GREP_TAGS%"
                    )
                '''
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
