// =============================================================================
// AzProjects - PM2 Production Process Management Configuration
// Run on Ubuntu: pm2 start deploy/pm2/ecosystem.config.cjs
// =============================================================================

module.exports = {
  apps: [
    {
      name: "azprojects-backend",
      script: "dist/server.cjs",
      instances: "max", // Utilize all CPU cores in cluster mode
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_file: ".env",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/azprojects/pm2_error.log",
      out_file: "/var/log/azprojects/pm2_out.log",
      merge_logs: true,
      autorestart: true,
      restart_delay: 4000,
      kill_timeout: 5000,
    },
  ],
};
