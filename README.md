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

#### 5. 同步業務邏輯下一步：將其他節點取得的最新 Block 持久化到本地資料庫中
   - 將原本的 AddTx(新增交易到State), Persist(儲存Stat到本地block.db)封裝到具有驗證流程的AddBlock()
   - sync() 呼叫 doSync()，doSync() -> AddBlocks() -> AddBlock() 。 一開始只會跟Bootstrap Peer同步，sync()不斷觸發doSync()擴散至找到所有節點。
   - ##### 建立三個節點的同步實驗：
      1. 資料夾.tbb1, .tbb2, .tbb3 代表三個節點的本地持久化資料

      2. 安裝 tbb CLI Tools
         ```bash
         go install ./cmd/...
         ```
      
      3. 分別以下列指令，在不同的三個 Port 啟動三個節點
         ```bash
         tbb run --datadir=.tbb0 --port=8080
         tbb run --datadir=.tbb1 --port=8081
         tbb run --datadir=.tbb2 --port=8082
         ```

      4. 2號節點終端機輸出如下，代表有找到其他節點
         ```text
         Launching TBB node and its HTTP API...
         Listening on: 127.0.0.1:8080
         Peer '127.0.0.1:8081' was added into KnownPeers
         Peer '127.0.0.1:8082' was added into KnownPeers
         ```

      5. 觀察各.tbb資料夾內的block.db檔案，應同步為相同內容

      6. 透過新增交易的 Endpoint 在0號節點新增一比交易紀錄，45秒後觀察是否自動同步到其餘節點
         ```bash
         curl --request GET "http://localhost:8080/tx/add" --header "Content-Type: application/json" --data-raw "{\"from\":\"andrej\",\"to\":\"babayaga\",\"value\":100}"
         ```

      7. 終端機輸出
         ```text
         Found 1 new blocks from Peer 127.0.0.1:8080
         Importing blocks from Peer 127.0.0.1:8080...
         Persisting new Block to disk:
        {"hash":"dfad99f639a95d1a741c2bcba909c68476e2544f40a4d521e97d2ec9c7f0b9e7","block":{"header":{"parent":"7b86318b11f6120c7e359147b9b3c4825059e1ebebc4b983a146ff704b41c463","number":5,"time":1755223632},"payload":[{"from":"andrej","to":"babayaga","value":100,"data":""}]}}
         ```
         
---