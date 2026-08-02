#!/bin/bash
cd /home/ubuntu/ai-booking-os-backend
# Remove frontend/pnpm-lock.yaml so Render doesn't auto-detect pnpm
rm -f frontend/pnpm-lock.yaml
# Remove sqlite3 from package.json since the app uses Neon PostgreSQL
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
delete pkg.dependencies.sqlite3;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
# Also update .gitignore to prevent pnpm-lock.yaml from being committed
echo "frontend/pnpm-lock.yaml" >> .gitignore
echo "done"
