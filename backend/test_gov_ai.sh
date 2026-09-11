#!/bin/bash
echo "Logging in as supervisor..."
SUP_TOKEN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"supervisor@minesight.in","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SUP_TOKEN" ]; then
  echo "Failed to log in."
  exit 1
fi

echo "Fetching a contractor ID..."
CONTRACTOR_ID=$(curl -s -H "Authorization: Bearer $SUP_TOKEN" http://localhost:5001/api/v1/contractors | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$CONTRACTOR_ID" ]; then
  echo "No contractor found."
  exit 1
fi

echo "Analyzing Governance for contractor: $CONTRACTOR_ID"
curl -s -X POST http://localhost:5001/api/v1/governance/analyze \
  -H "Authorization: Bearer $SUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"contractorId\":\"$CONTRACTOR_ID\"}" | jq .
