const fs = require('fs');
let catalog = fs.readFileSync('макеты.html', 'utf8');
const preview = fs.readFileSync('main_screen.html', 'utf8');

// Extract the content of container from main_screen.html
const startContainer = preview.indexOf('<div class="container">');
const endContainer = preview.lastIndexOf('</div>\n\n</body>');
if (startContainer !== -1 && endContainer !== -1) {
  const containerHtml = preview.slice(startContainer, endContainer);
  
  // Extract CSS inside <style>
  const styleStart = preview.indexOf('<style>');
  const styleEnd = preview.indexOf('</style>');
  const extraStyles = preview.slice(styleStart + 7, styleEnd);

  const sectionToAppend = `
  <!-- ============================================================== -->
  <!-- ВЕРСИЯ: ГЛАВНЫЙ ЭКРАН «МОЙ МИР ♡» (БЕЗ ОБВОДОК, 3D-БУМАЖЕЧКИ)  -->
  <!-- ============================================================== -->
  <style>
  ${extraStyles}
  </style>

  <section style="margin-top: 60px; padding-top: 40px; border-top: 2px dashed #D5C2AF;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; font-size: 11px; font-weight: 900; padding: 4px 12px; border-radius: 8px; background: #2D5847; color: #fff; margin-bottom: 6px;">
        ★ ФИНАЛЬНАЯ ИТЕРАЦИЯ • БЕЗ РАМОК • СВЕТЛЫЕ 3D-БУМАЖЕЧКИ • КНОПКИ-СТРЕЛОЧКИ
      </span>
      <h2 style="font-size: 26px; font-weight: 900; color: #2F261D;">Главный экран: «Мой мир ♡»</h2>
      <p style="font-size: 13px; color: #726453; max-width: 700px; margin: 4px auto 0 auto;">
        Убраны все глухие рамки. Внутренние плашки сделаны светлыми и парящими. Добавлены тактильные круглые бумажные кнопочки-стрелочки «›».
      </p>
    </div>
    ${containerHtml}
    </div>
  </section>
  `;

  const bodyClose = catalog.lastIndexOf('</body>');
  if (bodyClose !== -1) {
    catalog = catalog.slice(0, bodyClose) + sectionToAppend + catalog.slice(bodyClose);
    fs.writeFileSync('макеты.html', catalog, 'utf8');
    console.log('Appended to catalog successfully. New length:', catalog.length);
  }
}
