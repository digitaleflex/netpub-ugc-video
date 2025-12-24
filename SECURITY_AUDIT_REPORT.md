# SECURITY AUDIT REPORT
**Project**: NetPub - Agence Video UGC Production Publicitaire
**Date**: 2024-05-24
**Auditor**: Jules (Senior Frontend Security Engineer)

## Executive Summary
A comprehensive security audit of the NetPub frontend application has revealed several **CRITICAL** architectural and security flaws. The most severe issues involve the inclusion of backend server-side code (database access, email sending with credentials) directly within the frontend source tree. This not only risks exposing sensitive secrets (SMTP credentials, API keys) in the client-side bundle but also indicates a fundamental violation of the client-server security model.

Immediate action is required to separate backend logic from the frontend and secure sensitive credentials.

## Threat Model
See [THREAT_MODEL.md](./THREAT_MODEL.md) for details on assets, boundaries, and attack vectors.

## Key Findings Breakdown

### 🚨 Critical Severity
These issues present an immediate risk to the confidentiality, integrity, or availability of the application and its data.

1.  **Backend Code & Secrets in Frontend (`src/lib/dashboard.ts`, `src/lib/email.ts`)**
    -   **Description**: The frontend source code (`src/`) contains files that import server-side libraries (`prisma`, `nodemailer`) and contain sensitive logic/credentials.
    -   **Impact**:
        -   **Secret Leakage**: SMTP credentials and hardcoded passwords in `email.ts` could be bundled and exposed to any user.
        -   **Application Failure**: Server-side libraries like `prisma` and `nodemailer` cannot run in a browser environment, likely causing the app to crash or fail to build.
        -   **Architecture Violation**: Completely bypasses the API layer, attempting direct DB/Service access from the client.
    -   **Remediation**: Remove these files from `src/`. Implement this logic in the backend (e.g., GraphQL resolvers or Express routes) and expose it via secure API endpoints.

2.  **API Keys Exposed in Build Config (`vite.config.ts`)**
    -   **Description**: `process.env.GEMINI_API_KEY` is hardcoded into the client bundle via `define`.
    -   **Impact**: Anyone can extract the Gemini API key from the browser's network traffic or sources.
    -   **Remediation**: Proxy Gemini API calls through the backend. Do not embed keys in the frontend.

### 🔴 High Severity
Significant risks that could lead to account takeover or data breach.

3.  **JWT Stored in LocalStorage**
    -   **Description**: Auth tokens are stored in `localStorage`.
    -   **Impact**: Vulnerable to XSS. If an attacker executes JS on the page, they can steal the token.
    -   **Remediation**: Move to HttpOnly cookies for token storage.

### 🟠 Medium Severity
Risks that should be addressed to harden the application.

4.  **Potential Open Redirect / XSS**
    -   **Description**: Dynamic `href` attributes in `Contact.tsx` are not explicitly sanitized.
    -   **Impact**: Phishing or script execution if data is user-controlled.
    -   **Remediation**: Validate URL schemes (http/https).

5.  **Weak Default Credentials (Backend)**
    -   **Description**: Hardcoded fallback passwords (e.g., 'NetpubAdmin2024!') in backend code.
    -   **Impact**: If env vars fail, the system falls back to a known weak password.
    -   **Remediation**: Remove defaults; fail to start if secrets are missing.

### 🟡 Low Severity
Best practice improvements.

6.  **Redundant CSRF Strategy**: CSRF tokens used alongside `localStorage` (which is immune to standard CSRF).
7.  **Console Logs**: Production logs leaking flow information.
8.  **Hardcoded Endpoints**: `/graphql` URL is hardcoded.

## Recommendations Roadmap

### Phase 1: Immediate Fixes (Critical)
1.  **Purge Backend Code**: Delete `src/lib/dashboard.ts` and `src/lib/email.ts` from the frontend. Move logic to `backend/`.
2.  **Clean Vite Config**: Remove `GEMINI_API_KEY` injection from `vite.config.ts`.
3.  **Rotate Secrets**: Immediately rotate any SMTP passwords or API keys that were present in the codebase.

### Phase 2: Architecture Hardening (High)
4.  **Secure Auth**: Switch from `localStorage` to HttpOnly cookies for JWT storage.
5.  **Sanitize Inputs**: Implement strict validation for all external links and rendered data.

### Phase 3: Cleanup (Medium/Low)
6.  **Env Vars**: Use `import.meta.env` for all config.
7.  **Logging**: Strip console logs in production builds.

---
**Next Steps**: Please authorize the creation of a remediation branch to begin addressing Phase 1 issues.
