const { spawn } = require('child_process');
const path = require('path');

async function testHeadlessGeometry() {
  const fileUrl = 'file:///' + path.resolve(__dirname, '..', 'google_auth_mockup.html').replace(/\\/g, '/');
  console.log('Testing file URL:', fileUrl);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1200,900',
    fileUrl
  ]);

  // Wait for Chrome to listen on 9222
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
      const list = await res.json();
      const pageTarget = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      // retry
    }
  }

  if (!wsUrl) {
    console.error('Failed to connect to Chrome debugging port.');
    chrome.kill();
    process.exit(1);
  }

  console.log('Connected to Chrome page:', wsUrl);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Wait for page to load
  await sendCommand('Page.enable');
  await sendCommand('Page.navigate', { url: fileUrl });
  await new Promise(r => setTimeout(r, 1000));

  const urlCheck = await sendCommand('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Current URL in page:', urlCheck);
  const evalResult = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const screen = document.getElementById('iphone-screen-viewport');
      const card = document.getElementById('mob-gate-card-box');
      const title = document.querySelector('.gate-title-text');
      const owner = document.querySelector('.owner-plaque');
      const btn = document.getElementById('mob-google-btn');
      const chk = document.getElementById('mob-checkbox-wrap');
      const tabbar = document.querySelector('.tabbar-box');

      return {
        screen: screen ? { clientWidth: screen.clientWidth, scrollWidth: screen.scrollWidth, clientHeight: screen.clientHeight } : null,
        card: card ? { clientWidth: card.clientWidth, scrollWidth: card.scrollWidth } : null,
        title: title ? { text: title.textContent, offsetWidth: title.offsetWidth } : null,
        owner: owner ? { clientWidth: owner.clientWidth, scrollWidth: owner.scrollWidth } : null,
        btn: btn ? { offsetHeight: btn.offsetHeight, offsetWidth: btn.offsetWidth } : null,
        chk: chk ? { offsetHeight: chk.offsetHeight, offsetWidth: chk.offsetWidth } : null,
        tabbar: tabbar ? { clientWidth: tabbar.clientWidth, scrollWidth: tabbar.scrollWidth } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Real Browser Geometry Raw:', evalResult);
  const data = evalResult && evalResult.result ? evalResult.result.value : (evalResult ? evalResult.value : null);
  console.log('Real Browser Geometry Data:', data);
  const errors = [];

  if (!data.screen) {
    errors.push('Phone screen #iphone-screen-viewport not found');
  } else {
    if (data.screen.clientWidth !== 390) {
      errors.push(`Screen clientWidth is ${data.screen.clientWidth}px, expected 390px`);
    }
    if (data.screen.scrollWidth > data.screen.clientWidth) {
      errors.push(`Phone screen overflow detected: scrollWidth (${data.screen.scrollWidth}) > clientWidth (${data.screen.clientWidth})`);
    }
  }

  if (data.card && data.card.scrollWidth > data.card.clientWidth) {
    errors.push(`Card overflow detected: scrollWidth (${data.card.scrollWidth}) > clientWidth (${data.card.clientWidth})`);
  }

  if (data.owner && data.owner.scrollWidth > data.owner.clientWidth) {
    errors.push(`Owner plaque overflow detected: scrollWidth (${data.owner.scrollWidth}) > clientWidth (${data.owner.clientWidth})`);
  }

  if (data.btn && data.btn.offsetHeight < 44) {
    errors.push(`Google button height is ${data.btn.offsetHeight}px, expected >= 44px`);
  }

  if (data.chk && data.chk.offsetHeight < 44) {
    errors.push(`Checkbox touch target height is ${data.chk.offsetHeight}px, expected >= 44px`);
  }

  if (data.tabbar && data.tabbar.scrollWidth > data.tabbar.clientWidth) {
    errors.push(`Tabbar overflow detected: scrollWidth (${data.tabbar.scrollWidth}) > clientWidth (${data.tabbar.clientWidth})`);
  }

  console.log('\n=== REAL BROWSER GEOMETRY SANITY CHECK ===');
  if (errors.length > 0) {
    console.error('FAILED with ' + errors.length + ' error(s):');
    errors.forEach(e => console.error('- ' + e));
    process.exit(1);
  } else {
    console.log('ALL REAL BROWSER CHECKS PASSED: 0 geometry defects!');
    console.log(`Phone screen clientWidth = ${data.screen.clientWidth}px, scrollWidth = ${data.screen.scrollWidth}px (EXACT 0 OVERFLOW)`);
    console.log(`Google button height = ${data.btn.offsetHeight}px (>= 44px)`);
    console.log(`Checkbox height = ${data.chk.offsetHeight}px (>= 44px)`);
    process.exit(0);
  }
}

testHeadlessGeometry().catch(err => {
  console.error('Error running headless geometry check:', err);
  process.exit(1);
});
