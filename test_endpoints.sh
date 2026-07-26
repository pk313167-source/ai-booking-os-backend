#!/bin/bash
BASE_URL="http://localhost:4000/api"

# Login to get token
echo "=== LOGIN ==="
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testbiz@example.com","password":"password123"}')
TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "Token obtained: ${TOKEN:0:50}..."

# =====================
# SERVICES API
# =====================
echo -e "\n=== CREATE SERVICE ==="
SERVICE_RESP=$(curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Haircut","description":"Professional haircut","duration":30,"price":25.99,"category":"Hair"}')
echo "$SERVICE_RESP"
SERVICE_ID=$(echo "$SERVICE_RESP" | head -1 | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Service ID: $SERVICE_ID"

echo -e "\n=== CREATE SERVICE 2 ==="
SERVICE_RESP2=$(curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Beard Trim","description":"Beard trimming service","duration":15,"price":15.00,"category":"Hair"}')
echo "$SERVICE_RESP2"
SERVICE_ID2=$(echo "$SERVICE_RESP2" | head -1 | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo -e "\n=== LIST SERVICES ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/services -H "Authorization: Bearer $TOKEN"

echo -e "\n=== GET SERVICE BY ID ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/services/$SERVICE_ID -H "Authorization: Bearer $TOKEN"

echo -e "\n=== UPDATE SERVICE ==="
curl -s -w "\nHTTP:%{http_code}" -X PUT $BASE_URL/services/$SERVICE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":29.99,"description":"Professional haircut with styling"}'

echo -e "\n=== DELETE SERVICE ==="
curl -s -w "\nHTTP:%{http_code}" -X DELETE $BASE_URL/services/$SERVICE_ID2 \
  -H "Authorization: Bearer $TOKEN"

# =====================
# CUSTOMERS API
# =====================
echo -e "\n\n=== CREATE CUSTOMER ==="
CUSTOMER_RESP=$(curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"555-1234","notes":"VIP customer"}')
echo "$CUSTOMER_RESP"
CUSTOMER_ID=$(echo "$CUSTOMER_RESP" | head -1 | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Customer ID: $CUSTOMER_ID"

echo -e "\n=== CREATE CUSTOMER 2 ==="
CUSTOMER_RESP2=$(curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane@example.com","phone":"555-5678"}')
echo "$CUSTOMER_RESP2"
CUSTOMER_ID2=$(echo "$CUSTOMER_RESP2" | head -1 | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo -e "\n=== LIST CUSTOMERS ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/customers -H "Authorization: Bearer $TOKEN"

echo -e "\n=== GET CUSTOMER BY ID ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/customers/$CUSTOMER_ID -H "Authorization: Bearer $TOKEN"

echo -e "\n=== UPDATE CUSTOMER ==="
curl -s -w "\nHTTP:%{http_code}" -X PUT $BASE_URL/customers/$CUSTOMER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone":"555-9999","notes":"Updated VIP customer"}'

# =====================
# STAFF API
# =====================
echo -e "\n\n=== CREATE STAFF ==="
STAFF_RESP=$(curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/staff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Barber","email":"alice@barber.com","role":"Senior Barber","specialties":["haircut","beard_trim"],"availability":{"monday":{"start":"09:00","end":"18:00"},"tuesday":{"start":"09:00","end":"18:00"}}}')
echo "$STAFF_RESP"
STAFF_ID=$(echo "$STAFF_RESP" | head -1 | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Staff ID: $STAFF_ID"

echo -e "\n=== CREATE STAFF 2 ==="
STAFF_RESP2=$(curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/staff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob Stylist","email":"bob@barber.com","role":"Stylist","specialties":["coloring","styling"],"availability":{"wednesday":{"start":"10:00","end":"20:00"}}}')
echo "$STAFF_RESP2"
STAFF_ID2=$(echo "$STAFF_RESP2" | head -1 | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo -e "\n=== LIST STAFF ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/staff -H "Authorization: Bearer $TOKEN"

echo -e "\n=== GET STAFF BY ID ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/staff/$STAFF_ID -H "Authorization: Bearer $TOKEN"

echo -e "\n=== UPDATE STAFF ==="
curl -s -w "\nHTTP:%{http_code}" -X PUT $BASE_URL/staff/$STAFF_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"Master Barber"}'

# =====================
# BOOKINGS API
# =====================
echo -e "\n\n=== CREATE BOOKING ==="
BOOKING_RESP=$(curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"$CUSTOMER_ID\",\"serviceId\":\"$SERVICE_ID\",\"staffId\":\"$STAFF_ID\",\"date\":\"2026-08-01\",\"time\":\"10:00\",\"duration\":30,\"status\":\"confirmed\",\"notes\":\"First visit\"}")
echo "$BOOKING_RESP"
BOOKING_ID=$(echo "$BOOKING_RESP" | head -1 | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Booking ID: $BOOKING_ID"

echo -e "\n=== CREATE BOOKING 2 ==="
curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"$CUSTOMER_ID2\",\"serviceId\":\"$SERVICE_ID\",\"staffId\":\"$STAFF_ID2\",\"date\":\"2026-08-02\",\"time\":\"14:00\",\"duration\":45,\"status\":\"pending\"}"

echo -e "\n=== LIST BOOKINGS ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/bookings -H "Authorization: Bearer $TOKEN"

echo -e "\n=== GET BOOKING BY ID ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/bookings/$BOOKING_ID -H "Authorization: Bearer $TOKEN"

echo -e "\n=== UPDATE BOOKING ==="
curl -s -w "\nHTTP:%{http_code}" -X PUT $BASE_URL/bookings/$BOOKING_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","notes":"Completed - customer was very happy"}'

echo -e "\n=== LIST BOOKINGS FILTERED (status=completed) ==="
curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/bookings?status=completed" -H "Authorization: Bearer $TOKEN"

echo -e "\n=== DOUBLE BOOKING CHECK ==="
echo "Attempting to double-book Alice at same date/time..."
curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"$CUSTOMER_ID2\",\"serviceId\":\"$SERVICE_ID\",\"staffId\":\"$STAFF_ID\",\"date\":\"2026-08-01\",\"time\":\"10:00\",\"duration\":30,\"status\":\"confirmed\"}"

echo -e "\n=== DELETE BOOKING ==="
curl -s -w "\nHTTP:%{http_code}" -X DELETE $BASE_URL/bookings/$BOOKING_ID \
  -H "Authorization: Bearer $TOKEN"

# =====================
# VALIDATION TESTS
# =====================
echo -e "\n\n=== VALIDATION: Missing required field ==="
curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"duration":30,"price":25.99}'

echo -e "\n=== VALIDATION: Invalid email ==="
curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"not-an-email"}'

echo -e "\n=== VALIDATION: Negative price ==="
curl -s -w "\nHTTP:%{http_code}" -X POST $BASE_URL/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","duration":30,"price":-10}'

# =====================
# UNAUTHORIZED TESTS
# =====================
echo -e "\n\n=== UNAUTHORIZED: No token ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/services

echo -e "\n=== NOT FOUND: Non-existent resource ==="
curl -s -w "\nHTTP:%{http_code}" $BASE_URL/services/non-existent-id -H "Authorization: Bearer $TOKEN"

echo -e "\n=== ALL TESTS COMPLETE ==="
