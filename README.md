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

      5. 觀察各.tbb資料夾內的block.db檔案，應同步為相同內容(範例)
         ```json
         {"hash":"2705f942c57e9f54cd096162bee43d5e4bbd5555435bf081e5fff26ede9bbff1","block":{"header":{"parent":"46438b2675171b3e40b013218805de961e8d40af7af252fe166b5eb22089d027","number":1,"time":1755093150},"payload":[{"from":"andrej","to":"andrej","value":3,"data":""},{"from":"andrej","to":"andrej","value":700,"data":"reward"}]}}
         {"hash":"bdfef9839fbac54168fac5dedbf1397aead1c6c2be6be4b137a397f0c95eb4b1","block":{"header":{"parent":"2705f942c57e9f54cd096162bee43d5e4bbd5555435bf081e5fff26ede9bbff1","number":2,"time":1755093150},"payload":[{"from":"andrej","to":"babayaga","value":2000,"data":""},{"from":"andrej","to":"andrej","value":100,"data":"reward"},{"from":"babayaga","to":"andrej","value":1,"data":""},{"from":"babayaga","to":"caesar","value":1000,"data":""},{"from":"babayaga","to":"andrej","value":50,"data":""},{"from":"andrej","to":"andrej","value":600,"data":"reward"}]}}
         {"hash":"24fc3c6bd9243b6c50958d9b202985fc15a19e606084afc6afc56548d6a350f7","block":{"header":{"parent":"bdfef9839fbac54168fac5dedbf1397aead1c6c2be6be4b137a397f0c95eb4b1","number":3,"time":1755093150},"payload":[{"from":"andrej","to":"andrej","value":24700,"data":"reward"}]}}
         {"hash":"7b86318b11f6120c7e359147b9b3c4825059e1ebebc4b983a146ff704b41c463","block":{"header":{"parent":"24fc3c6bd9243b6c50958d9b202985fc15a19e606084afc6afc56548d6a350f7","number":4,"time":1755178610},"payload":[{"from":"andrej","to":"babayaga","value":100,"data":""}]}}
         {"hash":"dfad99f639a95d1a741c2bcba909c68476e2544f40a4d521e97d2ec9c7f0b9e7","block":{"header":{"parent":"7b86318b11f6120c7e359147b9b3c4825059e1ebebc4b983a146ff704b41c463","number":5,"time":1755223632},"payload":[{"from":"andrej","to":"babayaga","value":100,"data":""}]}}
         ```

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

## Chapter 11: [The Autonomous Database Brain]

### 🎯 學習目標

#### 1. 本機路徑中加入域名解析與分叉
   - 在 /etc/hosts 加入測試用的 Node Domain
   ```
   sudo sh -c 'echo "127.0.0.1 andrej.tbb" >> /etc/hosts && echo "127.0.0.1 babayaga.tbb" >> /etc/hosts && killall -HUP mDNSResponder'
   ```

   - 目前Sync週期為45秒一次，若在週期內不同Node產生Tx，會發生Fork(分岔的狀況)，block.db會記錄下不同的Blocks
   ```
   # 15:00:00
   curl -X POST http://andrej.tbb:8080/tx/add \
   -d '{
   "from": "andrej",
   "to": "andrej",
   "value": 7
   }'
   ```

   ```
   # 15:00:05
   curl -X POST http://babayaga.tbb:8081/tx/add \
   -d '{
   "from": "andrej",
   "to": "babayaga",
   "value": 2
   }'

   # 15:00:10
   curl -X POST http://babayaga.tbb:8081/tx/add \
   -d '{
   "from": "andrej",
   "to": "babayaga",
   "value": 3
   }'
   ```

#### 2. 待解決同步問題 - 設計共識演算法（如PoW）
   1. P2P同步規則
   2. Tx與Block的有效性驗證方法
   3. 有效節點驗證方法
   4. 哪個節點有權利生成下一個Block

#### 3. 比特幣的PoW
   - 引入Nonce，要求sha256（Block Header + Block Payload + Nonce）值符合要求
      - 要求為sha256開頭共有n個0，n越大計算難度越大

   - 設計上述演算法，設定n=6並實作測試檔案(./node/miner_test.go)
   
   - 啟動測試，實驗挖礦
      ```
      go test -timeout=0 ./node -test.v -test.run ^TestMine$
      ```

      ```
      ＃ 終端機下列輸出代表成功挖到
      Mined new Block '000000459aa35c64fce85ccd2f277bb35d673cf33699cb687b83580e4b6e18d7' using PoW🎉🎉🎉🎉:
         Height: '0'
         Nonce: '2744821435'
         Created: '1755359183'
         Miner: 'andrej'
         Parent: '0000000000000000000000000000000000000000000000000000000000000000'

         Attempt: '1432275'
         Time: 1.148893875s
      ```
   - 所有節點都可以驗證交易並挖掘下一個Block，且發現其他節點已挖出下個Block就要停止並開始新的工作
      1. StatusRes中加入PendingTXs用來記錄節點待處理的交易
      2. 修改mine()，n.newSyncBlocks channel中取出值，若有新的區塊產生就停止目前的挖礦工作
      3. 再試一次啟動多節點並發起多交易
      4. ##### 兩個節點測試可以同步，但同步頻率（秒數）仍然會造成分岔，因為其他節點還沒收到新區塊產出，他自己也產出了區塊

   - 

---