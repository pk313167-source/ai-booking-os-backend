#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Running migrations..."
# Run migrations and capture output
node -r ts-node/register ./node_modules/.bin/knex migrate:latest --knexfile knexfile.ts --env production || { echo "Migration failed, but continuing..."; }

echo "Build complete!"
