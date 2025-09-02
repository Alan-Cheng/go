const nodes = [
    { id: 'node0', base: '/api/node0' },
    { id: 'node1', base: '/api/node1' },
    { id: 'node2', base: '/api/node2' }
  ]
  
  const state = {
    lastStatus: {
      node0: null,
      node1: null,
      node2: null
    },
    intervalMs: 1000,
    timer: null,
    lastMiningHintAt: {
      node0: 0,
      node1: 0,
      node2: 0
    }
  }
  
  function setOnline(id, online) {
    const el = document.getElementById(`status-${id}`)
    el.textContent = online ? 'online' : 'offline'
    el.classList.toggle('online', online)
    el.classList.toggle('offline', !online)
  }
  
  function appendLog(id, msg) {
    const logs = document.getElementById(`logs-${id}`)
    const p = document.createElement('div')
    p.className = 'log-line'
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`
    logs.appendChild(p)
    logs.scrollTop = logs.scrollHeight
  }
  
  async function fetchStatus(node) {
    const url = `${node.base}/node/status`
    const id = node.id
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json()
  
      setOnline(id, true)
      document.getElementById(`account-${id}`).textContent = data.account
      document.getElementById(`block-${id}`).textContent = `${data.block_number} (${data.block_hash})`
      document.getElementById(`mining-${id}`).textContent = data.is_mining ? 'yes' : 'no'
      
      // Fetch balances
      fetch(`${node.base}/balances/list`)
        .then(res => res.json())
        .then(balanceData => {
          const account = data.account
          // Debug: log both values to see the format
          console.log('Account from status:', account)
          console.log('Balance keys:', Object.keys(balanceData.balances))
          // Convert account to lowercase to match balance keys format
          const accountLower = account.toLowerCase()
          const balance = balanceData.balances[accountLower] || 0
          document.getElementById(`balance-${id}`).textContent = `${balance} Tokens`
        })
        .catch(err => {
          console.error('Balance fetch error:', err)
          document.getElementById(`balance-${id}`).textContent = 'error'
        })
  
      // Derive log-ish events
      const prev = state.lastStatus[id]
      if (!prev) {
        appendLog(id, `🔌 connected. block=${data.block_number}, mining=${data.is_mining ? 'yes' : 'no'}`)
      } else {
        if (data.block_number > prev.block_number) {
          const origin = data.last_block_origin || 'unknown'
          if (origin === 'mined') {
            appendLog(id, `⛏️ mined new block #${data.block_number} (${data.block_hash}) 🎉`)
          } else if (origin === 'synced') {
            appendLog(id, `📥 imported block #${data.block_number} (${data.block_hash})`)
          } else {
            appendLog(id, `🧱 new block #${data.block_number} (${data.block_hash})`)
          }
        }
        if (!!data.is_mining !== !!prev.is_mining) {
          appendLog(id, data.is_mining ? '⛏️ mining started' : '✅ mining finished')
        }
        if (data.is_mining) {
          const now = Date.now()
          if (now - (state.lastMiningHintAt[id] || 0) > 8000) {
            appendLog(id, '⛏️ mining in progress…')
            state.lastMiningHintAt[id] = now
          }
        }
        // peer count change
        const peersNow = Object.keys(data.peers_known || {}).length
        const peersPrev = Object.keys(prev.peers_known || {}).length
        if (peersNow !== peersPrev) {
          appendLog(id, `🌐 peers ${peersPrev} -> ${peersNow}`)
        }
      }
      state.lastStatus[id] = data
    } catch (e) {
      if (state.lastStatus[id] !== null) {
        appendLog(id, `⚠️ connection lost: ${e.message}`)
      }
      state.lastStatus[id] = null
      setOnline(id, false)
    }
  }
  
  function startPolling() {
    if (state.timer) clearInterval(state.timer)
    state.timer = setInterval(() => {
      nodes.forEach(fetchStatus)
    }, state.intervalMs)
  }
  
  document.getElementById('refresh').addEventListener('click', () => {
    nodes.forEach(fetchStatus)
  })
  

  
  // initial
  nodes.forEach(fetchStatus)
  startPolling()  