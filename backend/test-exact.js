const payload = {
  "clientRefId": "ins-1738221845610-8b1b223x1",
  "inspectorId": "Supervisor",
  "zone": "",
  "contractorId": "fd0245a9-b98c-48a6-a505-dc33c8f995d4",
  "taskType": "ROUTINE",
  "latitude": null,
  "longitude": null,
  "locationAccuracy": null,
  "startedAt": "2026-09-07T19:04:11.890Z",
  "observations": [
    {
      "id": "1738221845611",
      "contractorId": "fd0245a9-b98c-48a6-a505-dc33c8f995d4",
      "category": "PPE",
      "severity": "MODERATE",
      "description": "Test",
      "photoBase64": null,
      "photoPreview": null
    }
  ]
};

async function testExactPayload() {
  const headers = { 
    "Content-Type": "application/json",
    "x-user-role": "SUPERVISOR",
    "x-user-id": "test-supervisor-123"
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

testExactPayload().catch(console.error);
