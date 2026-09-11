# MineSight Deployment Guide

This document outlines the deployment process for the MineSight application.

## Prerequisites
- Node.js v22+
- Docker and Docker Compose (if deploying via containers)
- SQLite (for development/testing; production should use PostgreSQL, update `schema.prisma` accordingly)

## Environment Setup
1. Copy `.env.example` to `.env` in the root directory.
2. Update the environment variables, especially `JWT_SECRET` and `DATABASE_URL`.

## 1. Local Development Deployment

### Backend
\`\`\`bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 2. Production Deployment (Docker Compose)

The application includes a `docker-compose.yml` for simplified orchestration.

1. Ensure `.env` is configured correctly.
2. Build and start the containers:
\`\`\`bash
docker-compose up -d --build
\`\`\`
3. The frontend will be available on port `3000`, and the backend API on port `5000`.

## 3. Health Checks
The backend provides a health check endpoint to verify it is running:
- **Endpoint:** `GET /api/v1/health`
- **Response:**
  \`\`\`json
  {
    "success": true,
    "status": "healthy",
    "timestamp": "2026-09-08T12:00:00.000Z",
    "service": "MineSight Governance API",
    "version": "1.0.0"
  }
  \`\`\`

## 4. Security Considerations
- **API Security:** All domain routes (observations, metrics, licenses, machinery, etc.) require a valid Bearer token via the `Authorization` header.
- **Data Isolation:** Contractor-level requests are isolated. The backend strictly enforces that contractors can only access data tied to their authenticated `contractorId`.
- **Fallbacks:** Demo data and UI placeholders have been completely removed. If no data exists, the application gracefully returns and displays empty states.
