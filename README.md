# Golang 區塊鏈實作

| 功能 | 說明 |
|---------|------|
| **節點** | 實現P2P網路節點，包含同步用的端點與儲存其他有效節點 |
| **交易** | 處理加密貨幣交易，包含數位簽章驗證和餘額管理 |
| **P2P網路** | 建立去中心化網路，節點間自動同步區塊鏈狀態 |
| **工作量證明** | 挖礦演算法，計算SHA256符合驗證條件之Hash  |


## ✨ 簡介

- **🔗 P2P網路**: 自動與Bootstrap節點同步並取得其他有效節點
- **⛏️ 工作量證明**: SHA256挖礦演算法，可設定計算難度
- **💰 錢包系統**: 使用[go-ethereum](https://github.com/ethereum/go-ethereum)以太坊的Library實作驗證與錢包地址生成
- **📊 即時同步(待完善)**: 節點間可自動同步區塊，但尚未完善
  - **TODO**：分叉處理

- **🐳 容器部屬**: 可快速啟動DEMO；nginx用於proy UI介面的request避免CORS


## 🏗️ DEMO架構


```
┌─────────┐    ┌─────────┐    ┌─────────┐
│ node 0  │◄──►│ node 1  │◄──►│ node 2  │
│port 8080│    │port 8081│    │port 8082│
└─────────┘    └─────────┘    └─────────┘
     ▲              ▲              ▲
     └──────────────┼──────────────┘
                    │
              ┌─────────┐
              │ Nginx   │
              │ port 80 │
              └─────────┘
                    │
              ┌─────────┐
              │ Web介面 │
              └─────────┘
```

## 🚀 DEMO啟動步驟

### 環境需求
- Go 1.24+
- Docker & Docker Compose

### 啟動步驟
```bash
#啟動
docker-compose up -d --build

# Web UI
open http://localhost
```


## 🎯 實際展示

### 1. Web UI介面
- 確認節點正常啟動顯示 Online

![介面](https://github.com/Alan-Cheng/go-blockchain/blob/demo/img/init_state.png?raw=true)

### 2. 發起交易與節點同步
   - 由node0轉帳77元給node1
   - 交易傳播至node1，同步開始挖礦
   - node1率先產出區塊，node0同步該區塊
   - 交易完成，餘額變更

![交易](https://github.com/Alan-Cheng/go-blockchain/blob/demo/img/UI.png?raw=true)

### 3. 容器內Log
   - node1紀錄成功透過PoW(Proof-of-Work)工作量證明成功取得符合要求之Hash
   - 將區塊儲存至本地，內容包含交易內容與 Block Header 等
   
![容器](https://github.com/Alan-Cheng/go-blockchain/blob/demo/img/container_log.png?raw=true)


## 🛠️ 開發

### 專案結構
```
├── cmd/          # CLI Tools
├── node/         # P2P網路和共識機制
├── wallet/       # 加密金鑰管理
├── database/     # 持久化儲存
├── ui/           # Web UI相關
├── scripts/      # 自動化腳本
├── nginx/        # Web UI相關
├── data*/        # Demo用資料
└── docker/       # 容器化
```

## 🙏 參考來源

- "Build a Blockchain from Scratch in Go" eBook, Repo：[The Blockchain Bar](https://github.com/web3coach/the-blockchain-bar)
