#!/bin/bash

# Create Kafka topics
kafka-topics --create --topic binance-trades --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic binance-orders --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic binance-liquidations --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

echo "Kafka topics created successfully."