#!/bin/bash
# HireLoop — Mac Setup Fix Script
# Run this from the hireloop/backend folder

echo "🔧 HireLoop Backend Setup for Mac"
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "✅ Node.js version: $(node -v)"

# Check Xcode tools (required for native modules)
if ! xcode-select -p &>/dev/null; then
  echo "❌ Xcode Command Line Tools not found."
  echo "   Run: xcode-select --install"
  echo "   Then re-run this script."
  exit 1
fi
echo "✅ Xcode CLI tools: OK"

# Clean install
echo ""
echo "📦 Installing dependencies..."
rm -rf node_modules package-lock.json
npm install

echo ""
echo "🌱 Seeding database..."
node src/db/seed.js

echo ""
echo "🚀 Starting server..."
npm run dev
