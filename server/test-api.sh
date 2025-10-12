#!/bin/bash

# LATAM DeFi API Test Script
# This script tests all major endpoints of the backend API

API_URL="http://localhost:3001/api"
EMAIL="test@example.com"
PASSWORD="password123"

echo "====================================="
echo " LATAM DeFi Backend API Tests"
echo "====================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s -X GET "$API_URL/health" | jq '.'
echo ""

# Test 2: Register User
echo "2. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"language\":\"en\"}")

echo "$REGISTER_RESPONSE" | jq '.'
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Registration failed. Attempting login..."

  # Test 3: Login User
  echo "3. Logging in existing user..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

  echo "$LOGIN_RESPONSE" | jq '.'
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
fi

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "ERROR: Could not get authentication token"
  exit 1
fi

echo ""
echo "Authentication Token: $TOKEN"
echo ""

# Test 4: Mock Wallet Connect
echo "4. Testing Wallet Connect..."
curl -s -X POST "$API_URL/auth/wallet-connect" | jq '.'
echo ""

# Test 5: Mint Stablecoin
echo "5. Minting USD stablecoin..."
curl -s -X POST "$API_URL/stablecoin/mint" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":100,"symbol":"USD","collateral_amount":200}' | jq '.'
echo ""

# Test 6: List Vaults
echo "6. Listing available vaults..."
VAULTS_RESPONSE=$(curl -s -X GET "$API_URL/vaults" \
  -H "Authorization: Bearer $TOKEN")
echo "$VAULTS_RESPONSE" | jq '.'
VAULT_ID=$(echo "$VAULTS_RESPONSE" | jq -r '.vaults[0].id')
echo ""

# Test 7: Deposit to Vault
echo "7. Depositing to vault..."
curl -s -X POST "$API_URL/vaults/$VAULT_ID/deposit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":50}' | jq '.'
echo ""

# Test 8: Borrow from Vault
echo "8. Creating borrow position..."
curl -s -X POST "$API_URL/vaults/$VAULT_ID/borrow" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":20,"collateral":50}' | jq '.'
echo ""

# Test 9: Get Positions
echo "9. Getting user positions..."
curl -s -X GET "$API_URL/vaults/positions" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 10: Stake Tokens
echo "10. Staking LATAM tokens..."
STAKE_RESPONSE=$(curl -s -X POST "$API_URL/governance/stake" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":1000,"lock_months":6}')
echo "$STAKE_RESPONSE" | jq '.'
STAKE_ID=$(echo "$STAKE_RESPONSE" | jq -r '.stake_id')
echo ""

# Test 11: List Proposals
echo "11. Listing governance proposals..."
PROPOSALS_RESPONSE=$(curl -s -X GET "$API_URL/governance/proposals" \
  -H "Authorization: Bearer $TOKEN")
echo "$PROPOSALS_RESPONSE" | jq '.'
PROPOSAL_ID=$(echo "$PROPOSALS_RESPONSE" | jq -r '.proposals[0].id')
echo ""

# Test 12: Vote on Proposal
echo "12. Voting on proposal..."
curl -s -X POST "$API_URL/governance/proposals/$PROPOSAL_ID/vote" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"vote":"for"}' | jq '.'
echo ""

# Test 13: Check Rewards
echo "13. Checking staking rewards..."
curl -s -X GET "$API_URL/governance/rewards/claim" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 14: Admin - Get Users
echo "14. Getting user list (admin)..."
curl -s -X GET "$API_URL/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 15: Admin - Get Metrics
echo "15. Getting platform metrics (admin)..."
curl -s -X GET "$API_URL/admin/metrics" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 16: Redeem Stablecoin
echo "16. Redeeming USD stablecoin..."
curl -s -X POST "$API_URL/stablecoin/redeem" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":10,"symbol":"USD"}' | jq '.'
echo ""

echo "====================================="
echo " All Tests Completed!"
echo "====================================="
