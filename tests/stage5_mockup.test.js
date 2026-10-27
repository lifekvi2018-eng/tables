const fs = require('fs');

function testStage5Mockup() {
  const content = fs.readFileSync('stage5_auth_pwa_mockup.html', 'utf8');
  const errors = [];

  // Strip CSS and HTML comments for CSS property analysis
  const contentNoComments = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // 1. External dependencies check
  if (content.includes('fonts.googleapis.com') || content.includes('fonts.gstatic.com')) {
    errors.push('External Google Fonts CDN link found! Mockup must be standalone without external CDN.');
  }
  const externalLinks = content.match(/<(?:script|link)[^>]+(?:src|href)=['"]https?:[^'"]+['"][^>]*>/gi) || [];
  externalLinks.forEach(link => {
    errors.push('External CDN/resource link found: ' + link);
  });

  // 2. Pure white check (anywhere in code, CSS or attributes)
  if (content.match(/#ffffff\b/i)) {
    errors.push('Pure white #FFFFFF found in file!');
  }
  if (content.match(/#fff\b/i)) {
    errors.push('Short white #fff found in file!');
  }
  if (content.match(/rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/i)) {
    errors.push('rgb(255, 255, 255) found in file!');
  }
  if (content.match(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/i)) {
    errors.push('rgba(255, 255, 255, ...) found in file!');
  }
  if (contentNoComments.match(/:\s*white\b/i)) {
    errors.push('CSS rule with white found in file!');
  }

  // 3. Border check (Any border line rule other than border: none or border: 0)
  const borderMatches = contentNoComments.match(/border(?:-(?:top|bottom|left|right|width|style|color))?\s*:\s*([^;!}]+)/gi) || [];
  borderMatches.forEach(b => {
    const val = b.split(':')[1].trim().toLowerCase();
    if (val !== 'none' && !val.startsWith('0') && !val.includes('transparent')) {
      errors.push('Forbidden border line rule found: "' + b + '" — only border: none is allowed!');
    }
  });

  // 4. Mobile bottom nav check
  const tabbarMatch = content.match(/<div class="tabbar-box"[^>]*>([\s\S]*?)<\/div>/);
  if (!tabbarMatch) {
    errors.push('Missing .tabbar-box bottom navigation!');
  } else {
    const navContent = tabbarMatch[1];
    const stripped = navContent.replace(/<[^>]+>/g, '').trim();
    if (stripped.length > 0) {
      errors.push('Mobile bottom nav contains text under icons: "' + stripped + '" — should be pure icons!');
    }
    const btnCount = (navContent.match(/class="mob-tab-btn/g) || []).length;
    if (btnCount !== 4) {
      errors.push('Mobile bottom nav must have exactly 4 icon buttons, found ' + btnCount);
    }
  }

  // 5. Approved Colors check
  const requiredColors = [
    '#FAF2E7', // warm paper
    '#FCE8D5', // peach
    '#FDF1CC', // cream
    '#C8E2D2', // mint
    '#FCD6CF', // coral
    '#2F261D', // text dark
    '#1E3F30', // mint text
    '#5B481D', // cream text
    '#58241B'  // coral text
  ];
  requiredColors.forEach(c => {
    if (!content.includes(c)) {
      errors.push('Missing required project color token: ' + c);
    }
  });

  // 6. Google Gate Content check
  if (!content.includes('lifekvi2018@gmail.com')) {
    errors.push('Missing authorized email lifekvi2018@gmail.com');
  }
  if (!content.includes('Войти как Аня')) {
    errors.push('Missing primary button "Войти как Аня"');
  }
  if (!content.includes('Доступ ограничен. Это личное приложение только для lifekvi2018@gmail.com')) {
    errors.push('Missing forbidden email notice');
  }

  // 7. Sync Badge states check
  if (!content.includes('Синхронизировано с Google ✓')) {
    errors.push('Missing Sync Badge state: Синхронизировано с Google ✓');
  }
  if (!content.includes('Синхронизирую с Google...')) {
    errors.push('Missing Sync Badge state: Синхронизирую с Google...');
  }
  if (!content.includes('Нет связи с Google ✕')) {
    errors.push('Missing Sync Badge state: Нет связи с Google ✕');
  }

  // 8. PWA card check
  if (!content.includes('Добавить на экран «Домой»') && !content.includes('Добавить на экран "Домой"')) {
    errors.push('Missing PWA hint card title');
  }

  // 9. Phone frame dimensions check
  if (!content.includes('390px') || !content.includes('844px')) {
    errors.push('Missing iPhone 390x844 dimensions in css');
  }

  // 10. Desktop window resilience check
  if (!content.includes('height: auto') || !content.includes('align-items: stretch')) {
    errors.push('Desktop window must have height: auto and align-items: stretch per Anya\'s Law');
  }

  // 11. Nowrap and ellipsis
  if (!content.includes('white-space: nowrap') || !content.includes('text-overflow: ellipsis')) {
    errors.push('Missing nowrap or ellipsis rules for protecting button geometry');
  }

  console.log('=== STAGE 5 MOCKUP VALIDATION RESULTS ===');
  if (errors.length > 0) {
    console.error('FAIL: Found ' + errors.length + ' error(s):');
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  } else {
    console.log('SUCCESS: All 11 automated checks passed with 0 defects!');
    process.exit(0);
  }
}

testStage5Mockup();
