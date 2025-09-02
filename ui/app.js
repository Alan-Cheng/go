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
  lastBalance: {
    node0: null,
    node1: null,
    node2: null
  },
  intervalMs: 2000,
  timer: null
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

    // Derive log-ish events
    const prev = state.lastStatus[id]
    if (!prev) {
      appendLog(id, `connected. block=${data.block_number}, mining=${data.is_mining}`)
    } else {
      if (data.block_number > prev.block_number) {
        appendLog(id, `new block ${data.block_number} (${data.block_hash})`)
      }
      if (!!data.is_mining !== !!prev.is_mining) {
        appendLog(id, data.is_mining ? 'mining started' : 'mining stopped')
      }
      // peer count change
      const peersNow = Object.keys(data.peers_known || {}).length
      const peersPrev = Object.keys(prev.peers_known || {}).length
      if (peersNow !== peersPrev) {
        appendLog(id, `peers ${peersPrev} -> ${peersNow}`)
      }
    }
    state.lastStatus[id] = data
  } catch (e) {
    if (state.lastStatus[id] !== null) {
      appendLog(id, `connection lost: ${e.message}`)
    }
    state.lastStatus[id] = null
    setOnline(id, false)
  }
}

async function fetchBalance(node) {
  const status = state.lastStatus[node.id]
  if (!status) return
  const id = node.id
  const url = `${node.base}/balances/list`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data = await res.json()
    const bal = data.balances?.[status.account?.toLowerCase()] ?? data.balances?.[status.account]
    if (bal !== undefined) {
      const prev = state.lastBalance[id]
      document.getElementById(`balance-${id}`).textContent = String(bal)
      if (prev !== null && prev !== bal) {
        appendLog(id, `balance ${prev} -> ${bal}`)
      }
      state.lastBalance[id] = bal
    }
  } catch (e) {
    // it's fine if balance fails; connection status managed by fetchStatus
  }
}

function startPolling() {
  if (state.timer) clearInterval(state.timer)
  state.timer = setInterval(() => {
    nodes.forEach(async (n) => { await fetchStatus(n); await fetchBalance(n) })
  }, state.intervalMs)
}

document.getElementById('refresh').addEventListener('click', async () => {
  for (const n of nodes) { await fetchStatus(n); await fetchBalance(n) }
})

document.getElementById('interval').addEventListener('change', (e) => {
  const v = Math.max(1, Number(e.target.value) || 2)
  state.intervalMs = v * 1000
  startPolling()
})

// initial
nodes.forEach(async (n) => { await fetchStatus(n); await fetchBalance(n) })
startPolling()


