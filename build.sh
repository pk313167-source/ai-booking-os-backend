#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Copying migrations to dist..."
mkdir -p dist/src/db/migrations
cp src/db/migrations/*.ts dist/src/db/migrations/

echo "Running migrations..."
./node_modules/.bin/knex migrate:latest --knexfile knexfile.ts --env production

echo "Build successful!"
