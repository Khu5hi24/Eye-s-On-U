# Deployment & Build Guide

This document describes how to build the frontend and backend applications for production, configure server runtimes, set network ports, and verify external system parameters.

---

## Build System

### 1. Frontend Build (Next.js)

The frontend uses Next.js 16.2.9 and React 19. It compiles code into highly optimized client-side JS bundles and static layouts.

* **Build Command**: Runs compile-time checks and lint rules.
  ```bash
  cd frontend
  npm run build
  ```
* **Build Artifact**: Next.js builds the production distribution in the `.next/` directory.
* **Environment Configuration**: Client-side environment variables prefixed with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_API_BASE_URL`) are loaded during the build phase. Ensure these are set correctly in your build environment.
* **Execution**: Starts the production web server:
  ```bash
  npm run start
  ```

---

### 2. Backend Build (Express)

The backend compiles TypeScript source files in `src/` to standard JavaScript in a `dist/` directory.

* **Build Command**: Runs the TypeScript compiler (`tsc`):
  ```bash
  cd backend
  npm run build
  ```
* **Build Output**: Standard JS modules written to `/backend/dist/`.
* **Execution**: Starts the compiled server:
  ```bash
  npm run start
  ```

---

## Network & Port Configuration

The default network topology is configured as follows:
* **Frontend Web Port**: Default port is `3000`. You can configure this via the `PORT` environment variable.
* **Backend API Port**: Default port is `5000`. Set via `PORT` in [backend/.env](../backend/src/server.ts).
* **CORS Settings**: The backend CORS middleware restricts access to the origin declared in `CLIENT_URL` (which defaults to `http://localhost:3000`).

---

## Database Connection Fallbacks

In production, the backend [database config](../backend/src/config/db.ts) performs fallback checks on connection strings:
1. If `MONGO_URI` is a `mongodb+srv://` connection scheme, it tries connecting with it.
2. In case of network errors (such as ENOTFOUND or querySrv failures), it tries a fallback connection URL converting it to `mongodb://` scheme on port `27017` with `tls=true`.
3. It sets DNS resolvers to Google (`8.8.8.8`) and Cloudflare (`1.1.1.1`) to resolve database domain lookups.

---

## Third-Party Integrations

Ensure the following credentials are configured before starting the application:

### 1. Cloudinary Asset Manager
* **Config location**: `backend/src/config/cloudinary.ts`
* Requires: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
* Safe Check: If credentials are missing, the backend throws a startup configuration error.

### 2. Mail Dispatcher (Nodemailer SMTP)
* **Config location**: `backend/src/config/mail.ts`
* Requires: `SMTP_HOST`, `SMTP_PORT` (normally `587` or `465`), `SMTP_MAIL`, `SMTP_PASSWORD`.
* Safe Check: If missing, Nodemailer will throw a runtime error on signup or forgot password calls.

---

## Cross-References
* See [Environment Variables Guide](./validation.md) for variable lists.
* See [Architecture Specifications](./architecture.md) for networking diagram.
