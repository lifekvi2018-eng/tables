const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function main() {
  const fileUrl = 'file:///' + path.resolve(__dirname, '..', 'mockup_new_project_modal.html').replace(/\\/g, '/');
  console.log('Testing file URL:', fileUrl);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debugPort = 9228;
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1100',
    fileUrl
  ]);

  // Wait for Chrome to be ready
  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const list = await res.json();
      const pageTarget = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
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

  await sendCommand('Page.enable');
  await sendCommand('Page.navigate', { url: fileUrl });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Проверка геометрии
  const evalResult = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const screen = document.getElementById('iphone-screen-viewport');
      const mobModal = document.getElementById('mob-modal-card');
      const deskModal = document.getElementById('desk-modal-card');
      const mobTrigger = document.getElementById('mob-select-trigger');
      const deskTrigger = document.getElementById('desk-select-trigger');
      const mobButtons = Array.from(mobModal ? mobModal.querySelectorAll('.btn-action-modal') : []);
      const inputs = Array.from(document.querySelectorAll('.golden-field-input'));
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      const selectElements = Array.from(document.querySelectorAll('select'));
      const paletteCircles = Array.from(document.querySelectorAll('.palette-circle'));
      const paletteRows = Array.from(document.querySelectorAll('.golden-palette-row'));

      return {
        screen: screen ? {
          clientWidth: screen.clientWidth,
          scrollWidth: screen.scrollWidth,
          clientHeight: screen.clientHeight,
          scrollHeight: screen.scrollHeight
        } : null,
        mobModal: mobModal ? {
          clientWidth: mobModal.clientWidth,
          scrollWidth: mobModal.scrollWidth,
          offsetWidth: mobModal.offsetWidth
        } : null,
        deskModal: deskModal ? {
          clientWidth: deskModal.clientWidth,
          scrollWidth: deskModal.scrollWidth,
          offsetWidth: deskModal.offsetWidth
        } : null,
        mobTriggerHeight: mobTrigger ? mobTrigger.offsetHeight : 0,
        deskTriggerHeight: deskTrigger ? deskTrigger.offsetHeight : 0,
        buttonHeights: mobButtons.map(b => b.offsetHeight),
        inputHeights: inputs.map(i => i.offsetHeight),
        checkboxCount: checkboxes.length,
        nativeSelectCount: selectElements.length,
        paletteCircleCount: paletteCircles.length,
        paletteRowCount: paletteRows.length,
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
        htmlScrollWidth: document.documentElement.scrollWidth,
        htmlClientWidth: document.documentElement.clientWidth
      };
    })()`,
    returnByValue: true
  });

  const data = evalResult && evalResult.result ? evalResult.result.value : null;
  console.log('Browser Geometry Evaluation:', JSON.stringify(data, null, 2));

  const errors = [];

  // Проверка телефона (390×844)
  if (!data.screen) {
    errors.push('Phone viewport #iphone-screen-viewport not found');
  } else {
    if (data.screen.clientWidth !== 390) {
      errors.push(`Screen clientWidth is ${data.screen.clientWidth}px, expected 390px`);
    }
    if (data.screen.clientHeight !== 844) {
      errors.push(`Screen clientHeight is ${data.screen.clientHeight}px, expected 844px`);
    }
    if (data.screen.scrollWidth > data.screen.clientWidth) {
      errors.push(`Phone screen overflow detected: scrollWidth (${data.screen.scrollWidth}) > clientWidth (${data.screen.clientWidth})`);
    }
  }

  // Проверка модалок
  if (data.mobModal && data.mobModal.scrollWidth > data.mobModal.clientWidth) {
    errors.push(`Mobile modal overflow: scrollWidth (${data.mobModal.scrollWidth}) > clientWidth (${data.mobModal.clientWidth})`);
  }
  if (data.deskModal && data.deskModal.scrollWidth > data.deskModal.clientWidth) {
    errors.push(`Desktop modal overflow: scrollWidth (${data.deskModal.scrollWidth}) > clientWidth (${data.deskModal.clientWidth})`);
  }

  // Сенсорные зоны 44px
  if (data.mobTriggerHeight < 44) {
    errors.push(`Mobile select trigger height is ${data.mobTriggerHeight}px, expected >= 44px`);
  }
  data.buttonHeights.forEach((h, i) => {
    if (h < 44) errors.push(`Action button #${i + 1} height is ${h}px, expected >= 44px`);
  });
  data.inputHeights.forEach((h, i) => {
    if (h < 44) errors.push(`Input #${i + 1} height is ${h}px, expected >= 44px`);
  });

  // Отсутствие чекбокса, нативного селекта и палитры цветов
  if (data.checkboxCount !== 0) {
    errors.push(`Found ${data.checkboxCount} checkbox(es), but paid-now checkbox must be completely removed!`);
  }
  if (data.nativeSelectCount !== 0) {
    errors.push(`Found ${data.nativeSelectCount} native <select> elements, must use .custom-select!`);
  }
  if (data.paletteCircleCount !== 0 || data.paletteRowCount !== 0) {
    errors.push(`Found ${data.paletteCircleCount} palette circles and ${data.paletteRowCount} palette rows, but color picker must be completely removed!`);
  }

  // Отсутствие горизонтального скролла на странице
  if (data.htmlScrollWidth > data.htmlClientWidth) {
    errors.push(`Full page horizontal overflow detected: scrollWidth (${data.htmlScrollWidth}) > clientWidth (${data.htmlClientWidth})`);
  }

  console.log('\n======================================================');
  console.log('       LAYOUT SANITY CHECK (ПРОВЕРКА ГЕОМЕТРИИ)       ');
  console.log('======================================================');
  if (errors.length > 0) {
    console.error('ОШИБКИ ГЕОМЕТРИИ:');
    errors.forEach(e => console.error('  ✕ ' + e));
    ws.close();
    chrome.kill();
    process.exit(1);
  } else {
    console.log('  ✓ Телефон iPhone: ровно 390×844 px (clientWidth = 390, clientHeight = 844)');
    console.log('  ✓ Переполнение экрана телефона: 0 px (scrollWidth = clientWidth)');
    console.log('  ✓ Сенсорные зоны (кнопки, селекты, инпуты): все >= 44 px');
    console.log('  ✓ Чекбокс «Отметить как оплаченный»: ПОЛНОСТЬЮ ОТСУТСТВУЕТ (0 шт.)');
    console.log('  ✓ Палитра «Цвет карточки» (5 кружков): ПОЛНОСТЬЮ УДАЛЕНА (0 шт., цвет наследуется от клиента)');
    console.log('  ✓ Нативные <select>: ПОЛНОСТЬЮ ОТСУТСТВУЮТ (0 шт., используется .custom-select)');
    console.log('  ✓ Горизонтальный скролл страницы: ОТСУТСТВУЕТ (scrollWidth <= clientWidth)');
    console.log('ИТОГ: ВСЕ ТЕСТЫ ГЕОМЕТРИИ УСПЕШНО ПРОЙДЕНЫ (0 ОШИБОК)!');
  }

  // 2. Снятие скриншота
  console.log('\nДелаем скриншот высокого разрешения...');
  const ss = await sendCommand('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true
  });

  if (ss && ss.data) {
    const buffer = Buffer.from(ss.data, 'base64');
    
    // Путь 1: Корень проекта
    const rootPath = path.resolve(__dirname, '..', 'МАКЕТ_НОВЫЙ_ПРОЕКТ.png');
    fs.writeFileSync(rootPath, buffer);
    console.log('✓ Скриншот успешно сохранён в корень проекта:', rootPath);

    // Путь 2: Рабочий стол Ани
    const desktopPath = 'C:\\Users\\Admin\\Desktop\\МАКЕТ_НОВЫЙ_ПРОЕКТ.png';
    try {
      fs.writeFileSync(desktopPath, buffer);
      console.log('✓ Скриншот успешно скопирован на Рабочий стол Ани:', desktopPath);
    } catch (err) {
      console.warn('Предупреждение при записи на Desktop:', err.message);
    }
  } else {
    console.error('Не удалось получить данные скриншота от Chrome');
  }

  ws.close();
  chrome.kill();
  console.log('\nЗавершено успешно!');
}

main().catch(err => {
  console.error('Фатальная ошибка:', err);
  process.exit(1);
});
