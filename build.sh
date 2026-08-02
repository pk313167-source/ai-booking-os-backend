#!/usr/bin/env bash
set -o errexit
echo "=== BUILD START ==="
echo "Node version:"
node --version
echo "NPM version:"
npm --version
echo "Current directory:"
pwd
echo "Files in current directory:"
ls -la
echo "Installing dependencies..."
npm install
echo "Building project..."
npm run build
echo "Running migrations..."
node -r ts-node/register ./node_modules/.bin/knex migrate:latest --knexfile knexfile.ts --env production || { echo "Migration failed, but continuing..."; }
echo "=== BUILD COMPLETE ==="
