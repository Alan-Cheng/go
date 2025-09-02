#!/bin/bash

echo "=== TBB Network Wallet Addresses ==="
echo ""

for i in {0..2}; do
    if [ -f "./data$i/wallet_address.txt" ]; then
        ADDRESS=$(cat "./data$i/wallet_address.txt")
        echo "Node $i: $ADDRESS"
    else
        echo "Node $i: Wallet not created yet"
    fi
done

echo ""
echo "=== Node Status ==="
echo ""

for i in {0..2}; do
    PORT=$((8080 + i))
    echo "Checking node $i on port $PORT..."
    if curl -s http://localhost:$PORT/node/status > /dev/null 2>&1; then
        echo "Node $i: Running"
    else
        echo "Node $i: Not running"
    fi
done 