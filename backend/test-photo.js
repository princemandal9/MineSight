const crypto = require('crypto');
const fs = require('fs');

async function testPhotoIdempotency() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const headers = { 
    "Content-Type": "application/json",
    "x-user-role": "SUPERVISOR",
    "x-user-id": "test-supervisor-123"
  };

  const res = await fetch("http://localhost:5001/api/v1/contractors", { headers });
  const json = await res.json();
  const cId = json.data[0].id;
  
  // A tiny 1x1 transparent GIF base64 string for testing
  const dummyBase64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  const clientRefId = `ins-photo-${crypto.randomUUID()}`;
  const payload = {
    clientRefId,
    inspectorId: "Inspector R. Verma",
    zone: "PHOTO ZONE",
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
        description: "PHOTO TEST ONLINE",
        photoBase64: dummyBase64,
      }
    ]
  };

  console.log("Submitting photo test...");

  const res1 = await fetch("http://localhost:5001/api/v1/inspections", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  
  console.log("Status 1:", res1.status);

  const obs1 = await prisma.observation.findMany({ where: { description: "PHOTO TEST ONLINE" } });
  
  console.log(`Expected obs count: 1 | actual: ${obs1.length}`);
  console.log(`Photo URL generated:`, obs1[0]?.photoUrl);

  const res2 = await fetch("http://localhost:5001/api/v1/inspections", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  console.log("Status 2 (retry):", res2.status);

  const obs2 = await prisma.observation.findMany({ where: { description: "PHOTO TEST ONLINE" } });
  
  console.log(`Expected obs count: 1 | actual: ${obs2.length}`);

  await prisma.$disconnect();
}

testPhotoIdempotency().catch(console.error);
