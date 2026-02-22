-- Xness: Neon/Standard PostgreSQL Schema Setup
-- Run this in your Neon SQL Editor to create the missing views.

-- 1 Minute
CREATE OR REPLACE VIEW trades_1min AS
SELECT date_trunc('minute', trade_time) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 3 Minutes
CREATE OR REPLACE VIEW trades_3min AS
SELECT to_timestamp(floor(extract(epoch from trade_time) / 180) * 180) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 5 Minutes
CREATE OR REPLACE VIEW trades_5min AS
SELECT to_timestamp(floor(extract(epoch from trade_time) / 300) * 300) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 10 Minutes
CREATE OR REPLACE VIEW trades_10min AS
SELECT to_timestamp(floor(extract(epoch from trade_time) / 600) * 600) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 15 Minutes
CREATE OR REPLACE VIEW trades_15min AS
SELECT to_timestamp(floor(extract(epoch from trade_time) / 900) * 900) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 30 Minutes
CREATE OR REPLACE VIEW trades_30min AS
SELECT to_timestamp(floor(extract(epoch from trade_time) / 1800) * 1800) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 1 Hour
CREATE OR REPLACE VIEW trades_1h AS
SELECT date_trunc('hour', trade_time) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 2 Hours
CREATE OR REPLACE VIEW trades_2h AS
SELECT to_timestamp(floor(extract(epoch from trade_time) / 7200) * 7200) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 4 Hours
CREATE OR REPLACE VIEW trades_4h AS
SELECT to_timestamp(floor(extract(epoch from trade_time) / 14400) * 14400) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 1 Day
CREATE OR REPLACE VIEW trades_1d AS
SELECT date_trunc('day', trade_time) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 1 Week
CREATE OR REPLACE VIEW trades_1w AS
SELECT date_trunc('week', trade_time) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;

-- 1 Month
CREATE OR REPLACE VIEW trades_1mo AS
SELECT date_trunc('month', trade_time) AS bucket, asset,
(ARRAY_AGG(price ORDER BY trade_time ASC))[1] AS open, MAX(price) AS high, MIN(price) AS low, (ARRAY_AGG(price ORDER BY trade_time DESC))[1] AS close, SUM(quantity) AS volume
FROM trades GROUP BY 1, 2;
