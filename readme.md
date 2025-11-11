# Xness - Crypto Trading Data Pipeline

A **real-time cryptocurrency trading data pipeline** that streams Binance trade data, processes it through Kafka, stores it in TimescaleDB with continuous aggregates for **OHLCV (Open, High, Low, Close, Volume)** calculations, and provides a **scalable foundation for trading analytics**.

---

## 🧠 Architecture Overview

```
Binance WebSocket → Kafka Producer → Kafka → Kafka Consumer → TimescaleDB → Continuous Aggregates (OHLCV)
```

---

## 🚀 Features

- Real-time cryptocurrency trade data ingestion from Binance  
- Kafka-based message streaming for reliable and scalable processing  
- TimescaleDB for high-performance time-series data storage  
- Automated **OHLCV aggregation** at multiple time intervals  
- Redis for caching and session management  
- Docker-based deployment with container networking  

---

## ⚙️ Prerequisites

- Docker and Docker Compose  
- Node.js (for producer/consumer applications)  
- PostgreSQL client (for database initialization)  

---

## ⚡ Quick Start

### 1. Create Docker Network
```
docker network create xness-net
```

### 2. Start Zookeeper
```
docker run -d --name zookeeper --network xness-net   -p 2181:2181   -e ZOOKEEPER_CLIENT_PORT=2181 -e ZOOKEEPER_TICK_TIME=2000   confluentinc/cp-zookeeper:7.3.0
```

### 3. Start Kafka
```
docker run -d --name kafka --network xness-net   -p 9092:9092   -e KAFKA_BROKER_ID=1   -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181   -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092   -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092   -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1   -e KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1   -v "$(pwd)/scripts":/scripts:ro   confluentinc/cp-kafka:7.3.0
```

> For host applications use `localhost:9092`, for containerized apps use `kafka:9092`.

### 4. Start Redis
```
docker run -d --name redis --network xness-net   -p 6380:6379   redis:7
```

### 5. Start TimescaleDB
```
sudo docker run -d --name timescaledb --network xness-net   -p 5432:5432   -e POSTGRES_USER=sparsh -e POSTGRES_PASSWORD=sparsh -e POSTGRES_DB=timescale   -v "$(pwd)/ts-data":/var/lib/postgresql/data   -v "$(pwd)/scripts":/scripts:ro   timescale/timescaledb:latest-pg14
```

### 6. Initialize TimescaleDB Schema
```
sudo apt update
sudo apt install -y postgresql-client
export PGPASSWORD='sparsh'
psql -h localhost -p 5432 -U sparsh -d timescale -f /home/sparsh/Desktop/xness/server/db/init_timescale.sql
```

### 7. Start the Application
```
cd /home/sparsh/Desktop/xness/server
npm ci
nohup node binance-publisher/index.js > pub.log 2>&1 &
nohup node binance-consumer/index.js > cons.log 2>&1 &
```

---

## 🗄️ Database Schema

The TimescaleDB schema includes a `trades` table with hypertable partitioning and multiple continuous aggregates for OHLCV calculations.

### Example Schema (`init_timescale.sql`)
```
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE IF NOT EXISTS trades (
  id BIGSERIAL,
  asset TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  trade_time TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id, trade_time)
);

CREATE INDEX IF NOT EXISTS trades_asset_idx ON trades (asset);
CREATE INDEX IF NOT EXISTS trades_trade_time_idx ON trades (trade_time DESC);

SELECT create_hypertable('trades', 'trade_time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '1 day');
SELECT add_retention_policy('trades', INTERVAL '180 days');

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_1min WITH (timescaledb.continuous) AS
SELECT time_bucket('1 minute', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;
```

---

## ⚙️ Configuration

### Kafka Listeners
| Environment | Listener |
|--------------|-----------|
| Host | `localhost:9092` |
| Container | `kafka:9092` |

### Redis
| Host Port | Container Port |
|------------|----------------|
| 6380 | 6379 |

### Database
| Key | Value |
|------|--------|
| Username | `sparsh` |
| Password | `sparsh` |
| Database | `timescale` |
| Host (from host) | `localhost:5432` |
| Host (from container) | `timescaledb:5432` |

---

## 📊 Monitoring & Logs
```
tail -f pub.log
tail -f cons.log
docker ps
docker logs kafka
docker logs zookeeper
docker logs redis
docker logs timescaledb
psql -h localhost -p 5432 -U sparsh -d timescale
```

---

## 🧩 Database Initialization Script Summary

- Enables TimescaleDB extension  
- Creates and indexes `trades` table  
- Defines hypertables for time-based partitioning  
- Generates continuous aggregates for OHLCV  
- Sets automatic refresh and retention policies  

---

## 🕒 Supported Time Intervals
```
Intraday: 1min, 3min, 5min, 10min, 15min, 30min
Hourly:   1h, 2h, 4h
Long-term: 1d, 1w, 1mo
```

---

## 🧰 Useful Commands
```
docker ps
docker stop kafka zookeeper timescaledb redis
docker rm kafka zookeeper timescaledb redis
```


---

## 🏗️ Project Structure
```
server/
├── binance-publisher/
│   └── index.js
├── binance-consumer/
│   └── index.js
├── db/
│   └── init_timescale.sql
├── scripts/
│   └── *.sql
├── ts-data/
└── package.json
```

