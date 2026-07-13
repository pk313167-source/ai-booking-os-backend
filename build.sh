#!/bin/bash
set -e

echo "Starting build process..."
npm install
npm run build

echo "Running migrations..."
# Use the locally installed knex with ts-node/register
./node_modules/.bin/knex migrate:latest --knexfile knexfile.ts --env production

echo "Build and migration completed successfully!"
