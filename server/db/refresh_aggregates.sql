-- 1 min MV: refresh every 10 seconds
SELECT add_continuous_aggregate_policy('trades_1min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '10 seconds',
    schedule_interval => INTERVAL '10 seconds');

-- 3 min MV: refresh every 2 minutes
SELECT add_continuous_aggregate_policy('trades_3min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '2 minutes',
    schedule_interval => INTERVAL '1 minutes');

-- 5 min MV: refresh every 3 minutes
SELECT add_continuous_aggregate_policy('trades_5min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '3 minutes',
    schedule_interval => INTERVAL '3 minutes');

-- 10 min MV: refresh every 5 minutes
SELECT add_continuous_aggregate_policy('trades_10min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '5 minutes',
    schedule_interval => INTERVAL '5 minutes');

-- 15 min MV: refresh every 5 minutes
SELECT add_continuous_aggregate_policy('trades_15min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '5 minutes',
    schedule_interval => INTERVAL '5 minutes');

-- 30 min MV: refresh every 5 minutes
SELECT add_continuous_aggregate_policy('trades_30min',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '5 minutes',
    schedule_interval => INTERVAL '5 minutes');

-- 1 hr MV: refresh every 30 minutes
SELECT add_continuous_aggregate_policy('trades_1hr',
    start_offset => INTERVAL '7 days',
    end_offset   => INTERVAL '30 minutes',
    schedule_interval => INTERVAL '10 minutes');

-- 2 hr MV: refresh every 30 minutes
SELECT add_continuous_aggregate_policy('trades_2hr',
    start_offset => INTERVAL '14 days',
    end_offset   => INTERVAL '30 minutes',
    schedule_interval => INTERVAL '10 minutes');

-- 4 hr MV: refresh every 30 minutes
SELECT add_continuous_aggregate_policy('trades_4hr',
    start_offset => INTERVAL '30 days',
    end_offset   => INTERVAL '30 minutes',
    schedule_interval => INTERVAL '30 minutes');

-- 1 day MV: refresh every 1 hour
SELECT add_continuous_aggregate_policy('trades_1d',
    start_offset => INTERVAL '60 days',
    end_offset   => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');

-- 1 week MV: refresh every 1 day
SELECT add_continuous_aggregate_policy('trades_1w',
    start_offset => INTERVAL '180 days',
    end_offset   => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day');

-- 1 month MV: refresh every 1 day
SELECT add_continuous_aggregate_policy('trades_1mo',
    start_offset => INTERVAL '365 days',
    end_offset   => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day');
