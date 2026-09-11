# MineSight
> Data-Driven Smart Governance & Compliance Monitoring System for Coal Mines
>
> _SIH Problem Statement: AI-Based Smart Governance and Compliance Monitoring System for Coal Mines (PS-26024)_

## 🚀 Getting Started

Follow these instructions to set up and run MineSight on your local machine.

### Prerequisites

- **Node.js**: v18.0.0 or higher recommended
- **NPM**: v9.0.0 or higher

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/minesight.git
cd minesight
```

### 2. Backend Setup

The backend is built with Express, Prisma, and Gemini AI.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

**Important**: Open the newly created `backend/.env` file and ensure you have a valid Gemini API key set for `GEMINI_API_KEY`.

```bash
# Generate Prisma Client
npx prisma generate

# Push the schema to create the local SQLite database
npx prisma db push

# Seed the database with the required demo data
npx tsx scripts/clean_demo_data.ts

# Start the backend development server
npm run dev
```

The backend API will now be running on `http://localhost:5001`.

### 3. Frontend Setup

The frontend is a modern web application built with Next.js 14 and Tailwind CSS.

Open a **new terminal tab/window** and run:

```bash
# Navigate to the frontend directory from the project root
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The web application will now be running on `http://localhost:3000`.

---

## 🔑 Demo Credentials

Once both servers are running, you can log in to `http://localhost:3000` using the following seeded demo accounts:

### Mine Supervisor (Admin)
- **Email**: `supervisor@minesight.com`
- **Password**: `Admin@123`

### Contractors
- **Apex Blasting & Explosives Ltd.** (Critical Risk)
  - **Email**: `apex.contractor@minesight.com`
  - **Password**: `Demo@123`
- **Northwest Mining Services Ltd.** (Moderate Risk)
  - **Email**: `northwest.contractor@minesight.com`
  - **Password**: `Demo@123`
- **Eastern Coal Logistics Pvt. Ltd.** (Low Risk)
  - **Email**: `eastern.contractor@minesight.com`
  - **Password**: `Demo@123`
