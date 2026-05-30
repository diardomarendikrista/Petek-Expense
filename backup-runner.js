require('dotenv').config();

// Register ts-node to execute TypeScript files on the fly
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs"
  }
});

// Run the backup script
require('./scripts/backup.ts');
