6import express, { Request, Response } from 'express';
import { startAutomationLoop, stopAutomationLoop, getEngineStatus } from './botEngine';

process.on('uncaughtException', (err) => {
    console.error('[-] Caught uncaughtException (kept alive):', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
    console.error('[-] Caught unhandledRejection (kept alive):', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdSelect Runner</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0b; color: #e4e4e7; }
  .card { background: #121214; border: 1px solid #27272a; border-radius: 16px; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pulse-dot { animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .fade-in { animation: fadeIn 0.35s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
</style>
</head>
<body class="min-h-screen p-4 md:p-8">
  <div class="max-w-5xl mx-auto space-y-6">

    <div class="card p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl md:text-2xl font-semibold tracking-tight text-white">AdSelect Runner</h1>
        <p class="text-sm text-zinc-500 mt-1">Simple account creator with proxy rotation</p>
      </div>
      <div class="flex items-center gap-3">
        <div id="status-badge" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 text-sm font-medium">
          <span class="w-2 h-2 rounded-full bg-zinc-500"></span>
          <span id="status-text">Idle</span>
        </div>
        <button id="toggle-btn" onclick="toggleEngine()" class="px-5 py-2.5 rounded-xl font-medium text-sm transition active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30">
          Start Engine
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card p-5">
        <p class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Accounts created</p>
        <p id="stat-total" class="text-3xl font-bold text-white mt-2">0</p>
      </div>
      <div class="card p-5">
        <p class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Bonus estimate</p>
        <p id="stat-balance" class="text-3xl font-bold text-cyan-400 mt-2">$0</p>
      </div>
      <div class="card p-5">
        <p class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Failed attempts</p>
        <p id="stat-fails" class="text-3xl font-bold text-rose-400 mt-2">0</p>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-zinc-200">Created accounts</h2>
        <span id="live-dot" class="hidden text-xs text-emerald-400 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"></span> Live</span>
      </div>
      <div class="overflow-x-auto max-h-80 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-[#121214]">
            <tr class="text-left text-zinc-500 text-xs uppercase tracking-wider">
              <th class="px-5 py-3 font-medium">Username</th>
              <th class="px-5 py-3 font-medium">Email</th>
              <th class="px-5 py-3 font-medium">Balance</th>
              <th class="px-5 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody id="log-table" class="divide-y divide-zinc-800/80">
            <tr><td colspan="4" class="px-5 py-8 text-center text-zinc-600">Nothing here yet. Hit Start Engine.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="px-5 py-4 border-b border-zinc-800">
        <h2 class="text-sm font-semibold text-zinc-200">Failed attempts</h2>
      </div>
      <div class="overflow-x-auto max-h-56 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-[#121214]">
            <tr class="text-left text-zinc-500 text-xs uppercase tracking-wider">
              <th class="px-5 py-3 font-medium">Username</th>
              <th class="px-5 py-3 font-medium">Reason</th>
              <th class="px-5 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody id="fail-table" class="divide-y divide-zinc-800/80">
            <tr><td colspan="3" class="px-5 py-6 text-center text-zinc-600">No fails so far.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

<script>
let engineRunning = false;
let lastTotal = -1;

function setRunningUI(running) {
  engineRunning = running;
  const btn = document.getElementById('toggle-btn');
  const badge = document.getElementById('status-badge');
  const liveDot = document.getElementById('live-dot');

  if (running) {
    btn.textContent = 'Stop Engine';
    btn.className = 'px-5 py-2.5 rounded-xl font-medium text-sm transition active:scale-95 bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30';
    badge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-400 text-sm font-medium';
    badge.innerHTML = '<svg class="w-3.5 h-3.5 spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-linecap="round" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span id="status-text">Running</span>';
    liveDot.classList.remove('hidden');
    liveDot.classList.add('flex');
  } else {
    btn.textContent = 'Start Engine';
    btn.className = 'px-5 py-2.5 rounded-xl font-medium text-sm transition active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30';
    badge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 text-sm font-medium';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-zinc-500"></span><span id="status-text">Idle</span>';
    liveDot.classList.add('hidden');
    liveDot.classList.remove('flex');
  }
}

async function toggleEngine() {
  const btn = document.getElementById('toggle-btn');
  btn.disabled = true;
  try {
    if (engineRunning) {
      await fetch('/api/stop', { method: 'POST' });
      setRunningUI(false);
    } else {
      await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsor: 'xhclinton', count: 0 })
      });
      setRunningUI(true);
    }
  } catch (e) {}
  btn.disabled = false;
  fetchStats();
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return Math.floor(diff) + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return new Date(iso).toLocaleDateString();
}

async function fetchStats() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    document.getElementById('stat-total').textContent = data.totalCreated;
    document.getElementById('stat-balance').textContent = '$' + (data.totalCreated * 10);
    document.getElementById('stat-fails').textContent = data.failedList.length;

    if (data.isRunning !== engineRunning) {
      setRunningUI(!!data.isRunning);
    }

    const tbody = document.getElementById('log-table');
    if (!data.successList || data.successList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="px-5 py-8 text-center text-zinc-600">Nothing here yet. Hit Start Engine.</td></tr>';
    } else {
      const isNew = data.totalCreated !== lastTotal && lastTotal !== -1;
      tbody.innerHTML = data.successList.map((item, i) =>
        '<tr class="hover:bg-zinc-800/40 transition' + (isNew && i === 0 ? ' fade-in' : '') + '">' +
        '<td class="px-5 py-3 font-mono text-emerald-400">' + item.username + '</td>' +
        '<td class="px-5 py-3 text-zinc-400">' + item.email + '</td>' +
        '<td class="px-5 py-3 text-cyan-400 font-medium">$' + item.balance + '</td>' +
        '<td class="px-5 py-3 text-zinc-500">' + timeAgo(item.createdAt) + '</td></tr>'
      ).join('');
    }

    const ftable = document.getElementById('fail-table');
    if (!data.failedList || data.failedList.length === 0) {
      ftable.innerHTML = '<tr><td colspan="3" class="px-5 py-6 text-center text-zinc-600">No fails so far.</td></tr>';
    } else {
      ftable.innerHTML = data.failedList.map(item =>
        '<tr class="hover:bg-zinc-800/40 transition">' +
        '<td class="px-5 py-3 font-mono text-zinc-400">' + item.username + '</td>' +
        '<td class="px-5 py-3 text-rose-400/90 max-w-xs truncate">' + item.error + '</td>' +
        '<td class="px-5 py-3 text-zinc-500">' + timeAgo(item.time) + '</td></tr>'
      ).join('');
    }

    lastTotal = data.totalCreated;
  } catch (e) {}
}

setInterval(fetchStats, 2000);
fetchStats();
</script>
</body>
</html>`);
});

app.get('/api/status', (req: Request, res: Response) => {
    res.json(getEngineStatus());
});

app.post('/api/start', (req: Request, res: Response) => {
    const { sponsor = 'rhodvick', count = 0 } = req.body;
    startAutomationLoop(sponsor, Number(count)).catch(() => {});
    res.json({ success: true });
});

app.post('/api/stop', (req: Request, res: Response) => {
    stopAutomationLoop();
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`[+] Dashboard live on port ${PORT}`);
});
