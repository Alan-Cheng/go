#!/bin/bash

set -e

echo "Starting TBB node setup..."

# 檢查是否已有 keystore
if [ ! -d "/root/data/keystore" ] || [ -z "$(ls -A /root/data/keystore 2>/dev/null)" ]; then
    echo "No keystore found, creating new wallet..."
    
    # 生成錢包（使用預設密碼 'password'）
    printf "password\npassword\n" | tbb wallet new-account --datadir=/root/data
    
    # 獲取生成的地址
    WALLET_ADDRESS=$(ls /root/data/keystore/ | head -1 | sed 's/.*--//')
    echo "Generated wallet address: 0x$WALLET_ADDRESS"
    
    # 將地址寫入檔案供後續使用
    echo "0x$WALLET_ADDRESS" > /root/data/wallet_address.txt
else
    echo "Keystore found, using existing wallet..."
    WALLET_ADDRESS=$(ls /root/data/keystore/ | head -1 | sed 's/.*--//')
    echo "Using wallet address: 0x$WALLET_ADDRESS"
    echo "0x$WALLET_ADDRESS" > /root/data/wallet_address.txt
fi

# 讀取錢包地址
MINER_ADDRESS=$(cat /root/data/wallet_address.txt)

echo "Starting node with miner address: $MINER_ADDRESS"

# 啟動節點
exec tbb run \
    --datadir=/root/data \
    --ip=0.0.0.0 \          # 監聽本地所有網卡
    --port=${NODE_PORT:-8080} \
    --miner=$MINER_ADDRESS \
    --advertise-ip=${NODE_HOST:-node0} \   # 對外廣播的 IP 或 service name
    --bootstrap-ip=${BOOTSTRAP_IP:-node0} \
    --bootstrap-port=${BOOTSTRAP_PORT:-8080}