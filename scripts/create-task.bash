#!/bin/bash

API_URL="http://localhost:8080/api/v1"
EMAIL="hadeed12@gmail.com"
PASSWORD="Hadeed#12345"

LOGIN_RESPONSE=$(curl -sS -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.user.id // empty')

if [ -z "$TOKEN" ]; then
    echo "Login failed."
    echo "$LOGIN_RESPONSE" | jq .
    exit 1
fi

if [ -z "$USER_ID" ]; then
    echo "Login succeeded, but user ID was not found."
    echo "$LOGIN_RESPONSE" | jq .
    exit 1
fi

echo "Login successful."
echo "Authenticated User ID: $USER_ID"
echo "Starting task creation..."

COUNTER=1

while true; do
    RESPONSE=$(curl -sS -w "\n%{http_code}" \
        -X POST "$API_URL/tasks" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"Load Test Task $COUNTER\",
            \"description\": \"Task created by the continuous task creation script\",
            \"priority\": \"medium\",
            \"assigned_to_id\": $USER_ID
        }")

    HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Task $COUNTER -> HTTP $HTTP_STATUS"

    if [ "$HTTP_STATUS" -lt 200 ] || [ "$HTTP_STATUS" -ge 300 ]; then
        echo "Response:"
        echo "$BODY" | jq .
    fi

    COUNTER=$((COUNTER + 1))

    sleep 0.3
done