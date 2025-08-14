# The Blockchain Bar - 實作

## 📝 筆記

---

## Chapter 8: [Transparent Database]

### 🎯 學習目標

#### 1. 建立 DB config
   - 指定路徑初始化 DB & 取得 DB 資料
   ```
   tbb balances list --datadir=C:\home\web3coach\.tbb
   ```

#### 2. 建立 HTTP Endpoint 來操作 Tx
   - 啟動HTTP Endpoint
   ```
   tbb run --datadir=C:\home\web3coach\.tbb
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

---