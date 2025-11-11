-- Create extension and base trades table, hypertable and continuous aggregates
-- This file is mounted into the TimescaleDB container and will run on first DB init.

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Base trades table used by the consumer/inserter
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

-- Create hypertable with 1 day chunks (adjust if you expect high write volume)
SELECT create_hypertable('trades', 'trade_time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '1 day');

-- Optional retention policy to drop old chunks (adjust interval as needed)
-- Keeps ~180 days of raw trade rows
SELECT add_retention_policy('trades', INTERVAL '180 days');

-- Continuous aggregates (OHLCV) for intervals used by the backend
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

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_3min WITH (timescaledb.continuous) AS
SELECT time_bucket('3 minutes', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_5min WITH (timescaledb.continuous) AS
SELECT time_bucket('5 minutes', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_10min WITH (timescaledb.continuous) AS
SELECT time_bucket('10 minutes', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_15min WITH (timescaledb.continuous) AS
SELECT time_bucket('15 minutes', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_30min WITH (timescaledb.continuous) AS
SELECT time_bucket('30 minutes', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_1h WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_2h WITH (timescaledb.continuous) AS
SELECT time_bucket('2 hours', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_4h WITH (timescaledb.continuous) AS
SELECT time_bucket('4 hours', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_1d WITH (timescaledb.continuous) AS
SELECT time_bucket('1 day', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_1w WITH (timescaledb.continuous) AS
SELECT time_bucket('1 week', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_1mo WITH (timescaledb.continuous) AS
SELECT time_bucket('30 days', trade_time) AS bucket,
       asset,
       first(price, trade_time) AS open,
       max(price) AS high,
       min(price) AS low,
       last(price, trade_time) AS close,
       sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

-- Continuous aggregate refresh policies (tune intervals to your needs)
SELECT add_continuous_aggregate_policy('trades_1min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '10 seconds',
    schedule_interval => INTERVAL '10 seconds');

SELECT add_continuous_aggregate_policy('trades_3min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '2 minutes',
    schedule_interval => INTERVAL '1 minutes');

SELECT add_continuous_aggregate_policy('trades_5min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '3 minutes',
    schedule_interval => INTERVAL '3 minutes');

SELECT add_continuous_aggregate_policy('trades_10min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '5 minutes',
    schedule_interval => INTERVAL '5 minutes');

SELECT add_continuous_aggregate_policy('trades_15min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '5 minutes',
    schedule_interval => INTERVAL '5 minutes');

SELECT add_continuous_aggregate_policy('trades_30min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '5 minutes',
    schedule_interval => INTERVAL '5 minutes');

SELECT add_continuous_aggregate_policy('trades_1h',
    start_offset => INTERVAL '7 days',
    end_offset   => INTERVAL '30 minutes',
    schedule_interval => INTERVAL '10 minutes');

SELECT add_continuous_aggregate_policy('trades_2h',
    start_offset => INTERVAL '14 days',
    end_offset   => INTERVAL '30 minutes',
    schedule_interval => INTERVAL '10 minutes');

SELECT add_continuous_aggregate_policy('trades_4h',
    start_offset => INTERVAL '30 days',
    end_offset   => INTERVAL '30 minutes',
    schedule_interval => INTERVAL '30 minutes');

SELECT add_continuous_aggregate_policy('trades_1d',
    start_offset => INTERVAL '60 days',
    end_offset   => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');

SELECT add_continuous_aggregate_policy('trades_1w',
    start_offset => INTERVAL '180 days',
    end_offset   => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day');

SELECT add_continuous_aggregate_policy('trades_1mo',
    start_offset => INTERVAL '365 days',
    end_offset   => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day');




    