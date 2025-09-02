# 第一階段：編譯階段
FROM golang:1.24-alpine AS builder

WORKDIR /app

# 安裝必要的工具
RUN apk add --no-cache git

# 複製 go.mod 和 go.sum
COPY go.mod go.sum ./

# 下載依賴
RUN go mod download

# 複製源碼
COPY . .

# 安裝 tbb 命令
RUN go install ./cmd/...

# 構建 tbb 二進制檔案
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o tbb ./cmd/tbb

# 第二階段：運行階段
FROM alpine:latest

# 安裝 ca-certificates 和 bash
RUN apk --no-cache add ca-certificates bash

WORKDIR /root/

# 從編譯階段複製二進制檔案和 Go bin
COPY --from=builder /app/tbb .
COPY --from=builder /go/bin/tbb /usr/local/bin/tbb

# 建立資料目錄
RUN mkdir -p /root/data

# 複製啟動腳本
COPY scripts/start-node.sh /root/start-node.sh
RUN chmod +x /root/start-node.sh

# 暴露端口
EXPOSE 8080 8081 8082

# 預設命令
CMD ["/root/start-node.sh"] 