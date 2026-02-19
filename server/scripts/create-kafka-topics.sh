#!/bin/bash

# Create Kafka topics
kafka-topics --create --topic binance-trades --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1
kafka-topics --create --topic binance-orders --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1
kafka-topics --create --topic binance-liquidations --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1

echo "Kafka topics created successfully."