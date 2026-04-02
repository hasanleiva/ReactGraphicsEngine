// PM2 process manager config
// Usage: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'canva-editor-api',
      script: './server/index.js',
      cwd: '/home/user/React-Canva-editor-srcfold',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_PATH: './data/canva.db',
        UPLOADS_PATH: './uploads',
        // APP_URL: 'https://yourdomain.com',
      },
    },
  ],
};
