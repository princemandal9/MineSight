const crypto = require('crypto');

async function testCleanState() {
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
  
  const clientRefId = `ins-clean-${crypto.randomUUID()}`;
  const payload = {
    clientRefId,
    inspectorId: "Inspector R. Verma",
    zone: "CLEAN ZONE",
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
        description: "CLEAN IDEMPOTENCY DESC 1",
      },
      {
        contractorId: cId,
        category: "DUST",
        severity: "MODERATE",
        description: "CLEAN IDEMPOTENCY DESC 2",
      }
    ]
  };

  console.log("Before: 0 matching inspections, 0 matching observations");

  const res1 = await fetch("http://localhost:5001/api/v1/inspections", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  
  const inspections1 = await prisma.inspection.findMany({ where: { clientRefId } });
  const obs1 = await prisma.observation.findMany({ where: { description: { contains: "CLEAN IDEMPOTENCY DESC" } } });
  
  console.log(`After request #1:`);
  console.log(`expected inspection count: 1 | actual: ${inspections1.length}`);
  console.log(`expected observation count: 2 | actual: ${obs1.length}`);

  const res2 = await fetch("http://localhost:5001/api/v1/inspections", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  const inspections2 = await prisma.inspection.findMany({ where: { clientRefId } });
  const obs2 = await prisma.observation.findMany({ where: { description: { contains: "CLEAN IDEMPOTENCY DESC" } } });
  
  console.log(`After request #2:`);
  console.log(`expected inspection count: 1 | actual: ${inspections2.length}`);
  console.log(`expected observation count: 2 | actual: ${obs2.length}`);
  
  await prisma.$disconnect();
}

testCleanState().catch(console.error);
