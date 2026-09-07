// test-large.js
async function testLargePayload() {
  const headers = { 
    "Content-Type": "application/json",
    "x-user-role": "SUPERVISOR",
    "x-user-id": "test-supervisor-123"
  };

  const dummyBase64 = "data:image/gif;base64," + "A".repeat(1024 * 1024 * 2);

  const payload = {
    clientRefId: `ins-large-${Date.now()}`,
    inspectorId: "Inspector",
    zone: "TEST",
    contractorId: "fd0245a9-b98c-48a6-a505-dc33c8f995d4",
    taskType: "Excavation",
    observations: [
      {
        contractorId: "fd0245a9-b98c-48a6-a505-dc33c8f995d4",
        category: "PPE",
        severity: "CRITICAL",
        description: "LARGE",
        photoBase64: dummyBase64,
      }
    ]
  };

  const res = await fetch("http://localhost:5001/api/v1/inspections", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

testLargePayload().catch(console.error);
