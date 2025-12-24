# Security Issues Log

## 1. High: Backend Code Imported in Frontend
- **File**: `src/lib/dashboard.ts`
- **Description**: The file `src/lib/dashboard.ts` imports `../backend/lib/prisma` and uses `prisma` client directly. This file is located in the `src/` directory, which is processed by Vite for the frontend bundle. Importing server-side libraries in the client-side code will cause build failures or runtime errors, and conceptually violates the client-server security boundary. If `dashboard.ts` is imported by any React component, this is a critical architecture flaw.
- **Risk**: Critical. It exposes backend logic structure and potentially secrets (if env vars are bundled) to the client, although mostly it will just break the build/app.
- **Remediation**: Move `dashboard.ts` logic to the backend (GraphQL resolver or Express route) and fetch data via API in the frontend.

## 2. Medium: Missing Sanitization in Rendered Content (Potential)
- **File**: `src/pages/Contact.tsx` (and potentially others)
- **Description**: While `dangerouslySetInnerHTML` was not found in code (only in docs), the app uses `href` with dynamic values (`social.url`). If `social.url` comes from user input without validation, it could be a vector for `javascript:` URI attacks.
- **Risk**: Medium. XSS via open redirect or script execution if `social.url` is user-controlled.
- **Remediation**: Ensure `social.url` is validated to start with `http://` or `https://`.

## 3. High: JWT Stored in LocalStorage
- **File**: `src/contexts/AuthContext.tsx`
- **Description**: The application stores the JWT authentication token in `localStorage` (`localStorage.setItem('auth_token', token)`).
- **Risk**: High. Any XSS vulnerability in the application (even in a third-party dependency) can read `localStorage` and exfiltrate the token, allowing attackers to hijack user sessions.
- **Remediation**: Store tokens in HttpOnly cookies, which are not accessible to JavaScript.

## 4. Medium: Redundant CSRF Protection for JWT
- **File**: `src/contexts/AuthContext.tsx`
- **Description**: The app implements CSRF protection (`X-CSRF-Token`) while using `localStorage` for tokens. Since `localStorage` tokens are not automatically sent by the browser (unlike cookies), CSRF attacks (which rely on browser sending cookies) are generally not possible against this specific auth mechanism. However, if the app *also* supports cookie-based auth or plans to, this is good. But confusingly, it fetches a CSRF token from `/csrf-token` endpoint. If this endpoint doesn't validate the user's session (which it can't if the token is only in `localStorage` and not yet sent), then the CSRF token might be trivially obtainable by an attacker, making the protection weak.
- **Risk**: Low/Medium. Adds complexity without necessarily adding security if not implemented correctly with sessions.
- **Remediation**: If moving to HttpOnly cookies (recommended), keep CSRF. If staying with `localStorage` (not recommended), CSRF token is technically redundant but harmless.

## 5. Low: Hardcoded GraphQL Endpoint
- **File**: `src/contexts/AuthContext.tsx`
- **Description**: `const GRAPHQL_ENDPOINT = '/graphql';` is hardcoded.
- **Risk**: Low. Limits flexibility across environments.
- **Remediation**: Use environment variable `import.meta.env.VITE_GRAPHQL_ENDPOINT`.

## 6. Critical: Direct Database Access from Frontend Code
- **File**: `src/lib/dashboard.ts`
- **Description**: This file imports `prisma` and performs DB queries. This is a severe violation of the Client-Server model. If this code is ever executed in the browser, it will fail (Prisma is server-side). If it's intended to be server-side code but placed in `src/`, it creates confusion and potential bundling issues where backend code leaks into the frontend bundle.
- **Risk**: Critical. Shows a fundamental architectural flaw.
- **Remediation**: Strictly separate backend and frontend code. Move this logic to a backend service/resolver.

## 7. Critical: Secrets Leaked in Vite Configuration
- **File**: `vite.config.ts`
- **Description**: The configuration defines `process.env.API_KEY` and `process.env.GEMINI_API_KEY` using `JSON.stringify(env.GEMINI_API_KEY)`. This hardcodes the API key into the client-side bundle if `GEMINI_API_KEY` is present during build time. Anyone inspecting the bundled JS code can find this key.
- **Risk**: Critical. Exposure of API credentials.
- **Remediation**: Do not expose sensitive API keys to the frontend. If the key is for a service that must be called from the client (unlikely for Gemini, usually better from backend), ensure it's restricted. Preferably, proxy calls through the backend.

## 8. Critical: Secrets Leaked in Frontend Code (Nodemailer)
- **File**: `src/lib/email.ts`
- **Description**: This file imports `nodemailer` (a server-side library) and instantiates it with credentials from `process.env` or hardcoded strings (e.g., `'mot_de_passe_brevo_a_definir'`). It is in the `src/` folder. Even if `nodemailer` fails to run in the browser (likely), the *credentials* (if bundled) or the *intent* to run this code on the client is a massive security failure. `nodemailer` cannot run in the browser.
- **Risk**: Critical. Exposure of SMTP credentials and application breakage.
- **Remediation**: Move all email logic to the backend. The frontend should only call an API endpoint (e.g., `/api/contact`) which then handles the email sending.

## 9. Medium: Hardcoded Admin Password in Backend Code (checked in context)
- **File**: `backend/lib/auth.ts` (and `backend/test-auth.ts`)
- **Description**: `process.env.ADMIN_PASSWORD || 'NetpubAdmin2024!'`. While this is backend code, having a hardcoded fallback password is a security risk if the environment variable is forgotten in production.
- **Risk**: Medium. Weak default configuration.
- **Remediation**: Require the environment variable to be set; fail startup if missing. Do not use default passwords.

## 10. Low: Console Logs Leaking Info
- **File**: `src/lib/email.ts`
- **Description**: `console.log` statements expose email flows and potentially PII (names, emails) if they weren't broken.
- **Risk**: Low/Info.
- **Remediation**: Remove console logs in production.
