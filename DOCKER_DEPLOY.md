# Docker Deployment Guide for Xness

This guide explains how to deploy the full Xness stack (Frontend + Backend + DBs) using Docker Compose on a single AWS EC2 instance.

## Prerequisites

1.  **EC2 Instance**: Ubuntu 22.04 LTS, `t3.medium` (4GB RAM) or larger recommended.
2.  **Ports Open**: 80 (HTTP), 443 (HTTPS), 22 (SSH).
    *   3000, 5432, 6380, 9092 are optional (only if you want direct access from outside).

## Step 1: Install Docker on EC2

SSH into your instance and run:

```bash
# Update and install Docker
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 git

# Enable Docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
exit
# ssh back in...
```

## Step 2: Clone Repository

```bash
git clone https://github.com/SPARSH1608/xness.git
cd xness
```

## Step 3: Configure Environment

We have provided a default `.env` file in the root directory. This file contains database credentials, API secrets, and frontend build configurations.

1.  **Review `.env`**:
    ```bash
    nano .env
    ```
2.  **Update Secrets**: Change `JWT_SECRET`, `POSTGRES_PASSWORD`, etc., if deploying to production.
3.  **Frontend Config**:
    *   `VITE_BASE_API_URL` and `VITE_SOCKET_URL` are set to `/api` and `/` respectively. This works automatically with the Nginx proxy, so you likely **don't need to change this**.

### Note on Kafka
If you want to access Kafka from *outside* the EC2 instance, you might need to update `KAFKA_ADVERTISED_LISTENERS` in `docker-compose.yml`. For strictly internal communication, the default is fine.

## Step 4: Deploy

Run the following command in the root `xness` folder:

```bash
docker compose up -d --build
```

This will:
1.  Build the backend image.
2.  Build the frontend image (requires compiling React).
3.  Start Postgres (TimescaleDB), Redis, Zookeeper, Kafka.
4.  Initialize Kafka topics.
5.  Run database migrations.
6.  Start the API server, Binance Consumer, and Cron job.
7.  Start Nginx to serve the frontend.

## Step 5: Verify

1.  Visit `http://your-ec2-public-ip`
2.  The app should load.
3.  Check logs if something isn't working:

```bash
docker compose logs -f
```

## Troubleshooting

### Database Persistence
Data is persisted in the `ts-data` Docker volume. If you down the containers, data survives.

```bash
docker compose down       # Stops containers
docker compose down -v    # Stops containers AND deletes volumes (DATA LOSS)
```

### Re-deploying after changes
If you update code, you need to rebuild:

```bash
git pull
docker compose up -d --build
```
