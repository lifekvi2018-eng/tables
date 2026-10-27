const fs = require('fs');

function checkMockup() {
  const html = fs.readFileSync('stage4_clients_mockup.html', 'utf8');
  const errors = [];

  // 1. Check mobile bottom navigation
  if (html.includes('Календарь') && html.includes('tabbar-box')) {
    const bottomNavSection = html.slice(html.indexOf('tabbar-box'), html.indexOf('tabbar-box') + 800);
    if (bottomNavSection.includes('Календарь')) {
      errors.push('Mobile bottom nav contains "Календарь" — should be strictly 4 items: Main, Income, Expenses, Clients!');
    }
  }

  // Check for text labels in mobile bottom nav
  const bottomNavMatch = html.match(/<div class=\"tabbar-box\"[^>]*>([\s\S]*?)<\/div>/);
  if (bottomNavMatch) {
    const navContent = bottomNavMatch[1];
    // Strip tags and title attributes
    const stripped = navContent.replace(/<[^>]+>/g, '').trim();
    if (stripped.length > 0) {
      errors.push('Mobile bottom nav has text labels under icons: "' + stripped + '" — should be pure icon buttons matching index.html!');
    }
    const buttonCount = (navContent.match(/class=\"mob-tab-btn/g) || []).length;
    if (buttonCount !== 4) {
      errors.push(`Mobile bottom nav has ${buttonCount} buttons instead of exactly 4!`);
    }
  }

  // 2. Check round action badges in dossier card headers (36x36px, 50% radius)
  if (!html.includes('slip-icon-badge') || !html.includes('36px')) {
    errors.push('Round paper icon badges (36x36px) in card headers are missing from the dossier!');
  }

  // Check that separate action icons row was removed per Anya's request
  if (html.includes('action-icons-row') && html.includes('${getActionIconsRowHtml')) {
    errors.push('Separate action-icons-row should be removed from under the header per Anya\'s request!');
  }

  // Check no WhatsApp link per Anya's request
  if (html.includes('contact-wa-link') && html.includes('💬 WhatsApp')) {
    errors.push('WhatsApp button should be removed from contacts per Anya\'s request!');
  }

  // Check no brown border on color choice in modal
  if (html.includes('box-shadow: 0 0 0 2.5px #5B481D') || html.includes('2px solid #5B481D')) {
    errors.push('Modal color choice still has brown border!');
  }

  // 3. Check phone nowrap
  if (!html.includes('white-space: nowrap') || !html.includes('contact-phone-big')) {
    const phoneStyle = html.match(/\.contact-phone-big[^{]*\{[^}]+\}/);
    if (phoneStyle && !phoneStyle[0].includes('nowrap')) {
      errors.push('Phone number does not have white-space: nowrap!');
    }
  }

  // 4. Check link ellipsis and pencil flex-shrink
  if (!html.includes('text-overflow: ellipsis') || !html.includes('link-item-main')) {
    errors.push('Link text does not have text-overflow: ellipsis!');
  }

  // 5. Check desktop-window flex
  const deskWinStyle = html.match(/\.desktop-window\s*\{[^}]+\}/);
  if (deskWinStyle) {
    const css = deskWinStyle[0];
    if (css.includes('height: fit-content') && !css.includes('height: auto')) {
      errors.push('desktop-window still has height: fit-content which causes overflow!');
    }
  }

  // 6. Check status colors
  const statusColors = ['#C8E2D2', '#FCD6CF', '#FDF1CC', '#EADBCC'];
  for (const c of statusColors) {
    if (!html.includes(c)) {
      errors.push(`Missing approved status color: ${c}`);
    }
  }

  console.log('=== LAYOUT SANITY CHECK RESULTS ===');
  if (errors.length > 0) {
    console.error('FAILED with ' + errors.length + ' error(s):');
    errors.forEach(e => console.error('- ' + e));
    process.exit(1);
  } else {
    console.log('ALL CHECKS PASSED: 0 layout defects detected!');
    process.exit(0);
  }
}

checkMockup();
