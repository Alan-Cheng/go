Write-Host "=== TBB Network Wallet Addresses ===" -ForegroundColor Green
Write-Host ""

for ($i = 0; $i -le 2; $i++) {
    $walletFile = "./data$i/wallet_address.txt"
    if (Test-Path $walletFile) {
        $address = Get-Content $walletFile
        Write-Host "Node $i`: $address" -ForegroundColor Yellow
    } else {
        Write-Host "Node $i`: Wallet not created yet" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Node Status ===" -ForegroundColor Green
Write-Host ""

for ($i = 0; $i -le 2; $i++) {
    $port = 8080 + $i
    Write-Host "Checking node $i on port $port..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/node/status" -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host " Running" -ForegroundColor Green
        } else {
            Write-Host " Not responding" -ForegroundColor Red
        }
    } catch {
        Write-Host " Not running" -ForegroundColor Red
    }
} 