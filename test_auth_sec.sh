#!/bin/bash
BASE_URL="http://localhost:5001/api/v1/auth/me"

# TEST 1: No Authorization header
RES1=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
echo "TEST 1: $RES1 (Expected: 401)"

# TEST 2: No Auth + x-user-role SUPERVISOR
RES2=$(curl -s -o /dev/null -w "%{http_code}" -H "x-user-role: SUPERVISOR" -H "x-user-id: 1" "$BASE_URL")
echo "TEST 2: $RES2 (Expected: 401)"

# TEST 3: No Auth + x-user-role CONTRACTOR
RES3=$(curl -s -o /dev/null -w "%{http_code}" -H "x-user-role: CONTRACTOR" -H "x-user-id: 2" "$BASE_URL")
echo "TEST 3: $RES3 (Expected: 401)"

# TEST 4: Malformed Bearer token
RES4=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer not-a-real-token" "$BASE_URL")
echo "TEST 4: $RES4 (Expected: 401)"

# TEST 5: Invalid JWT
RES5=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.wrongsig" "$BASE_URL")
echo "TEST 5: $RES5 (Expected: 401)"

# Get Valid Supervisor Token
SUP_TOKEN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"supervisor@minesight.in","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
# Get Valid Contractor Token
CON_TOKEN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@apex.com","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# TEST 7: Valid Supervisor JWT
if [ -n "$SUP_TOKEN" ]; then
  RES7=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $SUP_TOKEN" "$BASE_URL")
  ROLE7=$(curl -s -H "Authorization: Bearer $SUP_TOKEN" "$BASE_URL" | jq -r '.data.role')
  echo "TEST 7: Code $RES7, Role $ROLE7 (Expected: 200, SUPERVISOR)"
else
  echo "TEST 7: Failed to get Supervisor token"
fi

# TEST 8: Valid Contractor JWT
if [ -n "$CON_TOKEN" ]; then
  RES8=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $CON_TOKEN" "$BASE_URL")
  ROLE8=$(curl -s -H "Authorization: Bearer $CON_TOKEN" "$BASE_URL" | jq -r '.data.role')
  echo "TEST 8: Code $RES8, Role $ROLE8 (Expected: 200, CONTRACTOR)"
else
  echo "TEST 8: Failed to get Contractor token"
fi

# TEST 9: Valid Contractor JWT + x-user-role: SUPERVISOR
if [ -n "$CON_TOKEN" ]; then
  RES9=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $CON_TOKEN" -H "x-user-role: SUPERVISOR" "$BASE_URL")
  ROLE9=$(curl -s -H "Authorization: Bearer $CON_TOKEN" -H "x-user-role: SUPERVISOR" "$BASE_URL" | jq -r '.data.role')
  echo "TEST 9: Code $RES9, Role $ROLE9 (Expected: 200, CONTRACTOR)"
fi

# TEST 10: Valid Supervisor JWT + x-user-id belonging to another user
if [ -n "$SUP_TOKEN" ]; then
  ID10=$(curl -s -H "Authorization: Bearer $SUP_TOKEN" -H "x-user-id: totally-fake-id-999" "$BASE_URL" | jq -r '.data.id')
  echo "TEST 10: ID $ID10 (Expected: actual supervisor ID, not fake id)"
fi

