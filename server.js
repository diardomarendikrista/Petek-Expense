require('dotenv').config();
const cli = require.resolve('next/dist/bin/next');

// Force the arguments for Next.js CLI
process.argv.length = 2;
process.argv.push('start');

// Enforce port from .env
if (process.env.PORT) {
  process.argv.push('-p', process.env.PORT);
}

// Start Next.js
require(cli);
