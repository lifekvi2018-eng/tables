const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  const fileUrl = 'file:///' + path.resolve(__dirname, '..', 'google_auth_mockup.html').replace(/\\/g, '/');
  const scratchDir = path.resolve(__dirname, '..', '.scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1100',
    fileUrl
  ]);

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9223/json/list');
      const list = await res.json();
      const page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    chrome.kill();
    console.error('Failed to connect to Chrome on port 9223');
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let idCounter = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = idCounter++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Page.navigate', { url: fileUrl });
  await new Promise(r => setTimeout(r, 1000));

  // Full page screenshot
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  if (ss && ss.data) {
    const outPath = path.join(scratchDir, 'google_auth_mockup_overview.png');
    fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
    console.log('Saved overview screenshot to:', outPath);
  }

  ws.close();
  chrome.kill();
}

captureScreenshots().catch(e => {
  console.error('Error capturing screenshot:', e);
  process.exit(1);
});
