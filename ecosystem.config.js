module.exports = {
  apps: [
    {
      name: "petek-expense",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "petek-expense-backup",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "scripts/backup.ts",
    },
  ],
};
