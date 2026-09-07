const crypto = require('crypto');

async function testIdempotency() {
  const headers = { 
    "Content-Type": "application/json",
    "x-user-role": "SUPERVISOR",
    "x-user-id": "test-supervisor-123"
  };

  // 1. Fetch a contractor
  const res = await fetch("http://localhost:5001/api/v1/contractors", { headers });
  const json = await res.json();
  const cId = json.data[0].id;
  
  // 2. Build payload with a stable clientRefId
  const clientRefId = `ins-test-idem-${crypto.randomUUID()}`;
  const payload = {
    clientRefId,
    inspectorId: "Inspector R. Verma",
    zone: "TEST IDEMPOTENCY ZONE",
    contractorId: cId,
    taskType: "Excavation",
    latitude: 23.7,
    longitude: 86.4,
    locationAccuracy: 10,
    startedAt: new Date().toISOString(),
    observations: [
      {
        contractorId: cId,
        category: "PPE",
        severity: "CRITICAL",
        description: "TEST IDEMPOTENCY DESC 1",
      },
      {
        contractorId: cId,
        category: "DUST",
        severity: "MODERATE",
        description: "TEST IDEMPOTENCY DESC 2",
      }
    ]
  };

  console.log("Submitting first time...");
  const res1 = await fetch("http://localhost:5001/api/v1/inspections", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  console.log("First submission status:", res1.status);
  
  console.log("Simulating retry (submitting exact same payload)...");
  const res2 = await fetch("http://localhost:5001/api/v1/inspections", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  console.log("Retry submission status:", res2.status);

  // 3. Verify exactly one inspection and two observations exist
  console.log("Fetching DB records...");
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  const inspections = await prisma.inspection.findMany({
    where: { clientRefId }
  });
  
  const observations = await prisma.observation.findMany({
    where: { 
      description: {
        contains: "TEST IDEMPOTENCY DESC"
      }
    }
  });

  console.log("--- RESULTS ---");
  console.log(`Inspections created: ${inspections.length} (Expected: 1)`);
  console.log(`Observations created: ${observations.length} (Expected: 2)`);
  
  await prisma.$disconnect();
}

testIdempotency().catch(console.error);
