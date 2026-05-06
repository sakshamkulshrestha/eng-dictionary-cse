<div align="center">
# ⚡️ ENGINEERING DICTIONARY FOR CSE
### A High-Performance Knowledge Retrieval System for Software Engineering
</div>

---

## 🛰️ Architecture Overview

Engineering Dictionary for CSE is a high-performance workspace combining a React single-page application (SPA) with a lightweight Express backend API. It is architected for strict separation of concerns, enabling deployment to diverse cloud environments.

### Project Structure
```text
/
├── src/               # React frontend (Vite)
├── public/            # Static assets
├── server/            # Express backend & API routes
│   ├── app.ts         # Standalone API definitions
│   ├── db.ts          # MongoDB connection cache
│   └── server.ts      # HTTP Entrypoint (Dev/Prod)
├── scripts/           # DB Imports, Data Transforms
├── data/              # Source JSON artifacts
├── .env.example       # Example env variables template
├── package.json       # Project dependencies & scripts
└── vite.config.ts     # Vite configuration
```

---

## 🔐 Environment Variables Strategy

This project enforces strict rules regarding environment variables to guarantee security and proper separation between client and server environments.

* **`.env.example`**: The committed template. Use this to understand what keys the project needs. **Never place real secrets in this file.**
* **`.env.local`**: Your local development secrets file. This file is explicitly `.gitignore`d. Place all your database URIs and API keys here.
* **`.env`**: **Do not use a standard `.env` file**. To prevent accidental secret leakage, we enforce using `.env.local` for local secrets and standard hosting dashboard variables for production.

### Variable Prefixes
* **Server-Only (Secrets)**: Standard variables like `MONGODB_URI` and `NVIDIA_API_KEY`. These are handled exclusively by `server/` files and are never visible to the browser.
* **Client-Safe**: Always prefixed with `VITE_` (e.g., `VITE_API_URL`). These are baked into the frontend build.

---

## 🏗️ Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)
- NVIDIA API Key

### Getting Started

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy the example environment template:
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local` and add your real keys.*

3. **Start the Integrated Server**:
   During development, the Express backend automatically runs Vite as middleware to serve the React application on the same port.
   ```bash
   npm run dev
   ```
   *By default, the application runs on `http://localhost:3000`.*

---

## 🚀 Deployment config

Engineering Dictionary for CSE is deployment-platform-agnostic and can be deployed via traditional generic Node.js hosts, Docker, or split into serverless paradigms.

### Option A: Unified Container / Node.js Host (Render, Railway, Heroku)
The project natively supports running an integrated backend+frontend HTTP server in production.

1. **Build the Frontend**:
   ```bash
   npm run build
   ```
   *(Outputs optimized static files to `/dist`)*
2. **Start the Server**:
   ```bash
   npm run start
   ```
   *This starts the Express server, which serves `/api/*` dynamically and serves static files from `/dist`.*

**Requirements:** Set `NODE_ENV=production`, `MONGODB_URI`, and `NVIDIA_API_KEY` in the host dashboard.

### Option B: Split Static & Serverless (Netlify, Vercel)
Because business logic is isolated in `server/app.ts`, it can easily be exported to a serverless function handler while standard CI tools deploy the Vite `/dist` folder to the CDN.

If deploying to Netlify, configure your build settings to `npm run build`, set the publish directory to `dist`, and add a Netlify Function routing `/api/*` to `server/app.ts`. Remember to inject `VITE_API_URL` during the frontend build step if the backend is hosted on a different domain.
