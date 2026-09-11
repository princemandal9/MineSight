# MineSight
> Data-Driven Smart Governance & Compliance Monitoring System for Coal Mines
>
> _SIH Problem Statement: AI-Based Smart Governance and Compliance Monitoring System for Coal Mines (PS-26024)_

## 🚀 Getting Started (Local Development)

Follow these instructions to set up and run MineSight on your local machine.

### Prerequisites

- **Node.js**: v18.0.0 or higher recommended
- **NPM**: v9.0.0 or higher
- **PostgreSQL Database**: (Local or Cloud like Supabase/Neon)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/minesight.git
cd minesight
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

**Important**: Open `backend/.env` and ensure you have a valid `GEMINI_API_KEY` and a valid `DATABASE_URL` pointing to your PostgreSQL instance.

```bash
npx prisma generate
npx prisma db push
npx tsx scripts/clean_demo_data.ts
npm run dev
```

### 3. Frontend Setup

Open a **new terminal tab/window**:

```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Production Deployment

MineSight is configured for a robust split-stack deployment using free-tier services. 

### Step 1: Database (Supabase / Neon)
1. Create a free PostgreSQL database on [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).
2. Copy the connection string (`postgres://...`).

### Step 2: Backend (Render.com)
The backend is an Express API and is pre-configured with a `render.yaml` Blueprint.
1. Create an account on [Render](https://render.com/).
2. Go to **Blueprints** -> **New Blueprint Instance**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` and prompt you for the Environment Variables (`DATABASE_URL` and `GEMINI_API_KEY`).
5. Once deployed, copy your backend URL (e.g., `https://minesight-backend.onrender.com`).

### Step 3: Frontend (Vercel)
1. Create a [Vercel](https://vercel.com/) account and click **Add New Project**.
2. Import this repository.
3. Vercel will automatically detect the **Next.js** framework in the `frontend` directory.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_API_URL`: Set this to your Render backend URL (e.g., `https://minesight-backend.onrender.com/api/v1`)
5. Click **Deploy**.

---

## 🔑 Demo Credentials

Once deployed, log in using the following seeded demo accounts:

### Mine Supervisor (Admin)
- **Email**: `supervisor@minesight.com`
- **Password**: `Admin@123`

### Contractors
- **Apex Blasting & Explosives Ltd.** (Critical Risk)
  - **Email**: `apex.contractor@minesight.com`
  - **Password**: `Demo@123`
