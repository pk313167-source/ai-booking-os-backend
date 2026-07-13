#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

echo "Attempting migrations..."
./node_modules/.bin/knex migrate:latest --knexfile knexfile.ts --env production || true

echo "Build complete!"
