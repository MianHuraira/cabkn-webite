module.exports = {
  apps: [
    {
      name: 'Cabkn-Website',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable load balancing
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 2003  // Change if you need a different port
      }
    }
  ]
};
