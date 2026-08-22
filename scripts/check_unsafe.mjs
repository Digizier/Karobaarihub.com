import fs from 'fs';

const content = fs.readFileSync('app/admin/page.tsx', 'utf8');
const lines = content.split('\n');

const unsafePatterns = [
  /\.toLocaleString\(\)/,
  /\.map\(/,
  /\.filter\(/,
  /\.length/,
  /\.includes\(/,
  /\.toLowerCase\(\)/
];

lines.forEach((line, idx) => {
  unsafePatterns.forEach(pattern => {
    if (pattern.test(line) && !line.includes('?') && !line.includes('||')) {
      // Potentially unsafe if target is null/undefined
    }
  });
});

console.log("Checked file lines:", lines.length);
