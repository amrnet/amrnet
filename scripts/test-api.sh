#!/bin/bash

echo "🧪 Testing AMRnet API Endpoints"
echo "================================"

BASE_URL="http://localhost:8080"

echo "1. Testing health endpoint..."
curl -s "$BASE_URL/api/health" | jq . 2>/dev/null || curl -s "$BASE_URL/api/health"

echo -e "\n2. Testing collection counts..."
curl -s "$BASE_URL/api/getCollectionCounts" | jq . 2>/dev/null || curl -s "$BASE_URL/api/getCollectionCounts"

echo -e "\n3. Testing STyphi data endpoint..."
response=$(curl -s -w "%{http_code}" "$BASE_URL/api/getDataForSTyphi")
http_code="${response: -3}"
body="${response%???}"

echo "HTTP Status: $http_code"
if [ "$http_code" = "200" ]; then
    content_type=$(curl -s -I "$BASE_URL/api/getDataForSTyphi" | grep -i content-type)
    echo "Content-Type: $content_type"
    if echo "$body" | grep -q "<!doctype html>"; then
        echo "❌ API returned HTML instead of JSON data"
    else
        echo "✅ API returned JSON data"
        echo "$body" | head -c 100
    fi
else
    echo "❌ API returned error $http_code"
    echo "$body"
fi

echo -e "\n================================"
