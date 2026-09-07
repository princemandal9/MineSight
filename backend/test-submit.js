

async function testSubmit() {
  const payload = {
    clientRefId: `ins-${Date.now()}`,
    inspectorId: "Inspector R. Verma",
    zone: "TEST ZONE",
    contractorId: "fd0245a9-b98c-48a6-a505-dc33c8f995d4", // Use a real ID, wait, better use a fetch to get one or we can just omit it
    taskType: "Excavation",
    latitude: 23.7,
    longitude: 86.4,
    locationAccuracy: 10,
    startedAt: new Date().toISOString(),
    observations: [
      {
        contractorId: "fd0245a9-b98c-48a6-a505-dc33c8f995d4",
        category: "PPE",
        severity: "CRITICAL",
        description: "TEST INSPECTION 123",
      }
    ]
  };

  try {
    const headers = { 
      "Content-Type": "application/json",
      "x-user-role": "SUPERVISOR",
      "x-user-id": "test-supervisor-123"
    };

    const res = await fetch("http://localhost:5001/api/v1/contractors", { headers });
    const json = await res.json();
    const cId = json.data[0].id;
    payload.contractorId = cId;
    payload.observations[0].contractorId = cId;

    const res2 = await fetch("http://localhost:5001/api/v1/inspections", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    
    console.log("Status:", res2.status);
    console.log("Response:", await res2.json());
    
    // Now fetch observations to see if it's there
    const res3 = await fetch("http://localhost:5001/api/v1/observations");
    const json3 = await res3.json();
    console.log("Observations count:", json3.data.length);
    const found = json3.data.find(o => o.description === "TEST INSPECTION 123");
    console.log("Found:", found);

  } catch (err) {
    console.error(err);
  }
}

testSubmit();
