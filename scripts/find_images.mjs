import fs from 'fs';

const content = fs.readFileSync('app/admin/page.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('<Image') || line.includes('src={')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
