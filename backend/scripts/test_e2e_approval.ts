import { PrismaClient } from "@prisma/client";

const API_URL = "http://127.0.0.1:5001/api/v1";

async function runTests() {
  console.log("=== STARTING E2E APPROVAL WORKFLOW TESTS ===");

  const prisma = new PrismaClient();
  await prisma.user.deleteMany({
    where: { email: { in: ["test.c1@minesight.com", "test.c2@minesight.com"] } }
  });
  await prisma.contractor.deleteMany({
    where: { email: { in: ["test.c1@minesight.com", "test.c2@minesight.com"] } }
  });
  await prisma.$disconnect();

  // 1. Register Contractor 1
  let c1Reg = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Contractor One",
      email: "test.c1@minesight.com",
      password: "Password123",
      role: "CONTRACTOR",
      companyName: "E2E Testing Corp",
      taskType: "blasting"
    })
  }).then(res => res.json());

  console.log("C1 Registered:", c1Reg.success);
  if (!c1Reg.success) throw new Error(JSON.stringify(c1Reg));

  let c1Token = c1Reg.data.token;
  let c1Id = c1Reg.data.user.contractorId;

  // 2. Try fetching governance APIs (should fail 403)
  let govRes = await fetch(`${API_URL}/observations`, {
    headers: { Authorization: `Bearer ${c1Token}` }
  });
  console.log("C1 (Pending) fetching observations status:", govRes.status, await govRes.json());
  if (govRes.status !== 403) throw new Error("Expected 403 for PENDING contractor");

  // 3. Login Supervisor
  let supLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "supervisor@minesight.com", password: "Admin@123" })
  }).then(res => res.json());

  let supToken = supLogin.data.token;

  // 4. Supervisor gets Pending
  let pendingRes = await fetch(`${API_URL}/contractors?status=PENDING`, {
    headers: { Authorization: `Bearer ${supToken}` }
  }).then(res => res.json());
  console.log("Pending Contractors Count:", pendingRes.data.length);
  if (!pendingRes.data.find((c: any) => c.id === c1Id)) throw new Error("C1 not found in pending");

  // 5. Supervisor approves C1
  let approveRes = await fetch(`${API_URL}/contractors/${c1Id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${supToken}` },
    body: JSON.stringify({ status: "ACTIVE" })
  }).then(res => res.json());
  console.log("Supervisor Approved C1:", approveRes.success);

  // 6. C1 tries API again
  let govRes2 = await fetch(`${API_URL}/observations`, {
    headers: { Authorization: `Bearer ${c1Token}` }
  });
  console.log("C1 (Active) fetching observations status:", govRes2.status);
  if (govRes2.status !== 200) throw new Error("Expected 200 for ACTIVE contractor");

  // 7. Register Contractor 2
  let c2Reg = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Contractor Two",
      email: "test.c2@minesight.com",
      password: "Password123",
      role: "CONTRACTOR",
      companyName: "Rejected Testing Corp",
      taskType: "transportation"
    })
  }).then(res => res.json());
  
  let c2Token = c2Reg.data.token;
  let c2Id = c2Reg.data.user.contractorId;

  // 8. Supervisor rejects C2
  let rejectRes = await fetch(`${API_URL}/contractors/${c2Id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${supToken}` },
    body: JSON.stringify({ status: "REJECTED", rejectionReason: "Invalid documents" })
  }).then(res => res.json());
  console.log("Supervisor Rejected C2:", rejectRes.success);

  // 9. C2 tries auth/me
  let c2Me = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${c2Token}` }
  }).then(res => res.json());
  
  console.log("C2 Status:", c2Me.data.contractorStatus, "| Reason:", c2Me.data.rejectionReason);
  if (c2Me.data.contractorStatus !== "REJECTED") throw new Error("Expected REJECTED");

  console.log("=== ALL TESTS PASSED ===");
}

runTests().catch(console.error);
