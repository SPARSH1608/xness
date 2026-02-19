-- Helper macro or just repeated code for each view
-- We need: bucket, open, high, low, close, volume

-- 1 Minute
CREATE MATERIALIZED VIEW trades_1min WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('1 minute', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_1min',
    start_offset => INTERVAL '1 day',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute');

-- 3 Minutes
CREATE MATERIALIZED VIEW trades_3min WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('3 minutes', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_3min',
    start_offset => INTERVAL '1 day',
    end_offset => INTERVAL '3 minutes',
    schedule_interval => INTERVAL '3 minutes');

-- 5 Minutes
CREATE MATERIALIZED VIEW trades_5min WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('5 minutes', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_5min',
    start_offset => INTERVAL '1 day',
    end_offset => INTERVAL '5 minutes',
    schedule_interval => INTERVAL '5 minutes');

-- 10 Minutes
CREATE MATERIALIZED VIEW trades_10min WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('10 minutes', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_10min',
    start_offset => INTERVAL '1 day',
    end_offset => INTERVAL '10 minutes',
    schedule_interval => INTERVAL '10 minutes');

-- 15 Minutes
CREATE MATERIALIZED VIEW trades_15min WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('15 minutes', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_15min',
    start_offset => INTERVAL '1 day',
    end_offset => INTERVAL '15 minutes',
    schedule_interval => INTERVAL '15 minutes');

-- 30 Minutes
CREATE MATERIALIZED VIEW trades_30min WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('30 minutes', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_30min',
    start_offset => INTERVAL '1 day',
    end_offset => INTERVAL '30 minutes',
    schedule_interval => INTERVAL '30 minutes');

-- 1 Hour
CREATE MATERIALIZED VIEW trades_1h WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('1 hour', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_1h',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');

-- 2 Hours
CREATE MATERIALIZED VIEW trades_2h WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('2 hours', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_2h',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '2 hours',
    schedule_interval => INTERVAL '2 hours');

-- 4 Hours
CREATE MATERIALIZED VIEW trades_4h WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('4 hours', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_4h',
    start_offset => INTERVAL '7 days',
    end_offset => INTERVAL '4 hours',
    schedule_interval => INTERVAL '4 hours');

-- 1 Day
CREATE MATERIALIZED VIEW trades_1d WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('1 day', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_1d',
    start_offset => INTERVAL '30 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day');

-- 1 Week
CREATE MATERIALIZED VIEW trades_1w WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('1 week', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_1w',
    start_offset => INTERVAL '6 months',
    end_offset => INTERVAL '1 week',
    schedule_interval => INTERVAL '1 week');

-- 1 Month
CREATE MATERIALIZED VIEW trades_1mo WITH (timescaledb.continuous, timescaledb.materialized_only=false) AS
SELECT
    time_bucket('1 month', trade_time) AS bucket,
    asset,
    first(price, trade_time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, trade_time) AS close,
    sum(quantity) AS volume
FROM trades
GROUP BY bucket, asset;

SELECT add_continuous_aggregate_policy('trades_1mo',
    start_offset => INTERVAL '1 year',
    end_offset => INTERVAL '1 month',
    schedule_interval => INTERVAL '1 month');