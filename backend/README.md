# MineSight — Backend API

AI-Powered Smart Governance & Compliance Monitoring System for Coal Mines (SIH 2026).

## Tech Stack
- **Runtime**: Node.js v24 (LTS)
- **Framework**: Express.js with TypeScript
- **Database / ORM**: Prisma ORM with SQLite (`dev.db` for zero-configuration local dev, easily swappable to PostgreSQL)
- **Validation**: Zod schema validation for bodies, queries, and params
- **Security & Logging**: Helmet, CORS, Morgan

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Sync Database
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Database with Realistic Demo Data
```bash
npm run prisma:seed
```

### 4. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000/api/v1`.

### 5. Run Automated Verification Tests
```bash
npm run test:api
```

---

## API Reference

### Health & Metrics
- `GET /api/v1/health`: API status & version check.
- `GET /api/v1/metrics/overview`: Top metrics bar (Total Active Contractors, Critical Open Observations, Overall Compliance %, Mine Environmental Risk).
- `POST /api/v1/metrics/environmental`: Log daily environmental and yield readings.

### Contractors (`/api/v1/contractors`)
- `POST /`: Onboard new contractor profile.
- `GET /`: Search & filter contractors (query params: `search`, `taskType`, `riskLevel`, `status`, `page`, `limit`).
- `GET /:id`: Full contractor details with licenses, machinery, workers, explosives, and active observations.
- `PUT /:id`: Update contractor information.
- `DELETE /:id`: Delete contractor record.

### Observations & Closed Loop (`/api/v1/observations`)
- `POST /`: Supervisor logs a site violation. Automatically triggers a red-flag and increments violation frequency.
- `GET /`: List all observations with filters (`category`, `severity`, `status`, `zone`).
- `GET /:id`: View observation details and permanent audit log history.
- `PATCH /:id/evidence`: Contractor uploads remediation proof (photo URL & notes). Status transitions to `EVIDENCE_SUBMITTED`.
- `PATCH /:id/verify`: Supervisor verifies evidence and clears flag. Status transitions to `RESOLVED`, contractor risk recalculates deterministically.
- `DELETE /:id`: Remove observation.

