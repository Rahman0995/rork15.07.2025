#!/bin/bash

echo "🧪 Testing tRPC endpoints..."

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:3000/api/health | jq .

echo ""
echo "Testing tasks.getAll endpoint..."
curl -s "http://localhost:3000/api/trpc/tasks.getAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D" | jq .

echo ""
echo "Testing reports.getAll endpoint..."
curl -s "http://localhost:3000/api/trpc/reports.getAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D" | jq .

echo ""
echo "Testing example.hi endpoint..."
curl -s "http://localhost:3000/api/trpc/example.hi?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22name%22%3A%22Test%22%7D%7D%7D" | jq .