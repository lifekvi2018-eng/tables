const fs = require('fs');
const path = require('path');

function testGoogleAuthMockup() {
  const filePath = path.join(__dirname, '..', 'google_auth_mockup.html');
  if (!fs.existsSync(filePath)) {
    console.error('FAIL: google_auth_mockup.html does not exist!');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  // Extract CSS blocks for property analysis
  const styleBlocks = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  const cssContent = styleBlocks.join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');

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
  if (cssContent.match(/:\s*white\b/i)) {
    errors.push('CSS rule with white found in file!');
  }

  // 3. Border check (Any border line rule other than border: none or border: 0)
  const borderMatches = cssContent.match(/border(?:-(?:top|bottom|left|right|width|style|color))?\s*:\s*([^;!}]+)/gi) || [];
  borderMatches.forEach(b => {
    const val = b.split(':')[1].trim().toLowerCase();
    if (val !== 'none' && !val.startsWith('0') && !val.includes('transparent')) {
      errors.push('Forbidden border line rule found: "' + b + '" — only border: none is allowed!');
    }
  });

  // 4. Password field check - STRICT 0 PASSWORDS
  if (content.includes('type="password"') || content.includes('type=\'password\'')) {
    errors.push('Forbidden password input field found! Passwords must be completely removed.');
  }
  if (content.match(/<input[^>]+name=['"]password['"]/i)) {
    errors.push('Forbidden password input tag found!');
  }

  // 5. Approved Colors check
  const requiredColors = [
    '#FAF2E7', // warm paper
    '#FCE8D5', // peach
    '#FDF1CC', // cream
    '#C8E2D2', // mint
    '#FCD6CF', // coral
    '#DCEEFE', // pastel blue
    '#2F261D', // dark text
    '#1E3F30', // mint text
    '#5B481D', // cream text
    '#58241B', // coral text
    '#113F6B'  // pastel blue text
  ];
  requiredColors.forEach(c => {
    if (!content.includes(c)) {
      errors.push('Missing required project color token: ' + c);
    }
  });

  // 6. Title and Subtitle check
  if (!content.includes('Мои таблицы ♡')) {
    errors.push('Missing required title: «Мои таблицы ♡»');
  }
  if (!content.includes('Личный финансовый органайзер')) {
    errors.push('Missing required subtitle: «Личный финансовый органайзер»');
  }

  // 7. Heart icon ♡ badge in #DCEEFE
  if (!content.includes('#DCEEFE') || !content.includes('gate-heart-badge')) {
    errors.push('Missing heart badge in #DCEEFE');
  }

  // 8. Owner Plaque check
  if (!content.includes('lifekvi2018@gmail.com')) {
    errors.push('Missing owner email lifekvi2018@gmail.com');
  }
  if (!content.includes('Аня') || !content.includes('Владелица')) {
    errors.push('Missing owner name "Аня" and tag "Владелица"');
  }

  // 9. Branded Google Button check
  if (!content.includes('Войти с Google')) {
    errors.push('Missing button text "Войти с Google"');
  }
  // Check 4 Google colors
  const googleColors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];
  googleColors.forEach(gc => {
    if (!content.includes(gc)) {
      errors.push('Missing official Google 4-color palette component: ' + gc);
    }
  });

  // 10. Checkbox «Запомнить меня на 30 дней» check
  if (!content.includes('Запомнить меня на 30 дней')) {
    errors.push('Missing checkbox «Запомнить меня на 30 дней»');
  }

  // 11. Phone 390x844 dimensions check
  if (!content.includes('390px') || !content.includes('844px')) {
    errors.push('Missing iPhone exact 390x844 frame dimensions in CSS');
  }

  // 12. Desktop window resilience check
  if (!content.includes('height: auto') || !content.includes('align-items: stretch')) {
    errors.push('Desktop window must have height: auto and align-items: stretch per Anya\'s Law');
  }

  // 13. Mobile Bottom navigation check (Strictly 4 icons, no text)
  const tabbarMatch = content.match(/<nav class="tabbar-box"[^>]*>([\s\S]*?)<\/nav>/);
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

  console.log('=== GOOGLE AUTH MOCKUP VALIDATION RESULTS ===');
  if (errors.length > 0) {
    console.error('FAIL: Found ' + errors.length + ' error(s):');
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  } else {
    console.log('SUCCESS: All 13 automated checks passed with 0 defects!');
    process.exit(0);
  }
}

testGoogleAuthMockup();
