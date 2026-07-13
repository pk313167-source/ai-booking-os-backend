#!/bin/bash
set -e

echo "Starting build process..."
npm install
npm run build

echo "Running migrations..."
# Check if knex is in the path, otherwise use node_modules
if command -v knex &> /dev/null
then
    knex migrate:latest --knexfile knexfile.ts --env production
else
    ./node_modules/.bin/knex migrate:latest --knexfile knexfile.ts --env production
fi

echo "Build and migration completed successfully!"
