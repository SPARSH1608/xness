CREATE TABLE trades (
    id SERIAL,
    asset VARCHAR(50) NOT NULL,
    price NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    trade_time TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id, trade_time)
);

SELECT create_hypertable('trades', 'trade_time');

CREATE INDEX ON trades (trade_time DESC);