const fs = require('fs');

let html = fs.readFileSync('макеты.html', 'utf8');

// 1. Read accumulate_colors.js accumulatedSection
const accCode = fs.readFileSync('.scratch/accumulate_colors.js', 'utf8');
const accIdx = accCode.indexOf('const accumulatedSection = `');
const accEndIdx = accCode.lastIndexOf('`;');
const accumulatedSection = accCode.substring(accIdx + 'const accumulatedSection = `'.length, accEndIdx);

// 2. Read add_final_palette_to_master.js finalPaletteBlock
const finalCode = fs.readFileSync('.scratch/add_final_palette_to_master.js', 'utf8');
const finalIdx = finalCode.indexOf('const finalPaletteBlock = `');
const finalEndIdx = finalCode.lastIndexOf('`;');
const finalPaletteBlock = finalCode.substring(finalIdx + 'const finalPaletteBlock = `'.length, finalEndIdx);

// 3. Read add_peach_pink_to_master.js peachPinkSection
const peachCode = fs.readFileSync('.scratch/add_peach_pink_to_master.js', 'utf8');
const peachIdx = peachCode.indexOf('const peachPinkSection = `');
const peachEndIdx = peachCode.lastIndexOf('`;');
const peachPinkSection = peachCode.substring(peachIdx + 'const peachPinkSection = `'.length, peachEndIdx);

// 4. Read add_full_row_comparison_to_master.js newFullSection
const fullCode = fs.readFileSync('.scratch/add_full_row_comparison_to_master.js', 'utf8');
const fullIdx = fullCode.indexOf('const newFullSection = `');
const fullEndIdx = fullCode.lastIndexOf('`;');
const fullRowSection = fullCode.substring(fullIdx + 'const newFullSection = `'.length, fullEndIdx);

// Combine all in logical order:
// First: The 4 exact reference comparisons with full 7-color rows
// Second: The peach pink exploration (П1..П5)
// Third: The locked system palette (7 colors)
// Fourth: The accumulated catalog of past iterations (Варианты 1, 2, 3, бежевые)
const combined = `\n\n    ${fullRowSection}\n\n    ${finalPaletteBlock}\n\n    ${peachPinkSection}\n\n    ${accumulatedSection}\n\n    `;

const startIdx = html.indexOf('<!-- ПУДРОВЫЕ ЦВЕТА');
const endIdx = html.indexOf('<!-- РАЗДЕЛ 2. ПАЛИТРА ГРАДИЕНТОВ');

if (startIdx !== -1 && endIdx !== -1) {
  // Find the separator right before Раздел 2
  const sepIdx = html.lastIndexOf('<!-- =============================================================== -->', endIdx);
  const replaceEnd = sepIdx !== -1 ? sepIdx : endIdx;
  
  html = html.substring(0, startIdx) + combined + html.substring(replaceEnd);
  fs.writeFileSync('макеты.html', html, 'utf8');
  console.log('Successfully updated макеты.html with all accumulated sections!');
} else {
  console.log('Error: start or end marker not found! startIdx:', startIdx, 'endIdx:', endIdx);
}
