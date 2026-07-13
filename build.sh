#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Checking environment..."
echo "NODE_ENV: $NODE_ENV"

echo "Running migrations..."
# Use ts-node to run migrations using the TS knexfile
./node_modules/.bin/knex migrate:latest --knexfile knexfile.ts --env production || { echo "Migration failed, but continuing build..."; }

echo "Build successful!"
