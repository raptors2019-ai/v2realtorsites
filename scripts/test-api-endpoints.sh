#!/bin/bash
# E2E API endpoint tests for sri-collective and newhomeshow
# Usage: ./scripts/test-api-endpoints.sh [base_url_sri] [base_url_nhs]
#
# Requires dev servers running:
#   npm run dev (sri-collective:3001, newhomeshow:3000)

SRI_BASE="${1:-http://localhost:3001}"
NHS_BASE="${2:-http://localhost:3000}"
PASS=0
FAIL=0
TOTAL=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

assert_status() {
  local test_name="$1"
  local expected="$2"
  local actual="$3"
  local body="$4"
  TOTAL=$((TOTAL + 1))

  if [ "$actual" -eq "$expected" ]; then
    echo -e "${GREEN}PASS${NC} $test_name (HTTP $actual)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} $test_name — expected HTTP $expected, got $actual"
    echo "  Response: $(echo "$body" | head -c 200)"
    FAIL=$((FAIL + 1))
  fi
}

assert_json_field() {
  local test_name="$1"
  local field="$2"
  local expected="$3"
  local body="$4"
  TOTAL=$((TOTAL + 1))

  local actual
  actual=$(echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin).get('$field',''))" 2>/dev/null)

  if [ "$actual" = "$expected" ]; then
    echo -e "${GREEN}PASS${NC} $test_name ($field=$actual)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} $test_name — expected $field=$expected, got $field=$actual"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "========================================"
echo "  E2E API Endpoint Tests"
echo "========================================"
echo ""

# ------------------------------------------
# Test 1: Sri Collective — Contact form validation (missing fields)
# ------------------------------------------
echo -e "${YELLOW}--- Sri Collective: Contact API ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SRI_BASE/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "POST /api/contact — rejects incomplete payload" 400 "$HTTP_CODE" "$BODY"
assert_json_field "POST /api/contact — returns error message" "error" "Missing required fields" "$BODY"

# ------------------------------------------
# Test 2: Sri Collective — Contact form rejects bad email
# ------------------------------------------
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SRI_BASE/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "not-an-email",
    "interest": "buying",
    "message": "Test message"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "POST /api/contact — rejects invalid email" 400 "$HTTP_CODE" "$BODY"
assert_json_field "POST /api/contact — returns email error" "error" "Invalid email address" "$BODY"

# ------------------------------------------
# Test 3: Sri Collective — Properties API returns data
# ------------------------------------------
echo ""
echo -e "${YELLOW}--- Sri Collective: Properties API ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$SRI_BASE/api/properties?limit=2")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "GET /api/properties — returns 200" 200 "$HTTP_CODE" "$BODY"

# Check that response has the expected shape
HAS_PROPERTIES=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'properties' in d else 'false')" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$HAS_PROPERTIES" = "true" ]; then
  PROP_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('properties',[])))" 2>/dev/null)
  echo -e "${GREEN}PASS${NC} GET /api/properties — returns properties array ($PROP_COUNT items)"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} GET /api/properties — missing 'properties' field in response"
  FAIL=$((FAIL + 1))
fi

# ------------------------------------------
# Test 4: Sri Collective — Properties API with filters
# ------------------------------------------
RESPONSE=$(curl -s -w "\n%{http_code}" "$SRI_BASE/api/properties?city=Toronto&minPrice=500000&maxPrice=1000000&limit=2")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "GET /api/properties — accepts filter params" 200 "$HTTP_CODE" "$BODY"

# ------------------------------------------
# Test 5: Sri Collective — Chat API rejects empty messages
# ------------------------------------------
echo ""
echo -e "${YELLOW}--- Sri Collective: Chat API ---${NC}"

# Chat API requires at least one user message to function
RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 15 -X POST "$SRI_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

assert_status "POST /api/chat — accepts valid message" 200 "$HTTP_CODE" ""

# Chat API should 500 on empty messages (AI SDK requires at least one)
RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 10 -X POST "$SRI_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages": []}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

TOTAL=$((TOTAL + 1))
if [ "$HTTP_CODE" -eq 500 ] || [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}PASS${NC} POST /api/chat — rejects empty messages (HTTP $HTTP_CODE)"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} POST /api/chat — unexpected response to empty messages (HTTP $HTTP_CODE)"
  FAIL=$((FAIL + 1))
fi

# ------------------------------------------
# Test 6: NewHomeShow — Contact form validation
# ------------------------------------------
echo ""
echo -e "${YELLOW}--- NewHomeShow: Contact API ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$NHS_BASE/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "POST /api/contact — rejects incomplete payload" 400 "$HTTP_CODE" "$BODY"
assert_json_field "POST /api/contact — returns error message" "error" "Missing required fields" "$BODY"

# ------------------------------------------
# Test 7: NewHomeShow — Contact form rejects bad email
# ------------------------------------------
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$NHS_BASE/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "bad-email",
    "interest": "buying",
    "message": "Interested in pre-construction"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "POST /api/contact — rejects invalid email" 400 "$HTTP_CODE" "$BODY"

# ------------------------------------------
# Test 8: Sri Collective — Rates API
# ------------------------------------------
echo ""
echo -e "${YELLOW}--- Sri Collective: Rates API ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$SRI_BASE/api/rates")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

assert_status "GET /api/rates — returns 200" 200 "$HTTP_CODE" "$BODY"

# ------------------------------------------
# Summary
# ------------------------------------------
echo ""
echo "========================================"
echo "  Results: $PASS/$TOTAL passed, $FAIL failed"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
