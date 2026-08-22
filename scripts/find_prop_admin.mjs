import fs from 'fs';

const content = fs.readFileSync('app/admin/page.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('SaveProperty') || line.includes('adminSaveProperty') || line.includes('editingProperty')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
