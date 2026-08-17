#!/bin/bash
# Seed auth users for local development
# Usage: ./supabase/seed-auth.sh

set -euo pipefail

SUPABASE_URL="http://127.0.0.1:54321"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

create_user() {
  local email="$1"
  local password="$2"
  local role="$3"

  response=$(curl -s -w "\n%{http_code}" -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${email}\",
      \"password\": \"${password}\",
      \"app_metadata\": {\"role\": \"${role}\"},
      \"email_confirm\": true
    }")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "  Created ${role}: ${email}"
  elif echo "$body" | grep -q "User already registered"; then
    echo "  Already exists: ${email}"
  else
    echo "  Failed to create ${email}: ${body}"
  fi
}

echo "Seeding auth users..."
create_user "admin@sakura.local" "password" "admin"
create_user "operator@sakura.local" "password" "operator"
echo "Done."
