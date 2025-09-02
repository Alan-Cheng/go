#!/bin/bash

set -e

echo "Starting TBB node setup..."

# 檢查是否已有 keystore
if [ ! -d "/root/data/keystore" ] || [ -z "$(ls -A /root/data/keystore 2>/dev/null)" ]; then
    echo "ERROR: No keystore found! Please ensure keystore files are present in data directory."
    exit 1
fi

echo "Using existing keystore..."
WALLET_ADDRESS=$(ls /root/data/keystore/ | head -1 | sed 's/.*--//')
echo "Using wallet address: 0x$WALLET_ADDRESS"
echo "0x$WALLET_ADDRESS" > /root/data/wallet_address.txt

# 讀取錢包地址
MINER_ADDRESS=$(cat /root/data/wallet_address.txt)

echo "Starting node with miner address: $MINER_ADDRESS"

# 啟動節點
exec tbb run \
    --datadir=/root/data \
    --ip=${NODE_HOST:-0.0.0.0} \
    --port=${NODE_PORT:-8080} \
    --miner=$MINER_ADDRESS \
    --bootstrap-ip=${BOOTSTRAP_IP:-node0} \
    --bootstrap-port=${BOOTSTRAP_PORT:-8080}