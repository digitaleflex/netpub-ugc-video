<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aF06Mfpzzv3lVvan7dklR7GduHqeok7_

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## CI/CD Pipeline

This project is configured with a CI/CD pipeline that automates the testing, building, and deployment of the application.

### GitHub Secrets

To use this pipeline, you need to configure the following secrets in your GitHub repository settings:

*   `SNYK_TOKEN`: Your Snyk API token for dependency scanning.
*   `DOCKER_USERNAME`: Your Docker Hub username.
*   `DOCKER_PASSWORD`: Your Docker Hub password or access token.
*   `SSH_HOST`: The IP address or hostname of your deployment server.
*   `SSH_USERNAME`: The username for SSH access to your deployment server.
*   `SSH_PRIVATE_KEY`: The private SSH key for accessing your deployment server.

### Pipeline Overview

The CI/CD pipeline is divided into two workflows:

1.  **Continuous Integration (CI):** This workflow runs on every pull request to the `main` branch. It performs the following checks:
    *   **Linting:** Checks the code for style and formatting errors.
    *   **Testing:** Runs the backend and frontend tests.
    *   **Security Scanning:** Scans for vulnerabilities in the project's dependencies.
    *   **Building:** Builds the Docker image to ensure it can be created successfully.

2.  **Continuous Deployment (CD):** This workflow runs on every push to the `main` branch. It performs the following actions:
    *   **Build and Push:** Builds the Docker image and pushes it to Docker Hub.
    *   **Security Scanning:** Scans the Docker image for vulnerabilities.
    *   **Deploy:** Deploys the application to the production server.

### Triggering a Deployment

A deployment is automatically triggered when a pull request is merged into the `main` branch.

### Diagnosing Failures

If a pipeline fails, you can diagnose the issue by following these steps:

1.  Go to the "Actions" tab in the GitHub repository.
2.  Click on the failed workflow run.
3.  Examine the logs for the failed job to identify the cause of the error.

### Rollback Strategy

Since each deployment uses a unique, immutable Docker image tag based on the Git commit SHA, rolling back to a previous version is straightforward.

1.  **Identify the commit SHA of the stable version** you want to redeploy. You can find this in the Git history.
2.  **Manually run the "Continuous Deployment" workflow.**
    *   Go to the "Actions" tab in the GitHub repository.
    *   Select the "Continuous Deployment" workflow.
    *   Click "Run workflow".
    *   In the "Use workflow from" dropdown, select the commit SHA you identified in the previous step.
    *   Click "Run workflow".

This will trigger a new deployment using the code from the selected commit, effectively rolling back the application to the desired version.
