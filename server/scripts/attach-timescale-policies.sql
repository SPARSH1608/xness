-- Attach policies to the hypertables in TimescaleDB

-- Example: Set a retention policy for the 'trades' hypertable
SELECT add_retention_policy('trades', INTERVAL '30 days');

-- Example: Create a continuous aggregate for the 'trades' hypertable
CREATE MATERIALIZED VIEW trades_aggregate WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', trade_time) AS bucket,
    asset,
    AVG(price) AS avg_price,
    SUM(quantity) AS total_quantity
FROM
    trades
GROUP BY
    bucket, asset;

-- Example: Set a policy for refreshing the continuous aggregate
SELECT add_continuous_aggregate_policy('trades_aggregate', 
    start_interval => now() - INTERVAL '1 day', 
    end_interval => now(), 
    refresh_lag => INTERVAL '1 hour');