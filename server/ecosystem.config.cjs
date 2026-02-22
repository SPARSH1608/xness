module.exports = {
    apps: [
        {
            name: "xness-api",
            script: "./index.js",
            env: {
                NODE_ENV: "production",
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
        },
        {
            name: "xness-consumer",
            script: "./binance-consumer/index.js",
            env: {
                NODE_ENV: "production",
            },
            instances: 1,
            autorestart: true,
            watch: false,
        },
        {
            name: "xness-cron",
            script: "./liquidationCron.js",
            env: {
                NODE_ENV: "production",
            },
            instances: 1,
            autorestart: true,
            watch: false,
        },
    ],
};
