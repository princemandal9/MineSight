const assert = require("assert");

const API_URL = "http://localhost:5001/api/v1";

async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  return { token: data.data.token, contractorId: data.data.user.contractorId };
}

async function runTests() {
  // Use existing contractor@abc.com
  const authA = await login("contractor@abc.com", "password123");
  const tokenA = authA.token;
  const idA = authA.contractorId;

  // Use pending@northern.in
  const authB = await login("pending@northern.in", "password123");
  const tokenB = authB.token;
  const idB = authB.contractorId;

  // Get A's licenses
  let res = await fetch(`${API_URL}/licenses`, { headers: { Authorization: `Bearer ${tokenA}` }});
  let json = await res.json();
  if (json.data.length === 0) { console.error("No licenses found for A to test with."); return; }
  const licenseIdA = json.data[0].id;

  console.log(`[Test] Unauthenticated GET:`);
  res = await fetch(`${API_URL}/licenses`);
  if (res.status === 401) console.log("✅ Passed"); else console.log("❌ Failed", res.status);

  console.log(`[Test] Contractor A GET A's License:`);
  res = await fetch(`${API_URL}/licenses/${licenseIdA}`, { headers: { Authorization: `Bearer ${tokenA}` }});
  if (res.status === 200) console.log("✅ Passed"); else console.log("❌ Failed", res.status);

  console.log(`[Test] Contractor B GET A's License:`);
  res = await fetch(`${API_URL}/licenses/${licenseIdA}`, { headers: { Authorization: `Bearer ${tokenB}` }});
  if (res.status === 404) console.log("✅ Passed"); else console.log("❌ Failed", res.status);

  console.log(`[Test] Contractor B DELETE A's License:`);
  res = await fetch(`${API_URL}/licenses/${licenseIdA}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokenB}` }});
  if (res.status === 404) console.log("✅ Passed"); else console.log("❌ Failed", res.status);

  console.log(`[Test] Contractor A GET Collection tampering with B's id:`);
  res = await fetch(`${API_URL}/licenses?contractorId=${idB}`, { headers: { Authorization: `Bearer ${tokenA}` }});
  json = await res.json();
  if (json.data.length > 0 && json.data.every(d => d.contractorId === idA)) console.log("✅ Passed"); 
  else if (json.data.length === 0) console.log("✅ Passed (Empty but safe)");
  else console.log("❌ Failed (leaked)");
}

runTests().catch(console.error);
