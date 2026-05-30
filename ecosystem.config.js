module.exports = {
  apps: [
    {
      name: "petek-expense",
      script: "server.js",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "petek-expense-backup",
      script: "backup-runner.js",
      env_file: ".env",
    },
  ],
};
