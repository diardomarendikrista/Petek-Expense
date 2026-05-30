module.exports = {
  apps: [
    {
      name: "petek-expense",
      script: "node",
      args: "node_modules/next/dist/bin/next start",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "petek-expense-backup",
      script: "node",
      args: "node_modules/tsx/dist/cli.mjs scripts/backup.ts",
    },
  ],
};
