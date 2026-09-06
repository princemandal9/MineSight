import app from "../app";
import { Server } from "http";

async function runTests() {
  console.log("=========================================");
  console.log("🧪 Running MineSight Backend Automated Tests");
  console.log("=========================================\n");

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to get ephemeral port");
  }

  const baseUrl = `http://localhost:${address.port}/api/v1`;
  console.log(`📡 Test server running on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(` PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(` FAIL: ${name}`);
      console.error(`   Error: ${err.message}\n`);
      failed++;
    }
  }

  let testContractorId = "";
  let testObservationId = "";

  // 1. Healthcheck Test
  await test("GET /health returns 200 and healthy status", async () => {
    const res = await fetch(`${baseUrl}/health`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.status !== "healthy") throw new Error(`Expected status 'healthy', got ${json.status}`);
  });

  // 2. Metrics Overview Test
  await test("GET /metrics/overview returns calculated top-bar metrics", async () => {
    const res = await fetch(`${baseUrl}/metrics/overview`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (!json.data.topMetrics || typeof json.data.topMetrics.totalActiveContractors !== "number") {
      throw new Error("Invalid topMetrics format");
    }
    if (!json.data.environmentalReadings || !json.data.environmentalReadings.pm10Dust) {
      throw new Error("Invalid environmentalReadings format");
    }
  });

  // 3. List Contractors
  await test("GET /contractors returns list with pagination", async () => {
    const res = await fetch(`${baseUrl}/contractors`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error("Expected non-empty contractors list");
    }
  });

  // 4. Filter Contractors by taskType
  await test("GET /contractors?taskType=blasting filters accurately", async () => {
    const res = await fetch(`${baseUrl}/contractors?taskType=blasting`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    for (const c of json.data) {
      if (c.taskType !== "blasting") throw new Error(`Expected taskType blasting, got ${c.taskType}`);
    }
  });

  // 5. Create Contractor (Entity 1 CRUD)
  await test("POST /contractors creates new contractor profile", async () => {
    const payload = {
      name: "Test Drilling & Blasting Consortium",
      email: "test@consortium.in",
      phone: "+91 99887 76655",
      taskType: "blasting",
      activeWorkers: 25,
      activeMachinery: 4,
    };

    const res = await fetch(`${baseUrl}/contractors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    if (!json.data.id || json.data.name !== payload.name) {
      throw new Error("Created contractor data mismatch");
    }
    testContractorId = json.data.id;
  });

  // 6. Get Contractor by ID
  await test("GET /contractors/:id retrieves contractor with relations", async () => {
    const res = await fetch(`${baseUrl}/contractors/${testContractorId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.data.id !== testContractorId) {
      throw new Error(`Expected ID ${testContractorId}, got ${json.data.id}`);
    }
  });

  // 7. Update Contractor
  await test("PUT /contractors/:id updates contractor fields", async () => {
    const res = await fetch(`${baseUrl}/contractors/${testContractorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeWorkers: 30 }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.data.activeWorkers !== 30) {
      throw new Error(`Expected activeWorkers=30, got ${json.data.activeWorkers}`);
    }
  });

  // 8. Log Observation (Entity 2 CRUD & Closed Loop Trigger)
  await test("POST /observations logs issue and elevates contractor risk", async () => {
    const payload = {
      contractorId: testContractorId,
      supervisorName: "Supervisor A. Roy",
      zone: "Pit Alpha",
      category: "PPE",
      severity: "CRITICAL",
      description: "Workers operating near blast wall without protective helmets and gas monitors.",
      gpsCoordinates: "23.8000° N, 86.4350° E",
    };

    const res = await fetch(`${baseUrl}/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    if (!json.data.id || json.data.status !== "OPEN") {
      throw new Error("Invalid observation creation response");
    }
    testObservationId = json.data.id;

    // Verify contractor is now red-flagged and risk elevated
    const cRes = await fetch(`${baseUrl}/contractors/${testContractorId}`);
    const cJson = await cRes.json();
    if (cJson.data.riskLevel !== "CRITICAL" || !cJson.data.isRestricted) {
      throw new Error(`Expected CRITICAL risk and restricted flag, got ${cJson.data.riskLevel}`);
    }
  });

  // 9. Submit Resolution Evidence
  await test("PATCH /observations/:id/evidence updates status to EVIDENCE_SUBMITTED", async () => {
    const payload = {
      evidenceUrl: "https://minestore.internal/proof/helmets_verified.jpg",
      evidenceNotes: "All crew members issued DGMS-approved helmets and individual CO/CH4 detectors.",
      submittedBy: "Consortium Project Lead",
    };

    const res = await fetch(`${baseUrl}/observations/${testObservationId}/evidence`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.data.status !== "EVIDENCE_SUBMITTED") {
      throw new Error(`Expected EVIDENCE_SUBMITTED, got ${json.data.status}`);
    }
  });

  // 10. Supervisor Verifies & Closes Observation (Closed-Loop Complete)
  await test("PATCH /observations/:id/verify approves resolution and clears red flag", async () => {
    const payload = {
      verifiedBy: "Supervisor A. Roy",
      resolutionNotes: "Physical check verified on-site. PPE compliance restored.",
    };

    const res = await fetch(`${baseUrl}/observations/${testObservationId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.data.status !== "RESOLVED") {
      throw new Error(`Expected RESOLVED, got ${json.data.status}`);
    }

    // Verify contractor red flag is cleared and risk returned to LOW
    const cRes = await fetch(`${baseUrl}/contractors/${testContractorId}`);
    const cJson = await cRes.json();
    if (cJson.data.riskLevel !== "LOW" || cJson.data.isRestricted !== false) {
      throw new Error(`Expected LOW risk and cleared restriction, got ${cJson.data.riskLevel}`);
    }
  });

  // 11. Validation Error Handling
  await test("POST /contractors with invalid taskType returns 400 Validation Error", async () => {
    const payload = {
      name: "Invalid Corp",
      taskType: "unsupported_task_type",
    };

    const res = await fetch(`${baseUrl}/contractors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false || !json.error.details) {
      throw new Error("Expected structured validation error details");
    }
  });

  // 12. 404 Route Not Found Handling
  await test("GET /nonexistent returns 404 with structured error response", async () => {
    const res = await fetch(`${baseUrl}/nonexistent`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error("Expected success: false on 404");
  });

  // 13. Delete Contractor
  await test("DELETE /contractors/:id cleans up test contractor", async () => {
    const res = await fetch(`${baseUrl}/contractors/${testContractorId}`, {
      method: "DELETE",
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 14. Authentication: Register User (Appends to File)
  let authToken = "";
  await test("POST /auth/register registers user and appends to file log", async () => {
    const payload = {
      name: "Ramesh Gupta",
      email: "ramesh.gupta@miningtest.in",
      password: "securepassword123",
      role: "CONTRACTOR",
      companyName: "Gupta Heavy Earthmoving Pvt Ltd",
      taskType: "excavation",
      phone: "+91 98300 12345",
    };

    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    if (!json.data.token || json.data.user.email !== payload.email) {
      throw new Error("Invalid registration response");
    }
  });

  // 15. Authentication: Login User (Appends to File)
  await test("POST /auth/login logs in user and returns JWT token", async () => {
    const payload = {
      email: "ramesh.gupta@miningtest.in",
      password: "securepassword123",
    };

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status !== 200) {
      const err = await res.json();
      throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    if (!json.data.token || json.data.user.role !== "CONTRACTOR") {
      throw new Error("Invalid login response");
    }
    authToken = json.data.token;
  });

  // 16. Authentication: Profile with Bearer Token
  await test("GET /auth/me returns authenticated user with valid JWT", async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.data.email !== "ramesh.gupta@miningtest.in") {
      throw new Error(`Expected email ramesh.gupta@miningtest.in, got ${json.data.email}`);
    }
  });

  // 17. Auth File Records: Verify details written to file
  await test("GET /auth/records returns auth file records with REGISTRATION and LOGIN entries", async () => {
    const res = await fetch(`${baseUrl}/auth/records`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json.data) || json.data.length < 2) {
      throw new Error(`Expected at least 2 file records, found ${json.data?.length}`);
    }

    const hasReg = json.data.some((r: any) => r.type === "REGISTRATION" && r.user.email === "ramesh.gupta@miningtest.in");
    const hasLogin = json.data.some((r: any) => r.type === "LOGIN" && r.user.email === "ramesh.gupta@miningtest.in");

    if (!hasReg) throw new Error("Missing REGISTRATION entry in auth records file");
    if (!hasLogin) throw new Error("Missing LOGIN entry in auth records file");
    if (!json.storageFiles?.jsonFile || !json.storageFiles?.logFile) {
      throw new Error("Missing storageFiles paths in response");
    }
  });

  // Clean up server
  await new Promise((resolve) => server.close(resolve));

  console.log("\n=========================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});

