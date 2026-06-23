const { app, BrowserWindow } = require('electron');
const { autoUpdater }        = require('electron-updater');
const { spawn }              = require('child_process');
const path                   = require('path');
const http                   = require('http');
const fs                     = require('fs');

const BACKEND_PORT = 8765;
let pythonProcess  = null;
let mainWindow     = null;

// ── Backend binary path ──────────────────────────
function getBackendCmd() {
  if (app.isPackaged) {
    // onedir bundle: Resources/backend/founder-os-backend (dir) / founder-os-backend (exe inside)
    const exe = process.platform === 'win32' ? 'founder-os-backend.exe' : 'founder-os-backend';
    const bin = path.join(process.resourcesPath, 'backend', exe);
    if (fs.existsSync(bin)) {
      return { cmd: bin, args: ['--port', String(BACKEND_PORT)], cwd: app.getPath('userData') };
    }
  }
  // Dev mode: use system python3
  return {
    cmd: process.platform === 'win32' ? 'python' : 'python3',
    args: ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', String(BACKEND_PORT), '--log-level', 'warning'],
    cwd: __dirname,
  };
}

// ── Health check ─────────────────────────────────
function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${BACKEND_PORT}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function waitForBackend(maxMs = 15000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (await checkHealth()) return true;
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

// ── Start backend ────────────────────────────────
function startBackend() {
  const { cmd, args, cwd } = getBackendCmd();
  pythonProcess = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  pythonProcess.stdout.on('data', d => process.stdout.write(d));
  pythonProcess.stderr.on('data', d => process.stderr.write(d));
  pythonProcess.on('error', err => console.error('[backend] error:', err.message));
  pythonProcess.on('exit', code => { if (code && code !== 0) console.error('[backend] exit code:', code); });
}

// ── Window ───────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 600,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'focus-timer', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── Auto-updater ─────────────────────────────────
function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });
}

// ── App lifecycle ─────────────────────────────────
app.whenReady().then(async () => {
  startBackend();
  const ready = await waitForBackend();
  if (!ready) console.warn('[backend] not ready in time');

  createWindow();

  if (app.isPackaged) setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function stopBackend() {
  if (pythonProcess) { pythonProcess.kill(); pythonProcess = null; }
}

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', stopBackend);
