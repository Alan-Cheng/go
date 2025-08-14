# The Blockchain Bar - 實作

## 📝 筆記

---

## Chapter 8: [Transparent Database]

### 🎯 學習目標

#### 1. 建立 DB config
   - 指定路徑初始化 DB & 取得 DB 資料
   ```
   tbb balances list --datadir=.tbb
   ```

#### 2. 建立 HTTP Endpoint 來操作 Tx
   - 啟動HTTP Endpoint
   ```
   tbb run --datadir=.tbb
   ```

#### 3. 上到雲端
   - {Pending}

---

## Chapter 9: [It Takes Two Nodes ToTango]

### 🎯 學習目標

#### 1. Why is the Bootstrap Node necessary?

---

## Chapter 10: [Programming a Peer-to-Peer DB Sync Algorithm]

### 🎯 學習目標

#### 1. State 加入 lastBlock，用於取得上一個區塊的高度(number)
   - 指定路徑初始化 DB
   ```
   cat /dev/null > .tbb/database/block.db
   ```

   - 用 migrate 初始化 Hardcode 的資料
   ```
   tbb migrate --datadir=.tbb
   ```

#### 2. 加入回傳 Status 的 Endpoint（用於下一步同步 Node 資訊）
   - 修改 Node 結構，啟動時直接建立已知的啟動節點（bootstrap node）

#### 3. 同步演算法初步實作，先以簡單的定期更新方法實現
   - sync() 使用 time.NewTicker 建立計時器
   - 透過 ticker 定時發出訊號(Channel)，當接收到 ctx.done() 時中止 ticker
   - 使用 go sync() 執行 goroutine ，當 HTTP Endpoint 啟動時在背景執行同步任務
   - 使用CH9. 建立 /node/status Endpoint，透過 fetchNewBlocksAndPeers() 取得各節點的資訊以更新 n.knownPeers
   - Node.knownPeers 使用 Map 替代　Array

#### 4. 建立 /node/sync Endpoint 接收其他節點的區塊高度查詢請求
   - 建立 /node/sync?fromBlock={Hash} Endpoint，透過 GetBlockAfter(Hahs, string)([]Block, error) 取得最新的 Block

---