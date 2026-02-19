# AWS EC2 Deployment Guide for Xness

This guide lists the steps to deploy the Xness full-stack application on an AWS EC2 instance running Ubuntu 22.04.

## Prerequisites

1.  **AWS Account**: An active AWS account.
2.  **EC2 Instance**: Launch an instance with the following specs:
    -   **OS**: Ubuntu Server 22.04 LTS (HVM)
    -   **Instance Type**: `t3.small` or `t3.medium` (recommended due to Docker containers). `t2.micro` might struggle with memory.
    -   **Storage**: At least 20GB gp3.
    -   **Security Group**: Allow Inbound traffic on:
        -   SSH (22)
        -   HTTP (80)
        -   HTTPS (443)
        -   Custom TCP (3000) - Optional, for direct backend testing.

## Step 1: Connect to your Instance

SSH into your server using your key pair:

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

## Step 2: System Updates & Installation

Update the package list and install necessary tools.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx build-essential
```

### Install Node.js (v20)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install Docker & Docker Compose

```bash
# Install Docker
sudo apt install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (avoids using sudo for docker commands)
sudo usermod -aG docker $USER

# Install Docker Compose Standalone
sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# IMPORTANT: Log out and log back in for group changes to take effect
exit
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## Step 3: Clone the Repository

Clone your project to the server.

```bash
git clone https://github.com/SPARSH1608/xness.git
cd xness
```

*(Note: If it's a private repo, you may need to set up SSH keys or use a Personal Access Token).*

## Step 4: Backend Setup

The backend relies on Docker containers for Redis, Kafka, and Postgres.

### 1. Start Infrastructure (Docker)

```bash
cd server
docker-compose up -d
```
Check if services are running: `docker ps`

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create the `.env` file for the backend in the `server` directory.

```bash
nano .env
```

Paste the following content. These values are configured to work with the provided Docker setup and hardcoded paths in the application.

```env
# Prisma Database Connection
# format: postgresql://USER:PASSWORD@HOST:PORT/DB?schema=SCHEMA
DATABASE_URL="postgresql://sparsh:sparsh@localhost:5432/timescale?schema=public"

# Auth Secret (change this to a secure random string)
JWT_SECRET="change_me_to_something_secure"

# Application Port (The server hardcodes 3000, but good to have)
PORT=3000
```


### 4. Database Migration

Initialize your database schema.

```bash
npx prisma migrate deploy
```

### 5. Start Backend Services with PM2

We need to start the main server, the binance consumer, and the cron job.

```bash
# Start API Server
pm2 start index.js --name "api-server"

# Start Binance Consumer
pm2 start ./binance-consumer/index.js --name "binance-consumer"

# Start Liquidation Cron
pm2 start liquidationCron.js --name "liquidation-cron"

# Save PM2 list so it restarts on reboot
pm2 save
pm2 startup
```

## Step 5: Frontend Setup

### 1. Configure Environment Variables

Navigate to the frontend directory.

```bash
cd ../vite-project
nano .env
```

Update the `VITE_BASE_API_URL` to point to your server's public IP or domain name. **Ideally, use the relative path if serving via Nginx proxy to avoid CORS issues.**

```env
# Option A (Recommended with Nginx Proxy):
VITE_BASE_API_URL=/api
VITE_SOCKET_URL=/

# Option B (Direct connection):
VITE_BASE_API_URL=http://your-ec2-public-ip:3000/api
VITE_SOCKET_URL=http://your-ec2-public-ip:3000
```


### 2. Install Dependencies & Build

```bash
npm install
npm run build
```

This creates a `dist` folder inside `vite-project`.

## Step 6: Configure Nginx (Reverse Proxy)

Configure Nginx to serve the frontend and proxy API requests to the backend.

1.  Create a new config file:

```bash
sudo nano /etc/nginx/sites-available/xness
```

2.  Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com; # Or your Public IP

    # Serve Frontend Build
    location / {
        root /home/ubuntu/xness/vite-project/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API Requests to Backend
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy WebSocket Connections (Socket.io)
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

3.  Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/xness /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t                             # Test configuration
sudo systemctl restart nginx
```

## Step 7: Final Testing

1.  Open your browser and navigate to `http://your-ec2-public-ip`.
2.  The frontend should load.
3.  Check if charts/data are loading (verifies API connection).
4.  Check if real-time updates work (verifies WebSocket connection).

## Optional: SSL (HTTPS) with Certbot

For security, enable HTTPS.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Important Notes on Configuration

Review the following files if you change database credentials from the defaults (`sparsh`/`sparsh`):

1.  **`server/binance-consumer/index.js`**: Hardcoded PostgreSQL credentials.
2.  **`server/redisClient.js`**: Hardcoded Redis URL (`redis://localhost:6380`).
3.  **`server/binance-publisher/index.js`**: Hardcoded Redis URL.

Ensure any changes to passwords or ports in `docker-compose.yml` are reflected in these files.

