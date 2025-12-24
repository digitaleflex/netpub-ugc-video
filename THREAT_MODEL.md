# Threat Model

## 1. Application Overview
The application is a React.js frontend for "NetPub", a video production agency. It interacts with a backend via GraphQL (`/graphql`) and uses Prisma for database access. It includes authentication and a dashboard.

## 2. Assets & Sensitive Data
- **User Credentials**: Email and Password (transferred during login).
- **Authentication Tokens**: JWT tokens stored in `localStorage` ('auth_token').
- **Session Data**: CSRF tokens.
- **Business Data**: Projects, Users, Conversations, Messages, Orders, Appointments (fetched via DashboardService).
- **User Data**: PII (Personally Identifiable Information) like names, emails, order details.

## 3. Trust Boundaries
- **Client (Browser) ↔ Server (API)**: The primary boundary. The client handles presentation and auth tokens. The server exposes `/graphql` and `/csrf-token`.
- **Client ↔ External Services**: Potential external integrations (e.g., email services via backend, but client initiates).
- **Client Storage**: `localStorage` is within the browser but accessible to any JS running on the page (XSS risk).

## 4. Attack Vectors
- **XSS (Cross-Site Scripting)**:
    - Storing JWT in `localStorage` makes it vulnerable to theft via XSS.
    - Rendering user content (e.g., chat messages, dashboard data) without sanitization.
- **CSRF (Cross-Site Request Forgery)**:
    - Mitigated by `X-CSRF-Token` header, but reliance on `localStorage` for JWT usually precludes CSRF (since browser doesn't auto-send headers like cookies). However, `fetchCsrfToken` suggests a hybrid approach or backend requirement.
- **Broken Authentication**:
    - JWT expiration/invalidation handling.
    - Secure transmission (HTTPS assumed).
- **Insecure Direct Object References (IDOR)**:
    - Backend should enforce permissions, but frontend shouldn't expose IDs blindly or assume access.
- **Sensitive Data Exposure**:
    - `src/lib/dashboard.ts` imports `prisma` directly. **CRITICAL FINDING**: The frontend code appears to be importing backend server-side libraries (`prisma`). If this file is bundled into the client-side code, it will fail (Node.js modules in browser) or, worse, expose backend logic/secrets if not tree-shaken correctly (though Prisma client usually needs Node). Wait, `src/lib/dashboard.ts` imports `../backend/lib/prisma`. If `dashboard.ts` is used in a React component, this is a **Huge Security & Architecture Flaw**.
    - Secrets in environment variables leaked to client.

## 5. Specific Risks Identified
- **Mixed Backend/Frontend Logic**: `src/lib/dashboard.ts` seems to contain server-side code (Prisma calls). This suggests a severe misunderstanding of the client-server boundary or a Next.js-like attempt in a Vite app, which won't work securely.
- **JWT in LocalStorage**: High impact if XSS exists.
