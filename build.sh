#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Running migrations..."
# Use the local knex binary and point to the knexfile.ts using ts-node/register
./node_modules/.bin/knex migrate:latest --knexfile knexfile.ts --env production

echo "Build and migration successful!"
