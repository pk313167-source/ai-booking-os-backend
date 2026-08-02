#!/usr/bin/env bash
set -o errexit

echo "Installing dependencies..."
npm install --include=dev

echo "Building project..."
npm run build

echo "Running migrations..."
node -r ts-node/register ./node_modules/.bin/knex migrate:latest --knexfile knexfile.ts --env production || { echo "Migration failed, but continuing..."; }

echo "Build complete!"
