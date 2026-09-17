#!/bin/bash

API_URL="http://localhost:8080/api/v1"
EMAIL="hadeed12@gmail.com"
PASSWORD="Hadeed#12345"

LOGIN_RESPONSE=$(curl -sS -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ -z "$TOKEN" ]; then
    echo "Login failed: unable to extract access token."
    echo "Backend response:"
    echo "$LOGIN_RESPONSE" | jq .
    exit 1
fi

echo "Login successful."
echo "Token acquired."

while true; do
    curl -sS -o /dev/null -w "%{http_code}\n" \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL/tasks"

    sleep 0.3
done